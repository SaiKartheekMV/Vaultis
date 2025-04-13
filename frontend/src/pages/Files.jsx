import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filterType, setFilterType] = useState('all'); // 'all', 'owned', 'shared'

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
      setLoading(true);
      setError(null);
      
      const contract = await getContract();
      const result = await contract.getAccessibleFiles();
      const [fileIds, cids, owners, uploaders, timestamps] = result;

      const parsedFiles = fileIds.map((id, index) => ({
        id: Number(id),
        cid: cids[index],
        owner: owners[index],
        uploader: uploaders[index],
        timestamp: Number(timestamps[index]),
        dateFormatted: new Date(Number(timestamps[index]) * 1000).toLocaleString(),
        isOwner: owners[index].toLowerCase() === userAddress.toLowerCase(),
        isUploader: uploaders[index].toLowerCase() === userAddress.toLowerCase(),
      }));

      // Sort by timestamp (newest first)
      parsedFiles.sort((a, b) => b.timestamp - a.timestamp);
      
      setFiles(parsedFiles);
    } catch (error) {
      console.error('❌ Error fetching files:', error);
      setError('Failed to load files. Please check your wallet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userAddress) {
      fetchFiles();
    }
  }, [userAddress, refreshTrigger]);

  const handleFileUploaded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDelete = async (fileId) => {
    try {
      setDeleting(true);
      const contract = await getContract();
      const tx = await contract.deleteFile(fileId);
      await tx.wait();

      // Refresh file list
      setFiles(files.filter(file => file.id !== fileId));
      if (selectedFile && selectedFile.id === fileId) {
        setSelectedFile(null);
      }
      
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      setError('Delete failed. You may not have permission to delete this file.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredFiles = () => {
    switch(filterType) {
      case 'owned':
        return files.filter(file => file.owner.toLowerCase() === userAddress.toLowerCase());
      case 'shared':
        return files.filter(file => 
          file.owner.toLowerCase() !== userAddress.toLowerCase() || 
          file.uploader.toLowerCase() !== userAddress.toLowerCase()
        );
      default:
        return files;
    }
  };

  return (
    <Container className="mt-4">
      <div className="text-center mb-4">
        <h2 className="text-info">🌐 Vaultis Dashboard</h2>
        <p className="text-muted">Quantum-Secured Data Vault</p>
        <hr />
      </div>

      <UploadForm onUploadSuccess={handleFileUploaded} />

      {error && (
        <Alert variant="danger" className="mt-3" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
        <h4>Your Files</h4>
        <div className="btn-group">
          <button 
            className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilterType('all')}
          >
            All Files
          </button>
          <button 
            className={`btn ${filterType === 'owned' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilterType('owned')}
          >
            My Files
          </button>
          <button 
            className={`btn ${filterType === 'shared' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilterType('shared')}
          >
            Shared
          </button>
        </div>
      </div>

      <Row className="mt-3">
        <Col md={6} className="mb-4">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading your files...</p>
            </div>
          ) : (
            <>
              {filteredFiles().length === 0 ? (
                <Alert variant="info">
                  No files found. {filterType !== 'all' && 'Try changing the filter or '} 
                  Upload a new file using the form above!
                </Alert>
              ) : (
                <FileList
                  files={filteredFiles()}
                  onSelect={setSelectedFile}
                  onDelete={handleDelete}
                  deleting={deleting}
                  currentAddress={userAddress}
                />
              )}
            </>
          )}
        </Col>

        <Col md={6}>
          {selectedFile ? (
            <>
              <FileDetails 
                file={selectedFile} 
                currentAddress={userAddress}
                onRefresh={() => setRefreshTrigger(prev => prev + 1)}
              />
              <GrantAccess 
                fileId={selectedFile.id} 
                currentAddress={userAddress}
                isOwner={selectedFile.owner.toLowerCase() === userAddress.toLowerCase()}
                onAccessGranted={() => setRefreshTrigger(prev => prev + 1)}
              />
            </>
          ) : (
            <div className="alert alert-info">
              <h5>📋 File Details</h5>
              <p>Select a file from the list to view details or manage access permissions.</p>
              <hr />
              <p className="mb-0">
                <small>
                  <strong>Tip:</strong> Files encrypted with quantum-resistant Kyber algorithm 
                  can only be decrypted with the corresponding private key.
                </small>
              </p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Files;