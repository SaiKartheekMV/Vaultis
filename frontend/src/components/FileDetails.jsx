import React from 'react';

function FileDetails({ file }) {
  return (
    <div className="card mb-4 shadow border-info">
      <div className="card-body">
        <h5 className="card-title">📄 File Details</h5>
        <p><strong>CID:</strong> {file.cid}</p>
        <p><strong>Owner:</strong> {file.owner}</p>
        <p><strong>Uploader:</strong> {file.uploader}</p>
        <p><strong>Uploaded At:</strong> {new Date(file.timestamp * 1000).toLocaleString()}</p>
        <p><strong>Access Users:</strong></p>
        <ul className="list-group">
          {file.accessUsers.map((user, index) => (
            <li key={index} className="list-group-item">
              {user}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default FileDetails;
