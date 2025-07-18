import React, { useState, useRef } from 'react';
import { getContract } from '../services/contract';
import axios from 'axios';

function UploadForm({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [cid, setCid] = useState('');
  const [kyberPublicKey, setKyberPublicKey] = useState('');
  const [kyberPrivateKey, setKyberPrivateKey] = useState(''); // Add state for private key
  const [encryptedHash, setEncryptedHash] = useState('');
  const [uploading, setUploading] = useState(false);
  const [privateKeyWarning, setPrivateKeyWarning] = useState(''); // Add state for warning message
  const fileInputRef = useRef();

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      return setStatus('❌ Please select a file first.');
    }

    try {
      if (!window.ethereum) {
        return setStatus("❌ MetaMask not detected.");
      }

      setUploading(true);
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      setStatus('🔐 Encrypting and uploading file to IPFS...');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:5000/api/encrypt-upload', formData);
      console.log("Response from server:", response.data);
      console.log("Public key type:", typeof response.data.kyber_public_key);
      console.log("Public key value:", response.data.kyber_public_key);

      const { 
        cid, 
        kyber_public_key, 
        encrypted_hash, 
        private_key, // Get private key from response
        private_key_warning // Get warning message
      } = response.data;

      setCid(cid);
      setKyberPublicKey(kyber_public_key);
      setKyberPrivateKey(private_key); // Store private key in state
      setPrivateKeyWarning(private_key_warning || "IMPORTANT: Save this private key immediately. It will be deleted from our servers and cannot be recovered."); // Store warning
      setEncryptedHash(encrypted_hash);
      setStatus(`✅ Uploaded to IPFS! CID: ${cid}\n⏳ Saving CID to blockchain...`);

      // Save CID to blockchain
      const contract = await getContract();
      const tx = await contract.uploadFile(cid);
      await tx.wait();

      setStatus('✅ File fully uploaded and saved to blockchain!');
      setFile(null);
      fileInputRef.current.value = null;

      if (onUploadSuccess) onUploadSuccess();

    } catch (error) {
      console.error(error);

      if (error?.message?.toLowerCase().includes('user rejected')) {
        setStatus('❌ Transaction rejected by user.');
      } else if (error?.response?.data?.error) {
        setStatus(`❌ Server error: ${error.response.data.error}`);
      } else {
        setStatus('❌ Upload or blockchain interaction failed.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadPrivateKey = () => {
    // Create a blob with the private key
    const blob = new Blob([kyberPrivateKey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quantum_private_key.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card border-0 p-0 mb-4 shadow-lg overflow-hidden" style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      borderRadius: '12px',
    }}>
      {/* Header with quantum-themed gradient */}
      <div className="p-4" style={{
        background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)',
        borderBottom: '1px solid rgba(12, 235, 243, 0.3)',
      }}>
        <div className="d-flex align-items-center">
          <div className="me-3 p-2 rounded-circle" style={{
            background: 'rgba(12, 235, 243, 0.15)',
            boxShadow: '0 0 10px rgba(12, 235, 243, 0.3)',
          }}>
            <span style={{ fontSize: '1.25rem' }}>🔐</span>
          </div>
          <h4 className="mb-0" style={{ 
            background: 'linear-gradient(90deg, #ffffff, #0cebf3)', 
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'monospace',
            letterSpacing: '1px'
          }}>
            QUANTUM-SECURED UPLOAD
          </h4>
        </div>
      </div>
      
      <div className="p-4">
        <form onSubmit={handleUpload}>
          <div className="mb-3">
            <label className="form-label text-dark fw-bold mb-2">
              <span className="me-2">📄</span>
              Select File for Quantum Encryption
            </label>
            <div className="input-group">
              <input
                type="file"
                ref={fileInputRef}
                className="form-control form-control-lg border-2"
                onChange={(e) => setFile(e.target.files[0])}
                disabled={uploading}
                style={{
                  borderColor: 'rgba(12, 235, 243, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }}
              />
              <button 
                type="submit" 
                className="btn btn-lg text-white"
                disabled={uploading || !file}
                style={{
                  background: 'linear-gradient(90deg, #0cebf3, #7367f0)',
                  minWidth: '180px',
                  boxShadow: '0 4px 6px rgba(12, 235, 243, 0.2)',
                  transition: 'all 0.3s ease',
                }}
              >
                {uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-upload me-2"></i> Encrypt & Upload
                  </>
                )}
              </button>
            </div>
            {file && (
              <div className="mt-2 small text-muted d-flex align-items-center">
                <span className="badge me-2" style={{ 
                  background: 'linear-gradient(45deg, #0cebf3, #7367f0)',
                  fontSize: '10px',
                }}>
                  SELECTED
                </span>
                <strong>{file.name}</strong> <span className="ms-2">({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
            )}
          </div>
        </form>

        {status && (
          <div className={`alert ${status.includes('❌') ? 'alert-danger' : 'alert-info'} mt-3 border-0 shadow-sm`} 
            role="alert"
            style={{
              borderLeft: status.includes('❌') ? '4px solid #dc3545' : '4px solid #0cebf3',
              backgroundColor: status.includes('❌') ? 'rgba(220, 53, 69, 0.1)' : 'rgba(12, 235, 243, 0.1)',
            }}
          >
            {status}
          </div>
        )}

        {cid && (
          <div className="mt-4 rounded-lg p-0 overflow-hidden" style={{
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(12, 235, 243, 0.2)',
          }}>
            {/* Results Header */}
            <div className="p-3" style={{
              background: 'linear-gradient(90deg, rgba(12, 235, 243, 0.1) 0%, rgba(115, 103, 240, 0.1) 100%)',
              borderBottom: '1px solid rgba(12, 235, 243, 0.2)',
            }}>
              <div className="d-flex align-items-center">
                <div className="me-2" style={{ color: '#0cebf3' }}>⚛️</div>
                <h6 className="mb-0 fw-bold" style={{ color: '#16213e' }}>QUANTUM ENCRYPTION RESULTS</h6>
              </div>
            </div>
            
            {/* Results Content */}
            <div className="p-3 bg-white">
              {/* Private Key - New Section */}
              {kyberPrivateKey && (
                <div className="mb-3 pb-3" style={{ 
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                }}>
                  <div className="alert alert-warning border-0 p-2 mb-2" style={{
                    background: 'rgba(255, 193, 7, 0.1)',
                    borderLeft: '4px solid #ffc107',
                  }}>
                    <div className="d-flex">
                      <span className="me-2">⚠️</span>
                      <strong>{privateKeyWarning}</strong>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <span className="me-2" style={{ 
                        color: '#dc3545', 
                        filter: 'drop-shadow(0 0 2px rgba(220, 53, 69, 0.5))'
                      }}>🔑</span>
                      <strong className="text-dark">YOUR PRIVATE KEY (REQUIRED FOR DECRYPTION)</strong>
                    </div>
                    <div>
                      <button 
                        className="btn btn-sm me-2" 
                        onClick={() => navigator.clipboard.writeText(kyberPrivateKey)}
                        title="Copy to clipboard"
                        style={{
                          background: 'rgba(220, 53, 69, 0.1)',
                          border: '1px solid rgba(220, 53, 69, 0.3)',
                          color: '#dc3545',
                        }}
                      >
                        <span className="me-1">📋</span> Copy
                      </button>
                      <button 
                        className="btn btn-sm" 
                        onClick={handleDownloadPrivateKey}
                        title="Download private key"
                        style={{
                          background: 'rgba(220, 53, 69, 0.1)',
                          border: '1px solid rgba(220, 53, 69, 0.3)',
                          color: '#dc3545',
                        }}
                      >
                        <span className="me-1">💾</span> Download
                      </button>
                    </div>
                  </div>
                  <div className="p-2 rounded" style={{
                    background: 'rgba(220, 53, 69, 0.03)',
                    border: '1px solid rgba(220, 53, 69, 0.2)',
                    wordBreak: 'break-all',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: '#dc3545',
                    maxHeight: '150px',
                    overflowY: 'auto',
                  }}>
                    {kyberPrivateKey}
                  </div>
                </div>
              )}
              
              {/* CID */}
              <div className="mb-3 pb-3" style={{ 
                borderBottom: '1px solid rgba(0,0,0,0.05)',
              }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <span className="me-2" style={{ 
                      color: '#0cebf3', 
                      filter: 'drop-shadow(0 0 2px rgba(12, 235, 243, 0.5))'
                    }}>📦</span>
                    <strong className="text-dark">IPFS Content ID</strong>
                  </div>
                  <button 
                    className="btn btn-sm" 
                    onClick={() => navigator.clipboard.writeText(cid)}
                    title="Copy to clipboard"
                    style={{
                      background: 'rgba(12, 235, 243, 0.1)',
                      border: '1px solid rgba(12, 235, 243, 0.3)',
                      color: '#16213e',
                    }}
                  >
                    <span className="me-1">📋</span> Copy
                  </button>
                </div>
                <div className="p-2 rounded" style={{
                  background: 'rgba(22, 33, 62, 0.03)',
                  border: '1px solid rgba(22, 33, 62, 0.1)',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  color: '#dc3545',
                }}>
                  {cid}
                </div>
              </div>
              
              {/* Kyber Public Key */}
              <div className="mb-3 pb-3" style={{ 
                borderBottom: '1px solid rgba(0,0,0,0.05)',
              }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <span className="me-2" style={{ color: '#0cebf3' }}>🔑</span>
                    <strong className="text-dark">Post-Quantum Kyber Public Key</strong>
                  </div>
                  {kyberPublicKey && (
                    <button 
                      className="btn btn-sm" 
                      onClick={() => navigator.clipboard.writeText(kyberPublicKey)}
                      title="Copy to clipboard"
                      style={{
                        background: 'rgba(12, 235, 243, 0.1)',
                        border: '1px solid rgba(12, 235, 243, 0.3)',
                        color: '#16213e',
                      }}
                    >
                      <span>📋</span>
                    </button>
                  )}
                </div>
                <div className="position-relative p-2 rounded" style={{
                  background: 'rgba(22, 33, 62, 0.03)',
                  border: '1px solid rgba(22, 33, 62, 0.1)',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: '#ff9800',
                }}>
                  {kyberPublicKey || "Key not available"}
                </div>
              </div>
              
              {/* Encrypted Hash */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <span className="me-2" style={{ color: '#0cebf3' }}>📊</span>
                    <strong className="text-dark">Encrypted File Hash (SHA-256)</strong>
                  </div>
                  {encryptedHash && (
                    <button 
                      className="btn btn-sm" 
                      onClick={() => navigator.clipboard.writeText(encryptedHash)}
                      title="Copy to clipboard"
                      style={{
                        background: 'rgba(12, 235, 243, 0.1)',
                        border: '1px solid rgba(12, 235, 243, 0.3)',
                        color: '#16213e',
                      }}
                    >
                      <span>📋</span>
                    </button>
                  )}
                </div>
                <div className="p-2 rounded" style={{
                  background: 'rgba(22, 33, 62, 0.03)',
                  border: '1px solid rgba(22, 33, 62, 0.1)',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  color: '#28a745',
                }}>
                  {encryptedHash}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Da Vinci Inspired Footer Element */}
        <div className="mt-3 text-center" style={{ opacity: 0.7 }}>
          <div style={{ 
            width: '120px', 
            height: '1px',
            margin: '0 auto',
            background: 'linear-gradient(90deg, rgba(12, 235, 243, 0), rgba(255, 215, 0, 0.6), rgba(12, 235, 243, 0))'
          }}></div>
          <small className="text-muted d-block mt-2" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
            QUANTUM-SECURED • BLOCKCHAIN-VERIFIED
          </small>
        </div>
      </div>
    </div>
  );
}

export default UploadForm;