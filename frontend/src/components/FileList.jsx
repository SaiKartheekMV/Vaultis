import React from 'react';

function FileList({ files, onSelect }) {
  return (
    <div className="card p-3 mb-3 shadow-sm border-success">
      <h5 className="text-success mb-3">🗃️ Stored Files</h5>
      {files.map((file, index) => (
        <div key={index} className="border-bottom py-2">
          <strong>{file.cid}</strong>
          <button className="btn btn-sm btn-outline-secondary float-end" onClick={() => onSelect(file)}>Details</button>
        </div>
      ))}
    </div>
  );
}

export default FileList;
