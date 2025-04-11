import React from 'react';

function FileList({ files, onSelect }) {
  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <h5 className="card-title">📦 Uploaded Files</h5>
        <ul className="list-group">
          {files.map((file, index) => (
            <li
              key={index}
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              onClick={() => onSelect(file)}
              style={{ cursor: 'pointer' }}
            >
              {file.cid.slice(0, 10)}... — {file.owner.slice(0, 10)}...
              <span className="badge bg-secondary">{file.accessUsers.length} access</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default FileList;
