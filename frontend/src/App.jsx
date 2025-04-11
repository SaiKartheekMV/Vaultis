import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import FileList from './components/FileList';
import FileDetails from './components/FileDetails';
import GrantAccess from './components/GrantAccess';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);

  const mockFiles = [
    {
      cid: 'bafybeig7cidexampleexample',
      owner: '0x123...abc',
      uploader: '0x123...abc',
      timestamp: 1712832123,
      accessUsers: ['0x456...def', '0x789...ghi'],
    },
  ];

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5 text-primary display-6 fw-bold border-bottom pb-3">
        🌐 Vaultis – Quantum-Secure File Vault
      </h2>
      <UploadForm />
      <FileList files={mockFiles} onSelect={setSelectedFile} />
      {selectedFile && (
        <>
          <FileDetails file={selectedFile} />
          <GrantAccess fileId={1} />
        </>
      )}
    </div>
  );
}

export default App;
