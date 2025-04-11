import React, { useState } from 'react';

function UploadForm() {
  const [file, setFile] = useState(null);

  const handleUpload = () => {
    if (!file) return alert('Please select a file!');
    alert(`Pretending to encrypt & upload file: ${file.name}`);
  };

  return (
    <div className="card mb-4 shadow">
      <div className="card-body">
        <h5 className="card-title">🔐 Upload & Encrypt File</h5>
        <input
          type="file"
          className="form-control mb-3"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button className="btn btn-primary" onClick={handleUpload}>
          Encrypt & Upload
        </button>
      </div>
    </div>
  );
}

export default UploadForm;
