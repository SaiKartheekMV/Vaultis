import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { LockOpen, Key, Database, Shield, FileDown } from 'lucide-react';

const QuantumFileDownloader = () => {
  const [cid, setCid] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [privateKeyId, setPrivateKeyId] = useState('');
  const [originalFilename, setOriginalFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fetchKeyLoading, setFetchKeyLoading] = useState(false);

  // API base URL - replace with your actual backend URL
  const API_BASE_URL = 'http://localhost:5000';

  // Function to fetch private key from backend using key ID
  const fetchPrivateKey = async () => {
    if (!privateKeyId) {
      setError('Please enter a private key ID');
      return;
    }

    try {
      setFetchKeyLoading(true);
      setError('');
      
      // Fixed: Using privateKeyId instead of keyName
      const response = await axios.get(`${API_BASE_URL}/api/private-key/${privateKeyId}`);
      
      if (response.data && response.data.private_key) {
        setPrivateKey(response.data.private_key);
        setSuccess('Private key retrieved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to retrieve private key');
      }
    } catch (err) {
      console.error('Error fetching private key:', err);
      setError(`Failed to fetch private key: ${err.response?.data?.error || err.message}`);
    } finally {
      setFetchKeyLoading(false);
    }
  };

  // Function to download and decrypt file
  const downloadAndDecryptFile = async () => {
    if (!cid) {
      setError('Please enter a CID');
      return;
    }

    if (!privateKey) {
      setError('Please enter or fetch a private key');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Make request to download-decrypt endpoint
      const response = await axios({
        url: `${API_BASE_URL}/api/download-decrypt`,
        method: 'POST',
        responseType: 'blob',
        data: {
          cid: cid,
          private_key: privateKey,
          original_filename: originalFilename || `decrypted-${cid.substring(0, 8)}`
        }
      });
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      
      // Use the original filename if provided, otherwise use a generated one
      const filename = originalFilename || `decrypted-${cid.substring(0, 8)}`;
      
      // Save the file using file-saver
      saveAs(blob, filename);
      
      setSuccess('File successfully downloaded and decrypted!');
    } catch (err) {
      console.error('Error downloading/decrypting file:', err);
      setError(`Failed to download and decrypt: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="quantum-downloader-container py-5" style={{
      background: '#0a0b1e',
      minHeight: '100vh',
      color: '#ffffff',
      backgroundImage: 'radial-gradient(circle at 10% 20%, #0f1128 0%, #0a0b1e 90%)'
    }}>
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="border-0 shadow-lg" style={{
            background: 'rgba(13, 17, 38, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(66, 99, 235, 0.2)',
            borderRadius: '12px'
          }}>
            <Card.Header className="text-center border-bottom border-secondary py-4" style={{
              background: 'linear-gradient(45deg, #0d1126, #121a3a)',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px'
            }}>
              <h1 style={{ 
                color: '#ff2155', 
                textShadow: '0 0 10px rgba(255, 33, 85, 0.7), 0 0 20px rgba(255, 33, 85, 0.5)',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}>
                <Shield className="me-2" size={32} />
                Quantum Secure File Downloader
              </h1>
              <p className="mb-0 mt-2" style={{ color: '#4263eb' }}>
                Retrieve and decrypt your blockchain-secured files with quantum protection
              </p>
            </Card.Header>

            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="mb-4" style={{
                  background: 'rgba(220, 53, 69, 0.1)',
                  border: '1px solid rgba(220, 53, 69, 0.3)',
                  color: '#ff6b81'
                }}>
                  <div className="d-flex align-items-center">
                    <div className="me-3">⚠️</div>
                    <div>{error}</div>
                  </div>
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="mb-4" style={{
                  background: 'rgba(40, 167, 69, 0.1)',
                  border: '1px solid rgba(40, 167, 69, 0.3)',
                  color: '#51cf66'
                }}>
                  <div className="d-flex align-items-center">
                    <div className="me-3">✅</div>
                    <div>{success}</div>
                  </div>
                </Alert>
              )}

              <Form>
                <Row className="mb-4 gx-4">
                  <Col md={12}>
                    <Card className="p-3 mb-4" style={{
                      background: 'rgba(9, 11, 30, 0.6)',
                      border: '1px solid rgba(255, 33, 85, 0.3)',
                      borderRadius: '8px'
                    }}>
                      <h5 style={{ color: '#ff2155' }}>
                        <Database className="me-2" />
                        IPFS Content Identifier
                      </h5>
                      <Form.Group className="mb-0">
                        <Form.Control
                          type="text"
                          placeholder="Enter the CID of your encrypted file"
                          value={cid}
                          onChange={(e) => setCid(e.target.value)}
                          style={{
                            background: 'rgba(13, 17, 23, 0.8)',
                            border: '1px solid #2e3860',
                            color: '#ffffff',
                            padding: '12px',
                            borderRadius: '6px'
                          }}
                        />
                        <Form.Text style={{ color: '#8b9eff' }}>
                          The Content Identifier (CID) received when you uploaded the file
                        </Form.Text>
                      </Form.Group>
                    </Card>
                  </Col>
                </Row>

                <Row className="gx-4">
                  <Col md={12}>
                    <Card className="p-3 mb-4" style={{
                      background: 'rgba(9, 11, 30, 0.6)',
                      border: '1px solid rgba(66, 99, 235, 0.3)',
                      borderRadius: '8px'
                    }}>
                      <h5 style={{ color: '#4263eb' }}>
                        <Key className="me-2" />
                        Kyber Private Key
                      </h5>
                      
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#8b9eff' }}>Option 1: Fetch key from server</Form.Label>
                        <div className="d-flex">
                          <Form.Control
                            type="text"
                            placeholder="Enter private key ID"
                            value={privateKeyId}
                            onChange={(e) => setPrivateKeyId(e.target.value)}
                            style={{
                              background: 'rgba(13, 17, 23, 0.8)',
                              border: '1px solid #2e3860',
                              color: '#ffffff',
                              padding: '10px',
                              borderRadius: '6px'
                            }}
                          />
                          <Button 
                            variant="outline-primary" 
                            onClick={fetchPrivateKey}
                            disabled={fetchKeyLoading || !privateKeyId}
                            className="ms-2"
                            style={{
                              borderColor: '#4263eb',
                              color: '#4263eb',
                              minWidth: '100px'
                            }}
                          >
                            {fetchKeyLoading ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              'Fetch Key'
                            )}
                          </Button>
                        </div>
                        <Form.Text style={{ color: '#8b9eff' }}>
                          The private key ID received during upload
                        </Form.Text>
                      </Form.Group>

                      <Form.Group>
                        <Form.Label style={{ color: '#8b9eff' }}>Option 2: Paste your private key</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          placeholder="Paste your Kyber private key here"
                          value={privateKey}
                          onChange={(e) => setPrivateKey(e.target.value)}
                          style={{
                            background: 'rgba(13, 17, 23, 0.8)',
                            border: '1px solid #2e3860',
                            color: '#ffffff',
                            padding: '12px',
                            borderRadius: '6px',
                            fontFamily: 'monospace'
                          }}
                        />
                      </Form.Group>
                    </Card>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label style={{ color: '#8b9eff' }}>Original Filename (Optional)</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Original filename (if known)"
                        value={originalFilename}
                        onChange={(e) => setOriginalFilename(e.target.value)}
                        style={{
                          background: 'rgba(13, 17, 23, 0.8)',
                          border: '1px solid #2e3860',
                          color: '#ffffff',
                          padding: '10px'
                        }}
                      />
                      <Form.Text style={{ color: '#8b9eff' }}>
                        If left blank, a generated filename will be used
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    onClick={downloadAndDecryptFile}
                    disabled={loading || !cid || !privateKey}
                    style={{
                      background: 'linear-gradient(135deg, #ff2155, #e6123d)',
                      border: 'none',
                      padding: '14px',
                      boxShadow: '0 5px 15px rgba(255, 33, 85, 0.4)',
                      fontWeight: 'bold',
                      letterSpacing: '1px'
                    }}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FileDown className="me-2" />
                        Download & Decrypt File
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>

            <Card.Footer className="text-center py-3" style={{
              background: 'linear-gradient(45deg, #0d1126, #121a3a)',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px',
              borderTop: '1px solid rgba(66, 99, 235, 0.2)'
            }}>
              <p className="mb-0 text-muted">
                <span style={{ color: '#4263eb' }}>Quantum Secure</span> | 
                <span style={{ color: '#ff2155' }}> Post-Quantum Cryptography</span> | 
                <span style={{ color: '#4263eb' }}> IPFS Powered</span>
              </p>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default QuantumFileDownloader;