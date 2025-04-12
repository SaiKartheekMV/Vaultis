import React, { useState } from 'react';
import { getContract } from '../services/contract'; // Make sure this is set up
import { Web3Storage } from 'web3.storage';

function UploadForm() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  // Replace with your own Web3.Storage API key
  const client = new Web3Storage({ token: 'YOUR_WEB3_STORAGE_API_KEY' });

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      return setStatus('❌ Please select a file first.');
    }

    try {
      setStatus('🔐 Encrypting file...');
      // TODO: Post-Quantum encryption logic here
      const encryptedFile = file; // placeholder, replace with actual encrypted blob

      setStatus('🚀 Uploading to IPFS...');
      const cid = await client.put([encryptedFile], { wrapWithDirectory: false });

      setStatus(`✅ Uploaded to IPFS: ${cid}`);

      // Upload CID to blockchain
      const contract = getContract();
      const tx = await contract.storeCID(cid); // or your contract's method
      setStatus('⏳ Saving CID to blockchain...');
      await tx.wait();

      setStatus('✅ CID saved to blockchain!');
    } catch (error) {
      console.error(error);
      setStatus('❌ Error during upload or contract interaction.');
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
