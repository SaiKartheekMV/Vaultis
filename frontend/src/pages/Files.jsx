import React, { useState, useEffect } from 'react';
import UploadForm from '../components/UploadForm';
import FileList from '../components/FileList';
import FileDetails from '../components/FileDetails';
import GrantAccess from '../components/GrantAccess';

function Files() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [userAddress, setUserAddress] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserAddress(storedUser);
    }
  }, []);

  // This will be replaced later with blockchain call
  const mockFiles = [
    {
      cid: 'bafybeig7cidexampleexample',
      owner: userAddress,
      uploader: userAddress,
      timestamp: 1712832123,
      accessUsers: ['0x456...def', '0x789...ghi'],
    },
  ];

  return (
    <div className="container mt-4">
      <div className="text-center mb-4">
        <h2 className="text-info">🌐 Vaultis Dashboard</h2>
        <p className="text-muted">Quantum-Secured Data Vault</p>
        <hr />
      </div>

      <UploadForm />

      <div className="row">
        <div className="col-md-6">
          <FileList files={mockFiles} onSelect={setSelectedFile} />
        </div>
        <div className="col-md-6">
          {selectedFile && (
            <>
              <FileDetails file={selectedFile} />
              <GrantAccess fileId={1} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Files;
