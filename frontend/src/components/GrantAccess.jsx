import React, { useState } from 'react';
import { getContract } from '../services/contract';

function GrantAccess({ fileId, currentAddress, isOwner, onAccessGranted }) {
  const [address, setAddress] = useState('');
  const [granting, setGranting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGrant = async () => {
    if (!address || !fileId) {
      setError('Please enter a valid wallet address');
      return;
    }

    // Basic ETH address validation
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Please enter a valid ETH wallet address');
      return;
    }

    try {
      setGranting(true);
      setError('');
      setSuccess('');
      
      // Get contract instance and grant access
      const contract = await getContract();
      const tx = await contract.grantAccess(fileId, address);
      await tx.wait();
      
      setSuccess(`Access granted to ${address.substring(0, 6)}...${address.substring(38)} for File ID ${fileId}`);
      setAddress(''); // Clear the input
      
      // Notify parent component to refresh data
      if (onAccessGranted) {
        onAccessGranted();
      }
    } catch (error) {
      console.error('❌ Error granting access:', error);
      if (error?.message?.toLowerCase().includes('user rejected')) {
        setError('Transaction rejected by user.');
      } else {
        setError('Failed to grant access. Check permissions or try again.');
      }
    } finally {
      setGranting(false);
    }
  };

  if (!isOwner) {
    return null; // Don't render if user is not the owner
  }

  return (
    <div className="card p-3 border-dark shadow-sm mt-3">
      <h5 className="text-dark mb-3">
        <span className="me-2">🔑</span>
        Grant Access
      </h5>
      
      {error && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success py-2 mb-3" role="alert">
          {success}
        </div>
      )}
      
      <div className="input-group mb-2">
        <input
          type="text"
          className="form-control"
          placeholder="0x... Wallet address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={granting}
        />
        <button 
          className="btn btn-dark" 
          onClick={handleGrant}
          disabled={granting || !address}
        >
          {granting ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Granting...
            </>
          ) : (
            'Grant Access'
          )}
        </button>
      </div>
      
      <small className="text-muted">
        This will allow the address owner to access your encrypted file using their wallet.
      </small>
    </div>
  );
}

export default GrantAccess;