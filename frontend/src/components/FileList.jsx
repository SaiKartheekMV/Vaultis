import React from 'react';

function FileList({ files, onSelect, onDelete, deleting }) {
  return (
    <div className="card p-3 mb-3 shadow-sm border-success">
      <h5 className="text-success mb-3">🗃️ Stored Files</h5>
      {files.length === 0 && (
        <div className="text-muted">No files uploaded yet.</div>
      )}
      {files.map((file, index) => (
        <div key={index} className="border-bottom py-2 d-flex justify-content-between align-items-center">
          <div className="text-break me-2">
            <strong>{file.cid}</strong>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => onSelect(file)}
            >
              Details
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(file.id)}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FileList;
