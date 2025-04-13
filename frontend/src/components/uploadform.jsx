import React, { useState, useRef } from 'react';
import { getContract } from '../services/contract';
import axios from 'axios';

function UploadForm({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [cid, setCid] = useState('');
  const [kyberPublicKey, setKyberPublicKey] = useState('');
  const [encryptedHash, setEncryptedHash] = useState('');
  const [uploading, setUploading] = useState(false);
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

      const { cid, kyber_public_key, encrypted_hash } = response.data;

      setCid(cid);
      setKyberPublicKey(kyber_public_key);
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

  const truncateText = (text, maxLength = 20) => {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  return (
    <div className="card p-4 mb-4 shadow border-info bg-light">
      <div className="d-flex align-items-center mb-3">
        <div className="fs-4 me-2">🔐</div>
        <h4 className="text-primary mb-0">Upload Quantum-Secured File</h4>
      </div>
      
      <form onSubmit={handleUpload}>
        <div className="mb-3">
          <div className="input-group">
            <input
              type="file"
              ref={fileInputRef}
              className="form-control"
              onChange={(e) => setFile(e.target.files[0])}
              disabled={uploading}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={uploading || !file}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="bi bi-upload me-1"></i> Encrypt & Upload
                </>
              )}
            </button>
          </div>
          {file && (
            <div className="mt-2 small text-muted">
              Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </div>
      </form>

      {status && (
        <div className={`alert ${status.includes('❌') ? 'alert-danger' : 'alert-info'} mt-3`} role="alert">
          {status}
        </div>
      )}

      {cid && (
        <div className="mt-3 border rounded p-3 bg-white shadow-sm">
          <div className="mb-2">
            <div className="d-flex justify-content-between align-items-center">
              <strong>📦 CID:</strong>
              <button 
                className="btn btn-sm btn-outline-secondary" 
                onClick={() => navigator.clipboard.writeText(cid)}
                title="Copy to clipboard"
              >
                📋 Copy
              </button>
            </div>
            <code className="text-danger d-block mt-1 text-break">{cid}</code>
          </div>
          
          <div className="mb-2">
            <strong>🔑 Kyber Public Key:</strong>
            <div className="position-relative">
              <pre className="text-warning small text-break bg-light p-2 border rounded mt-1">
                {kyberPublicKey || "Key not available"}
              </pre>
              {kyberPublicKey && (
                <button 
                  className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-2" 
                  onClick={() => navigator.clipboard.writeText(kyberPublicKey)}
                  title="Copy to clipboard"
                >
                  📋
                </button>
              )}
            </div>
          </div>
          
          <div>
            <strong>📊 Encrypted File Hash (SHA-256):</strong>
            <div className="d-flex align-items-center mt-1">
              <code className="text-success text-break flex-grow-1">{encryptedHash}</code>
              {encryptedHash && (
                <button 
                  className="btn btn-sm btn-outline-secondary ms-2" 
                  onClick={() => navigator.clipboard.writeText(encryptedHash)}
                  title="Copy to clipboard"
                >
                  📋
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadForm;