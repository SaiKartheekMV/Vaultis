import React from 'react';
import './FileList.css';

function FileList({ files, onSelect, onDelete, deleting, currentAddress }) {
  // Function to truncate CIDs for better display
  const truncateCid = (cid) => {
    if (!cid) return '';
    return cid.length > 16 ? `${cid.substring(0, 8)}...${cid.substring(cid.length - 8)}` : cid;
  };

  // Filter out invalid files (files with empty or placeholder CIDs)
  const validFiles = files.filter(file => {
    // Check if file has a valid CID (not empty and not a placeholder)
    const hasValidCid = file.cid && 
                       file.cid !== '0x0000000000000000000000000000000000000000' &&
                       !file.cid.startsWith('0x000000000');
    
    // Check if file has a valid timestamp
    const hasValidTimestamp = file.timestamp && parseInt(file.timestamp) > 0;
    
    return hasValidCid && hasValidTimestamp;
  });

  return (
    <div className="file-list-container">
      {/* Background pattern */}
      <div className="file-list-background">
        <svg width="100%" height="100%">
          <pattern id="fileListGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
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
            {validFiles.length}
          </span>
        </h3>
      </div>
      
      {/* Empty state */}
      {validFiles.length === 0 && (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <p className="empty-state-title">No encrypted files available</p>
          <p className="empty-state-subtitle">Upload a new file to begin quantum-secure storage</p>
        </div>
      )}
      
      {/* File list */}
      {validFiles.length > 0 && (
        <div className="file-list">
          <div className="file-list-content">
            {validFiles.map((file, index) => (
              <div 
                key={file.id || index} 
                className="file-item"
              >
                <div className="file-item-content">
                  <div className="file-info">
                    <div className="file-info-header">
                      <svg xmlns="http://www.w3.org/2000/svg" className="file-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <span className="file-cid" title={file.cid}>
                        {truncateCid(file.cid)}
                      </span>
                      {file.isOwner && (
                        <span className="owner-badge">
                          Owner
                        </span>
                      )}
                    </div>
                    <div className="file-date">
                      Added: {file.dateFormatted || new Date(file.timestamp * 1000).toLocaleString() || 'Unknown date'}
                    </div>
                  </div>
                  
                  <div className="file-actions">
                    <button
                      className="view-button"
                      onClick={() => onSelect(file)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      View
                    </button>
                    
                    {(file.isOwner || file.uploader?.toLowerCase() === currentAddress?.toLowerCase()) && (
                      <button
                        className="delete-button"
                        onClick={() => onDelete(file.id)}
                        disabled={deleting}
                      >
                        {deleting ? (
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
  );
}

export default FileList;