import React, { useState } from 'react';
import UploadForm from '../components/UploadForm';
import FileList from '../components/FileList';
import FileDetails from '../components/FileDetails';
import GrantAccess from '../components/GrantAccess';

function Files() {
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
    <>
      <UploadForm />
      <FileList files={mockFiles} onSelect={setSelectedFile} />
      {selectedFile && (
        <>
          <FileDetails file={selectedFile} />
          <GrantAccess fileId={1} />
        </>
      )}
    </>
  );
}

export default Files;
