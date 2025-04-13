import React, { useState } from 'react';
import axios from 'axios';

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
    <div className="card p-3 mb-3 border-warning shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="text-warning mb-0">
          <span className="me-2">📄</span>
          File Details
        </h5>
        {isOwnerOrUploader && (
          <button 
            className="btn btn-sm btn-outline-primary" 
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Downloading...
              </>
            ) : (
              <>📥 Download</>
            )}
          </button>
        )}
      </div>
      
      {error && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          {error}
        </div>
      )}
      
      <div className="table-responsive">
        <table className="table table-sm">
          <tbody>
            <tr>
              <th style={{ width: '120px' }}>File CID:</th>
              <td className="text-break">
                <code>{file.cid}</code>
              </td>
            </tr>
            <tr>
              <th>Owner:</th>
              <td>
                <span className="badge bg-success me-2">Owner</span>
                <code title={file.owner}>{truncateAddress(file.owner)}</code>
                {file.owner?.toLowerCase() === currentAddress?.toLowerCase() && (
                  <span className="badge bg-info ms-2">You</span>
                )}
              </td>
            </tr>
            <tr>
              <th>Uploader:</th>
              <td>
                <span className="badge bg-primary me-2">Uploader</span>
                <code title={file.uploader}>{truncateAddress(file.uploader)}</code>
                {file.uploader?.toLowerCase() === currentAddress?.toLowerCase() && (
                  <span className="badge bg-info ms-2">You</span>
                )}
              </td>
            </tr>
            <tr>
              <th>Timestamp:</th>
              <td>{formatDate(file.timestamp)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-2 small text-muted">
        <div className="d-flex align-items-center">
          <span className="me-2">🔒</span>
          This file is encrypted with quantum-resistant Kyber algorithm.
        </div>
      </div>
    </div>
  );
}

export default FileDetails;