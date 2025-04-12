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
    <div className="container">
      <h4 className="mb-3 text-primary">📁 Your Files</h4>
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

export default Files;
