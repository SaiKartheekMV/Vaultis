import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getContract } from '../services/contract';
import axios from 'axios';

function UploadForm() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      return setStatus('❌ Please select a file first.');
    }

    try {
      // Step 1: Request MetaMask wallet connection
      if (!window.ethereum) {
        return setStatus("❌ MetaMask not detected.");
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Step 2: Encrypt and upload to IPFS via your backend
      setStatus('🔐 Encrypting and uploading file...');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:5000/api/encrypt-upload', formData);
      const cid = response.data.cid;

      setStatus(`✅ Uploaded to IPFS. CID: ${cid}`);

      // Step 3: Interact with smart contract using correct function
      setStatus('⏳ Saving CID to blockchain...');

      const contract = await getContract(signer);
      const tx = await contract.uploadFile(cid);  // ✅ Corrected function name
      await tx.wait();

      setStatus('✅ CID saved to blockchain!');
    } catch (error) {
      console.error(error);
      setStatus('❌ Upload or blockchain interaction failed.');
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
        <div className="alert alert-info mt-3" role="alert">
          {status}
        </div>
      )}
    </form>
  );
}

export default UploadForm;
