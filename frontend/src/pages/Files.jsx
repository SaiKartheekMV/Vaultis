import React, { useState, useEffect } from 'react';
import UploadForm from '../components/UploadForm';
import FileList from '../components/FileList';
import FileDetails from '../components/FileDetails';
import GrantAccess from '../components/GrantAccess';
import { getContract } from '../services/contract';

function Files() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Load user address from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserAddress(storedUser);
    }
  }, []);

  // Fetch accessible files from the smart contract
  const fetchFiles = async () => {
    try {
      const contract = await getContract();
      const result = await contract.getAccessibleFiles();
      const [fileIds, cids, owners, uploaders, timestamps] = result;

      const parsedFiles = fileIds.map((id, index) => ({
        id: Number(id),
        cid: cids[index],
        owner: owners[index],
        uploader: uploaders[index],
        timestamp: Number(timestamps[index]),
      }));

      setFiles(parsedFiles);
    } catch (error) {
      console.error('❌ Error fetching files:', error);
    }
  };

  useEffect(() => {
    if (userAddress) {
      fetchFiles();
    }
  }, [userAddress]);

  const handleFileUploaded = () => {
    fetchFiles();
  };

  const handleDelete = async (fileId) => {
    try {
      setDeleting(true);
      const contract = await getContract();
      const tx = await contract.deleteFile(fileId);
      await tx.wait();

      // Refresh file list
      setFiles(files.filter(file => file.id !== fileId));
      setSelectedFile(null);
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      alert('Delete failed. You may not have permission to delete this file.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="text-center mb-4">
        <h2 className="text-info">🌐 Vaultis Dashboard</h2>
        <p className="text-muted">Quantum-Secured Data Vault</p>
        <hr />
      </div>

      <UploadForm onUploadSuccess={handleFileUploaded} />

      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <FileList
            files={files}
            onSelect={setSelectedFile}
            onDelete={handleDelete}
            deleting={deleting}
          />
        </div>

        <div className="col-md-6">
          {selectedFile ? (
            <>
              <FileDetails file={selectedFile} />
              <GrantAccess fileId={selectedFile.id} />
            </>
          ) : (
            <div className="alert alert-secondary">
              Select a file to view details or grant access.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Files;
