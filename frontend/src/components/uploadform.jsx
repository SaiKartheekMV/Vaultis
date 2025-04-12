import React, { useState } from 'react';
import { getContract } from '../services/contract';
import axios from 'axios';

function UploadForm({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [cid, setCid] = useState('');
  const [kyberPublicKey, setKyberPublicKey] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      return setStatus('❌ Please select a file first.');
    }

    try {
      if (!window.ethereum) {
        return setStatus("❌ MetaMask not detected.");
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });

      setStatus('🔐 Encrypting and uploading file to IPFS...');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:5000/api/encrypt-upload', formData);

      const { cid, kyber_public_key } = response.data;

      setCid(cid);
      setKyberPublicKey(kyber_public_key);
      setStatus(`✅ Uploaded to IPFS! CID: ${cid}\n⏳ Saving CID to blockchain...`);

      // Save CID to blockchain
      const contract = await getContract();
      const tx = await contract.uploadFile(cid);
      await tx.wait();

      setStatus('✅ File fully uploaded and saved to blockchain!');
      setFile(null);

      if (onUploadSuccess) onUploadSuccess();

    } catch (error) {
      console.error(error);

      if (error?.message?.toLowerCase().includes('user rejected')) {
        setStatus('❌ Transaction rejected by user.');
      } else {
        setStatus('❌ Upload or blockchain interaction failed.');
      }
    }
  };

  return (
    <form onSubmit={handleUpload} className="card p-4 mb-4 shadow border border-info bg-light">
      <h4 className="text-primary mb-3">📁 Upload Quantum-Secured File</h4>

      <div className="mb-3">
        <input
          type="file"
          className="form-control"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      <button type="submit" className="btn btn-outline-primary w-100">
        🔐 Encrypt & Upload
      </button>

      {status && (
        <div className="alert alert-info mt-3 white-space-pre-line" role="alert">
          {status}
        </div>
      )}

      {cid && (
        <div className="mt-3 border rounded p-3 bg-white shadow-sm">
          <div><strong>📦 CID:</strong> <code className="text-danger">{cid}</code></div>
          <div><strong>🔑 Kyber Public Key:</strong> <code className="text-warning">{kyberPublicKey}</code></div>
        </div>
      )}
    </form>
  );
}

export default UploadForm;
