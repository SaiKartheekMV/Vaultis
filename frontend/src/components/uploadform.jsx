import React, { useState } from 'react';

function UploadForm() {
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Upload & Encrypt Logic Here');
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 mb-4 shadow-sm border-info">
      <h5 className="mb-3 text-primary">📁 Upload Quantum-Secured File</h5>
      <input type="file" className="form-control mb-2" onChange={(e) => setFile(e.target.files[0])} />
      <button type="submit" className="btn btn-outline-primary">Upload</button>
    </form>
  );
}

export default UploadForm;
