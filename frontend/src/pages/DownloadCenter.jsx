import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Key, Database, Shield, FileDown } from 'lucide-react';

const QuantumFileDownloader = () => {
  const [cid, setCid] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [originalFilename, setOriginalFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const downloadAndDecryptFile = async () => {
    // Validate mandatory fields
    if (!cid || !cid.trim()) {
      setError('IPFS Content Identifier (CID) is required');
      return;
    }

    if (!privateKey || !privateKey.trim()) {
      setError('Kyber Private Key is required');
      return;
    }

    // Use the original filename if available, otherwise use default
    const downloadFilename = originalFilename.trim() || `decrypted-${cid.trim().substring(0, 8)}`;

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Step 1: Decrypt the file (backend will decrypt first, then send)
      const response = await axios.post(
        `${API_BASE_URL}/api/download-decrypt/${cid.trim()}`,
        {
          private_key: privateKey.trim(),
          original_filename: downloadFilename
        },
        {
          responseType: 'blob',  // Critical: ensures binary data handling
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Check if we got valid data back
      if (!response.data) {
        throw new Error("Received empty file data");
      }

      // Verify we have a Blob object (axios should return Blob when responseType is 'blob')
      if (!(response.data instanceof Blob)) {
        console.error('Response data is not a Blob!', typeof response.data, response.data);
        throw new Error("Invalid response format - expected binary blob data");
      }

      const fileBlob = response.data;

      if (fileBlob.size === 0) {
        throw new Error("Received empty file data");
      }

      console.log(`[✅] Received blob: ${fileBlob.size} bytes, type: ${fileBlob.type}`);
      
      // Verify blob contains binary data (read first bytes to check)
      const buffer = await fileBlob.slice(0, 4).arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
      console.log(`[🔍] First 4 bytes of received blob (hex): ${hex}`);
      
      // Detect actual file type from magic numbers
      let detectedType = null;
      let detectedExtension = null;
      
      if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
        console.log('[✅] Blob contains JPEG signature - binary data is correct!');
        detectedType = 'image/jpeg';
        detectedExtension = '.jpg';
      } else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
        console.log('[✅] Blob contains PNG signature - binary data is correct!');
        detectedType = 'image/png';
        detectedExtension = '.png';
      } else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
        console.log('[✅] Blob contains GIF signature - binary data is correct!');
        detectedType = 'image/gif';
        detectedExtension = '.gif';
      } else if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
        console.log('[✅] Blob contains WEBP signature - binary data is correct!');
        detectedType = 'image/webp';
        detectedExtension = '.webp';
      } else if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
        console.log('[✅] Blob contains PDF signature - binary data is correct!');
        detectedType = 'application/pdf';
        detectedExtension = '.pdf';
      } else {
        console.warn(`[⚠️] Unknown blob signature: ${hex} - will use filename extension`);
      }

      // Get MIME type - prioritize detected type from magic numbers
      let blobType = detectedType;
      
      // If not detected from magic numbers, try response headers
      if (!blobType) {
        const contentType = response.headers['content-type'] || response.headers['Content-Type'] || fileBlob.type;
        blobType = contentType;
      }
      
      // If still no content type, try to infer from filename extension
      if (!blobType || blobType === 'application/octet-stream') {
        const extension = downloadFilename.split('.').pop()?.toLowerCase();
        const mimeTypes = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp',
          'bmp': 'image/bmp',
          'ico': 'image/x-icon',
          'svg': 'image/svg+xml',
          'pdf': 'application/pdf',
          'txt': 'text/plain',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'xls': 'application/vnd.ms-excel',
          'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'zip': 'application/zip',
          'mp4': 'video/mp4',
          'mp3': 'audio/mpeg',
          'webm': 'video/webm',
          'ogg': 'audio/ogg'
        };
        blobType = mimeTypes[extension] || 'application/octet-stream';
      }

      // Create blob with correct MIME type
      const finalBlob = new Blob([fileBlob], { type: blobType });
      
      // Step 2: Trigger download with proper filename and type
      // Ensure filename has the correct extension based on detected or inferred type
      let finalFilename = downloadFilename;
      
      // If we detected the type from magic numbers, ensure correct extension
      if (detectedExtension) {
        const currentExtension = '.' + finalFilename.split('.').pop()?.toLowerCase();
        // If filename has wrong extension or no extension, fix it
        if (currentExtension !== detectedExtension) {
          // Remove wrong extension if exists
          if (finalFilename.includes('.')) {
            finalFilename = finalFilename.substring(0, finalFilename.lastIndexOf('.'));
          }
          // Add correct extension
          finalFilename = finalFilename + detectedExtension;
        }
      } else if (!finalFilename.includes('.')) {
        // If no extension detected and filename has no extension, try to infer from MIME type
        const extMap = {
          'image/jpeg': '.jpg',
          'image/png': '.png',
          'image/gif': '.gif',
          'image/webp': '.webp',
          'application/pdf': '.pdf',
          'text/plain': '.txt',
          'application/zip': '.zip'
        };
        const ext = extMap[blobType];
        if (ext) {
          finalFilename = finalFilename + ext;
        }
      }
      
      console.log(`[📥] Downloading as: ${finalFilename} with type: ${blobType}`);
      
      const url = window.URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      link.style.display = 'none';
      
      // Set type hint for the link
      link.type = blobType;
      
      // Append link to document, click it, then remove it
      document.body.appendChild(link);
      link.click();
      
      // Wait a bit before removing to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      setSuccess(`✅ File decrypted and downloaded successfully as: ${finalFilename}`);
      
      // Clear form after successful download
      setTimeout(() => {
        setCid('');
        setPrivateKey('');
        setOriginalFilename('');
        setSuccess('');
      }, 5000);
      
    } catch (err) {
      console.error('Error downloading/decrypting file:', err);
      let errorMessage = 'Failed to decrypt and download file';

      if (err.response) {
        errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'Could not connect to server. Is the backend running?';
      } else {
        errorMessage = err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
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

              <Form onSubmit={(e) => { e.preventDefault(); downloadAndDecryptFile(); }}>
                <Row className="mb-4">
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
                        <Form.Label style={{ color: '#8b9eff' }}>
                          IPFS Content Identifier (CID) <span style={{ color: '#ff6b81' }}>*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter the CID of your encrypted file"
                          value={cid}
                          onChange={(e) => setCid(e.target.value)}
                          required
                          style={{
                            background: 'rgba(13, 17, 23, 0.8)',
                            border: '1px solid #2e3860',
                            color: '#ffffff',
                            padding: '12px',
                            borderRadius: '6px'
                          }}
                        />
                        <Form.Text style={{ color: '#8b9eff' }}>
                          The Content Identifier (CID) received when you uploaded the file (required)
                        </Form.Text>
                      </Form.Group>
                    </Card>
                  </Col>
                </Row>

                <Row className="mb-4">
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
                      <Form.Group>
                        <Form.Label style={{ color: '#8b9eff' }}>
                          Kyber Private Key <span style={{ color: '#ff6b81' }}>*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          placeholder="Paste your Kyber private key here (saved during upload)"
                          value={privateKey}
                          onChange={(e) => setPrivateKey(e.target.value)}
                          required
                          style={{
                            background: 'rgba(13, 17, 23, 0.8)',
                            border: '1px solid #2e3860',
                            color: '#ffffff',
                            padding: '12px',
                            borderRadius: '6px',
                            fontFamily: 'monospace'
                          }}
                        />
                        <Form.Text style={{ color: '#8b9eff' }}>
                          Paste the private key you saved when uploading the file (required for decryption)
                        </Form.Text>
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
                        placeholder="e.g., myfile.png (optional - will auto-generate if not provided)"
                        value={originalFilename}
                        onChange={(e) => setOriginalFilename(e.target.value)}
                        style={{
                          background: 'rgba(13, 17, 23, 0.8)',
                          border: '1px solid #2e3860',
                          color: '#ffffff',
                          padding: '10px',
                          borderRadius: '6px'
                        }}
                      />
                      <Form.Text style={{ color: '#8b9eff' }}>
                        The original filename when you uploaded. If not provided, will use a default name.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-grid gap-2">
                  <Button 
                    type="submit"
                    variant="primary" 
                    size="lg" 
                    disabled={loading || !cid || !privateKey}
                    style={{
                      background: loading ? '#666' : 'linear-gradient(135deg, #ff2155, #e6123d)',
                      border: 'none',
                      padding: '14px',
                      boxShadow: loading ? 'none' : '0 5px 15px rgba(255, 33, 85, 0.4)',
                      fontWeight: 'bold',
                      letterSpacing: '1px',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Decrypting and Downloading...
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