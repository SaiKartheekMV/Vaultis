import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import UploadForm from '../components/uploadform';
import { getContract } from '../services/contract';

function Files() {
  const [files, setFiles] = useState([]);
  const [userAddress, setUserAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      // Process files logic removed as we're focusing on the UploadForm
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching files:', error);
      setError('Failed to load files. Please check your wallet connection and try again.');
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

  return (
    <Container className="mt-4 renaissance-container">
      <div className="text-center mb-4">
        <h2 className="renaissance-title">🌐 Vaultis Codex</h2>
        <p className="renaissance-subtitle">Quantum-Secured Blockchain Archives</p>
        <div className="renaissance-divider"></div>
      </div>

      {/* Only include the UploadForm component */}
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <UploadForm onUploadSuccess={handleFileUploaded} />
          
          {error && (
            <Alert variant="danger" className="mt-3 renaissance-alert" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {loading && (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" className="renaissance-spinner" />
              <p className="mt-2 renaissance-text">Illuminating the archives...</p>
            </div>
          )}
        </Col>
      </Row>

      {/* Add Renaissance-inspired footer */}
      <footer className="mt-5 text-center renaissance-footer">
        <p><em>"Simplicity is the ultimate sophistication."</em> - Leonardo da Vinci</p>
        <small>Secured by Quantum Cryptography & Blockchain Technology</small>
      </footer>
    </Container>
  );
}

export default Files;