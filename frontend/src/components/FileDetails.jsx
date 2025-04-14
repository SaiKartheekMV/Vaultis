import React, { useState } from 'react';
import axios from 'axios';
import './FileDetails.css'; // Import your CSS file for styles

function FileDetails({ file, currentAddress, onRefresh }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

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

  // Handle file download
  const handleDownload = async () => {
    if (!file || !file.cid) {
      setError('File information is incomplete');
      return;
    }

    try {
      setDownloading(true);
      setError('');
      
      // Call the API to download and decrypt the file
      const response = await axios.get(`http://localhost:5000/api/download/${file.cid}`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `file-${file.cid.substring(0, 8)}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError(error.response?.data?.error || 'Failed to download file. You may not have access.');
    } finally {
      setDownloading(false);
    }
  };

  // Check if user is owner or uploader
  const isOwnerOrUploader = 
    currentAddress && 
    file && 
    (file.owner?.toLowerCase() === currentAddress?.toLowerCase() || 
     file.uploader?.toLowerCase() === currentAddress?.toLowerCase());

  if (!file) return null;

  return (
    <div className="file-details-container">
      {/* Background pattern */}
      <div className="file-details-bg-pattern">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="1" fill="none" />
          <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="1" fill="none" />
          <circle cx="50" cy="50" r="20" stroke="white" strokeWidth="1" fill="none" />
        </svg>
      </div>
      
      {/* Header section */}
      <div className="file-details-header">
        <h3 className="file-details-title">
          <span className="file-details-icon-bg">
            <svg xmlns="http://www.w3.org/2000/svg" className="file-details-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </span>
          Quantum Encrypted File
        </h3>
        {isOwnerOrUploader && (
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
              {file.cid}
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