import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FileList.css';
import './FileDetails.css';

function FileManagement({ files = [], onSelect, onDelete, deleting, currentAddress, contract, onRefresh }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [accessList, setAccessList] = useState([]);
  const [isLoadingAccess, setIsLoadingAccess] = useState(false);
  const [fileCID, setFileCID] = useState(null);

  // Common utility functions
  const truncateCid = (cid) => {
    if (!cid) return '';
    return cid.length > 16 ? `${cid.substring(0, 8)}...${cid.substring(cid.length - 8)}` : cid;
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if user is owner or uploader of the file
  const isFileOwnerOrUploader = (file) => {
    return (
      file.isOwner || 
      file.owner?.toLowerCase() === currentAddress?.toLowerCase() ||
      (file.uploader && currentAddress && file.uploader.toLowerCase() === currentAddress.toLowerCase())
    );
  };

  // ======== FILE LIST FUNCTIONS ========
  // Handle selection
  const handleSelect = (file) => {
    setSelectedFile(file);
    setError(''); // Clear any previous errors
    if (onSelect && typeof onSelect === 'function') {
      onSelect(file);
    }
  };

  // Handle deletion
  const handleDelete = (fileId) => {
    if (onDelete && typeof onDelete === 'function') {
      setError('');
      onDelete(fileId);
    } else {
      console.warn('onDelete handler is not defined');
    }
  };

  // ======== FILE DETAILS FUNCTIONS ========
  // Fetch file CID from blockchain when needed
  const fetchFileCID = async () => {
    try {
      if (!contract) {
        throw new Error("Contract not provided");
      }
      
      if (!selectedFile || !selectedFile.id) {
        throw new Error("File ID not provided");
      }
      
      // If we already have the CID from the file prop, use that instead
      if (selectedFile && selectedFile.cid) {
        return selectedFile.cid;
      }
      
      // Call the contract's getCID function to get the CID
      const cid = await contract.methods.getCID(selectedFile.id).call({ from: currentAddress });
      return cid;
    } catch (error) {
      console.error("Error fetching CID:", error);
      setError("Failed to fetch file CID. You may not have access or the contract connection is not established.");
      return null;
    }
  };

  // Load access list
  const loadAccessList = async () => {
    if (!contract || !selectedFile || !selectedFile.id) {
      return;
    }
    
    setIsLoadingAccess(true);
    try {
      // Get file info which includes access users
      const fileInfo = await contract.methods.getFileInfo(selectedFile.id).call({ from: currentAddress });
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
      const cid = fileCID || selectedFile.cid || await fetchFileCID();
      
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
        errorMessage = error.response.data?.error || 
                      `Server error (${error.response.status}): ${error.response.statusText}`;
      } else if (error.request) {
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
      await contract.methods.grantAccess(selectedFile.id, addressInput)
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
      await contract.methods.revokeAccess(selectedFile.id, address)
        .send({ from: currentAddress });
      
      // Refresh the access list
      await loadAccessList();
      
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error revoking access:', error);
      setError(error.message || 'Failed to revoke access');
    }
  };

  // ======== EFFECTS ========
  // Effect to fetch CID and load access list when a file is selected
  useEffect(() => {
    if (selectedFile) {
      if (selectedFile.cid) {
        setFileCID(selectedFile.cid);
      } else if (contract && selectedFile.id && currentAddress) {
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
      
      if (selectedFile.id && contract && currentAddress) {
        loadAccessList();
      }
    }
  }, [selectedFile, contract, currentAddress]);

  // Check if user is owner of selected file
  const isOwner = 
    currentAddress && 
    selectedFile && 
    selectedFile.owner?.toLowerCase() === currentAddress?.toLowerCase();

  // Check if user has access to selected file
  const hasAccess = 
    currentAddress && 
    selectedFile && 
    (selectedFile.owner?.toLowerCase() === currentAddress?.toLowerCase() || 
     accessList.some(addr => addr.toLowerCase() === currentAddress?.toLowerCase()));

  // Close details view
  const handleBackToList = () => {
    setSelectedFile(null);
    setError('');
  };

  return (
    <div className="file-management-container">
      {!selectedFile ? (
        // FILE LIST VIEW
        <div className="file-list-container">
          {/* Background pattern */}
          <div className="file-list-background">
            <svg width="100%" height="100%">
              <pattern id="fileListGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#fileListGrid)" />
            </svg>
          </div>
          
          {/* Header */}
          <div className="file-list-header">
            <h3 className="file-list-title">
              <span className="file-list-icon-container">
                <svg xmlns="http://www.w3.org/2000/svg" className="file-list-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
              </span>
              Distributed Ledger Files
              <span className="file-count-badge">
                {Array.isArray(files) ? files.length : 0}
              </span>
            </h3>
          </div>
          
          {/* Empty state */}
          {(!Array.isArray(files) || files.length === 0) && (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="empty-state-title">No encrypted files available</p>
              <p className="empty-state-subtitle">Upload a new file to begin quantum-secure storage</p>
            </div>
          )}
          
          {/* File list */}
          {Array.isArray(files) && files.length > 0 && (
            <div className="file-list">
              <div className="file-list-content">
                {files.map((file, index) => (
                  <div 
                    key={file.id || file.cid || `file-${index}`} 
                    className="file-item"
                  >
                    <div className="file-item-content">
                      <div className="file-info">
                        <div className="file-info-header">
                          <svg xmlns="http://www.w3.org/2000/svg" className="file-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          
                          {/* File name if available */}
                          {(file.original_filename || file.name) && (
                            <span className="file-name">
                              {file.original_filename || file.name}
                            </span>
                          )}
                          
                          {/* CID display */}
                          <span className="file-cid" title={file.cid}>
                            {truncateCid(file.cid)}
                          </span>
                          
                          {/* Owner badge */}
                          {isFileOwnerOrUploader(file) && (
                            <span className="owner-badge">
                              Owner
                            </span>
                          )}
                        </div>
                        
                        <div className="file-date">
                          Added: {file.dateFormatted || formatDate(file.date || file.timestamp || Date.now())}
                        </div>
                      </div>
                      
                      <div className="file-actions">
                        <button
                          className="view-button"
                          onClick={() => handleSelect(file)}
                          disabled={!file || !file.cid}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          View
                        </button>
                        
                        {isFileOwnerOrUploader(file) && (
                          <button
                            className={`delete-button ${deleting === file.id || deleting === file.cid ? 'deleting' : ''}`}
                            onClick={() => handleDelete(file.id || file.cid)}
                            disabled={deleting || !file || (!file.id && !file.cid)}
                          >
                            {deleting === file.id || deleting === file.cid ? (
                              <>
                                <svg className="loading-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="loading-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="loading-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span>Remove</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Security info footer */}
          <div className="security-footer">
            <div className="security-icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" className="security-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="security-text">
              All files are encrypted with a post-quantum cryptographic algorithm and stored on decentralized storage.
            </div>
          </div>
        </div>
      ) : (
        // FILE DETAILS VIEW
        <div className="file-details-container">
          {/* Header section */}
          <div className="file-details-header">
            <button className="back-button" onClick={handleBackToList}>
              <svg xmlns="http://www.w3.org/2000/svg" className="back-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Files
            </button>
            
            <h3 className="file-details-title">
              <span className="file-details-icon-bg">
                <svg xmlns="http://www.w3.org/2000/svg" className="file-details-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </span>
              Quantum Encrypted File #{selectedFile.id}
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
                  {fileCID || selectedFile.cid || "Loading..."}
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
                      <span title={selectedFile.owner}>{truncateAddress(selectedFile.owner)}</span>
                      {selectedFile.owner?.toLowerCase() === currentAddress?.toLowerCase() && (
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
                      <span title={selectedFile.uploader}>{truncateAddress(selectedFile.uploader)}</span>
                      {selectedFile.uploader?.toLowerCase() === currentAddress?.toLowerCase() && (
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
                  {formatDate(selectedFile.timestamp)}
                </div>
              </div>
              
              {/* Original filename if available */}
              {(selectedFile.original_filename || selectedFile.name) && (
                <div>
                  <div className="details-label">Original Filename</div>
                  <div className="details-value-filename">
                    {selectedFile.original_filename || selectedFile.name}
                  </div>
                </div>
              )}
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
                          {address.toLowerCase() !== selectedFile.owner.toLowerCase() && (
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
      )}
    </div>
  );
}

export default FileManagement;