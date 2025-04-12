import React from 'react';

function FileDetails({ file }) {
  return (
    <div className="card p-3 mb-3 border-warning shadow-sm">
      <h5 className="text-warning">📄 File Details</h5>
      <p><strong>Owner:</strong> {file.owner}</p>
      <p><strong>Uploader:</strong> {file.uploader}</p>
      <p><strong>Timestamp:</strong> {new Date(file.timestamp * 1000).toLocaleString()}</p>
    </div>
  );
}

export default FileDetails;
