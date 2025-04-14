import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FileDetails.css'; // Import your CSS file for styles

function FileDetails({ file, fileId, currentAddress, contract, onRefresh }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [accessList, setAccessList] = useState([]);
  const [isLoadingAccess, setIsLoadingAccess] = useState(false);
  const [fileCID, setFileCID] = useState(null);

  // Function to truncate addresses
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // Fetch file CID from blockchain when needed
  const fetchFileCID = async () => {
    try {
      // For debugging - print values
      console.log("Contract:", contract);
      console.log("FileId:", fileId);
      console.log("Current Address:", currentAddress);
      
      if (!contract) {
        throw new Error("Contract not provided");
      }
      
      if (!fileId) {
        throw new Error("FileId not provided");
      }
      
      // If we already have the CID from the file prop, use that instead
      if (file && file.cid) {
        console.log("Using CID from file prop:", file.cid);
        return file.cid;
      }
      
      // Call the contract's getCID function to get the CID
      console.log("Fetching CID from blockchain...");
      const cid = await contract.methods.getCID(fileId).call({ from: currentAddress });
      console.log("CID fetched:", cid);
      return cid;
    } catch (error) {
      console.error("Error fetching CID:", error);
      setError("Failed to fetch file CID. You may not have access or the contract connection is not established.");
      return null;
    }
  };

  // Load access list
  const loadAccessList = async () => {
    if (!contract || !fileId) {
      console.log("Cannot load access list - missing contract or fileId");
      return;
    }
    
    setIsLoadingAccess(true);
    try {
      // Get file info which includes access users
      const fileInfo = await contract.methods.getFileInfo(fileId).call({ from: currentAddress });
      setAccessList(fileInfo.accessUsers || []);
    } catch (error) {
      console.error("Error loading access list:", error);
      setError("Failed to load access list. Please check your connection.");
    } finally {
      setIsLoadingAccess(false);
    }
  };

  // Handle file download
  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError('');
      
      // First, get the CID from the blockchain or use the one we have
      const cid = fileCID || await fetchFileCID();
      
      if (!cid) {
        setError('Could not retrieve file CID. Access may have been revoked or the contract connection is not established.');
        setDownloading(false);
        return;
      }
      
      // Now download the file using the CID
      console.log("Downloading file with CID:", cid);
      
      // Configure axios with CORS settings
      const axiosConfig = {
        responseType: 'blob',
        headers: {
          'Accept': 'application/octet-stream',
        },
        withCredentials: false // Important for CORS
      };
      
      const response = await axios.get(`http://localhost:5000/api/download/${cid}`, axiosConfig);
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `file-${cid.substring(0, 8)}`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up the DOM element
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('Download error:', error);
      
      let errorMessage = 'Failed to download file.';
      
      // Handle specific error types
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Check if the server is running and CORS is properly configured.';
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.error || 
                      `Server error (${error.response.status}): ${error.response.statusText}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Check if the backend is running.';
      }
      
      setError(errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  // Grant access to another user
  const handleGrantAccess = async (event) => {
    event.preventDefault();
    const addressInput = event.target.elements.userAddress.value;
    
    if (!addressInput || !addressInput.startsWith('0x')) {
      setError('Please enter a valid Ethereum address');
      return;
    }
    
    try {
      setError('');
      // Call the contract's grantAccess function
      await contract.methods.grantAccess(fileId, addressInput)
        .send({ from: currentAddress });
      
      // Refresh the access list
      await loadAccessList();
      
      // Clear the input
      event.target.reset();
      
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error granting access:', error);
      setError(error.message || 'Failed to grant access');
    }
  };

  // Revoke access from a user
  const handleRevokeAccess = async (address) => {
    try {
      setError('');
      // Call the contract's revokeAccess function
      await contract.methods.revokeAccess(fileId, address)
        .send({ from: currentAddress });
      
      // Refresh the access list
      await loadAccessList();
      
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error revoking access:', error);
      setError(error.message || 'Failed to revoke access');
    }
  };

  // Check if user is owner
  const isOwner = 
    currentAddress && 
    file && 
    file.owner?.toLowerCase() === currentAddress?.toLowerCase();

  // Check if user has access
  const hasAccess = 
    currentAddress && 
    file && 
    (file.owner?.toLowerCase() === currentAddress?.toLowerCase() || 
     accessList.some(addr => addr.toLowerCase() === currentAddress?.toLowerCase()));

  // Effect to fetch CID when component loads
  useEffect(() => {
    if (file && file.cid) {
      // If we already have CID in the file prop, store it
      setFileCID(file.cid);
    } else if (contract && fileId && currentAddress) {
      // Otherwise fetch it from the blockchain
      (async () => {
        try {
          const cid = await fetchFileCID();
          if (cid) {
            setFileCID(cid);
          }
        } catch (error) {
          console.error("Error fetching CID in useEffect:", error);
        }
      })();
    }
  }, [file, contract, fileId, currentAddress]);

  // Effect to load access list when component loads
  useEffect(() => {
    if (file && fileId && contract && currentAddress) {
      loadAccessList();
    }
  }, [file, fileId, contract, currentAddress]);

  if (!file) {
    return <div className="file-details-container">No file data available</div>;
  }

  return (
    <div className="file-details-container">
      {/* Header section */}
      <div className="file-details-header">
        <h3 className="file-details-title">
          <span className="file-details-icon-bg">
            <svg xmlns="http://www.w3.org/2000/svg" className="file-details-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </span>
          Quantum Encrypted File #{fileId}
        </h3>
        {hasAccess && (
          <button 
            className="btn-download"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <svg className="loader" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Decrypting...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="download-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Access File
              </>
            )}
          </button>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="error-message" role="alert">
          <div className="flex">
            <svg className="error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* File details content */}
      <div className="file-details-content">
        <div className="details-grid">
          {/* File CID */}
          <div>
            <div className="details-label">File CID</div>
            <div className="details-value-cid">
              {fileCID || file.cid || "Loading..."}
            </div>
          </div>
          
          {/* Owner & Uploader sections */}
          <div className="details-columns">
            {/* Owner */}
            <div>
              <div className="details-label">Owner</div>
              <div className="address-container">
                <span className="badge-role badge-owner">Owner</span>
                <div className="details-value-address address-owner">
                  <span title={file.owner}>{truncateAddress(file.owner)}</span>
                  {file.owner?.toLowerCase() === currentAddress?.toLowerCase() && (
                    <span className="badge-user">You</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Uploader */}
            <div>
              <div className="details-label">Uploader</div>
              <div className="address-container">
                <span className="badge-role badge-uploader">Uploader</span>
                <div className="details-value-address address-uploader">
                  <span title={file.uploader}>{truncateAddress(file.uploader)}</span>
                  {file.uploader?.toLowerCase() === currentAddress?.toLowerCase() && (
                    <span className="badge-user">You</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Timestamp */}
          <div>
            <div className="details-label">Timestamp</div>
            <div className="details-value-timestamp">
              {formatDate(file.timestamp)}
            </div>
          </div>
        </div>
        
        {/* Access control section - only shown to owner */}
        {isOwner && (
          <div className="access-control-section">
            <h4 className="access-control-title">Access Control</h4>
            
            {/* Grant access form */}
            <form onSubmit={handleGrantAccess} className="grant-access-form">
              <input 
                type="text" 
                name="userAddress" 
                placeholder="Enter ethereum address to grant access"
                className="address-input"
                required
              />
              <button type="submit" className="btn-grant-access">
                <svg xmlns="http://www.w3.org/2000/svg" className="grant-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 6a3 3 0 11-6 0 3 3 0 016 0zM14 17a6 6 0 00-12 0h12z" />
                  <path d="M13 8a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V9a1 1 0 011-1z" />
                </svg>
                Grant Access
              </button>
            </form>
            
            {/* Access list */}
            <div className="access-list">
              <h5 className="access-list-title">Users with Access</h5>
              {isLoadingAccess ? (
                <div className="loading-access">Loading access list...</div>
              ) : accessList.length > 0 ? (
                <ul className="user-access-list">
                  {accessList.map((address, index) => (
                    <li key={index} className="user-access-item">
                      <span className="user-address">{truncateAddress(address)}</span>
                      {/* Don't show revoke button for owner */}
                      {address.toLowerCase() !== file.owner.toLowerCase() && (
                        <button 
                          onClick={() => handleRevokeAccess(address)}
                          className="btn-revoke-access"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="revoke-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Revoke
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-access">No additional users have access</div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Security info footer */}
      <div className="security-footer">
        <div className="security-icon">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="security-text">
          This file is protected using post-quantum Kyber cryptography for maximum security against quantum computing attacks.
        </div>
      </div>
    </div>
  );
}

export default FileDetails;