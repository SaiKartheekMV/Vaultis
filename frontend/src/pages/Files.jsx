import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';
import UploadForm from '../components/UploadForm';
import FileManagement from '../pages/FileManagement';
import { getContract } from '../services/contract';

function Files() {
  const [files, setFiles] = useState([]);
  const [userAddress, setUserAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deletingFile, setDeletingFile] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');

  // Load user address from localStorage or MetaMask
  useEffect(() => {
    const loadUserAddress = async () => {
      try {
        // Try to get from localStorage first
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUserAddress(storedUser);
          return;
        }
        
        // Otherwise try to get from MetaMask
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) {
            setUserAddress(accounts[0]);
            localStorage.setItem('user', accounts[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load user address:', error);
        setError('Please connect your wallet to access encrypted files.');
      }
    };
    
    loadUserAddress();
  }, []);

  // Fetch accessible files from the smart contract
  const fetchFiles = async () => {
    if (!userAddress) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const contract = await getContract();
      
      // Get all file IDs accessible to the user
      const fileIds = await contract.getAccessibleFiles({ from: userAddress });
      
      // Fetch complete information for each file
      const filesData = await Promise.all(
        fileIds.map(async (fileId) => {
          try {
            const fileInfo = await contract.getFileInfo(fileId, { from: userAddress });
            const cid = await contract.getCID(fileId, { from: userAddress });
            
            return {
              id: fileId.toString(),
              cid: cid,
              owner: fileInfo.owner,
              uploader: fileInfo.uploader,
              timestamp: Number(fileInfo.timestamp),
              dateFormatted: new Date(Number(fileInfo.timestamp) * 1000).toLocaleString(),
              isOwner: fileInfo.owner.toLowerCase() === userAddress.toLowerCase()
            };
          } catch (error) {
            console.error(`Error fetching details for file ${fileId}:`, error);
            return null;
          }
        })
      );
      
      // Filter out any null values from failed requests
      setFiles(filesData.filter(file => file !== null));
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching files:', error);
      setError('Failed to load files. Please check your wallet connection and try again.');
      setLoading(false);
    }
  };

  // Fetch files whenever address changes or after file operations
  useEffect(() => {
    if (userAddress) {
      fetchFiles();
    }
  }, [userAddress, refreshTrigger]);

  // Handle file upload success - refresh file list
  const handleFileUploaded = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('files'); // Switch to files tab after successful upload
  };

  // Handle file selection
  const handleSelectFile = (file) => {
    // This will be passed to FileManagement component
    console.log('Selected file:', file);
  };

  // Handle file deletion
  const handleDeleteFile = async (fileId) => {
    if (!fileId || !userAddress) return;
    
    try {
      setDeletingFile(fileId);
      setError(null);
      
      const contract = await getContract();
      const tx = await contract.deleteFile(fileId, { from: userAddress });
      await tx.wait();
      
      // Refresh file list after deletion
      setRefreshTrigger(prev => prev + 1);
      setDeletingFile(null);
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete file. Please try again.');
      setDeletingFile(null);
    }
  };

  return (
    <Container className="mt-4 renaissance-container">
      <div className="text-center mb-4">
        <h2 className="renaissance-title">🌐 Vaultis Codex</h2>
        <p className="renaissance-subtitle">Quantum-Secured Blockchain Archives</p>
        <div className="renaissance-divider"></div>
      </div>

      {!userAddress ? (
        <Alert variant="warning" className="mb-4">
          Please connect your wallet to access encrypted files.
        </Alert>
      ) : (
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Nav variant="tabs" className="mb-3 renaissance-tabs">
            <Nav.Item>
              <Nav.Link 
                eventKey="upload" 
                className="d-flex align-items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="me-2" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                </svg>
                Upload New File
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="files" 
                className="d-flex align-items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="me-2" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4H2.19zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707z"/>
                </svg>
                My Files
                <span className="ms-2 badge bg-primary rounded-pill">{files.length}</span>
              </Nav.Link>
            </Nav.Item>
          </Nav>
          
          <Tab.Content>
            <Tab.Pane eventKey="upload">
              <Row className="justify-content-center">
                <Col md={10} lg={8}>
                  <UploadForm onUploadSuccess={handleFileUploaded} />
                </Col>
              </Row>
            </Tab.Pane>
            
            <Tab.Pane eventKey="files">
              {error && (
                <Alert variant="danger" className="mt-3 renaissance-alert" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
              
              {loading ? (
                <div className="text-center p-5">
                  <Spinner animation="border" variant="primary" className="renaissance-spinner" />
                  <p className="mt-2 renaissance-text">Illuminating the archives...</p>
                </div>
              ) : (
                <FileManagement 
                  files={files}
                  onSelect={handleSelectFile}
                  onDelete={handleDeleteFile}
                  deleting={deletingFile}
                  currentAddress={userAddress}
                  contract={getContract()}
                  onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                />
              )}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      )}

      <footer className="mt-5 text-center renaissance-footer">
        <p><em>"Simplicity is the ultimate sophistication."</em> - Leonardo da Vinci</p>
        <small>Secured by Quantum Cryptography & Blockchain Technology</small>
      </footer>
    </Container>
  );
}

export default Files;