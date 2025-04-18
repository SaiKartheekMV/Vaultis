import React, { useState, useEffect } from 'react';
import { getContract } from '../services/contract';
import './GrantAccess.css';

function GrantAccess() {
  const [address, setAddress] = useState('');
  const [fileId, setFileId] = useState('');
  const [granting, setGranting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');

  // Fetch user's blockchain address on component mount
  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        // This would typically come from your wallet connection
        // Example with MetaMask or similar provider:
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setCurrentAddress(accounts[0]);
          }
        }
      } catch (error) {
        console.error("Failed to get user's address:", error);
      }
    };

    fetchUserAddress();
  }, []);

  const handleGrant = async () => {
    if (!address) {
      setError('Please enter a valid wallet address');
      return;
    }

    if (!fileId) {
      setError('Please enter a valid File ID');
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
      setFileId(''); // Clear the input
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

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <h1 className="text-light mb-4">Grant Access to Files</h1>
          <p className="text-light mb-4">
            Use this interface to grant access to your encrypted files on the blockchain.
          </p>
          
          <div className="card bg-dark border-primary mb-4">
            {/* Custom card header with quantum gradient */}
            <div className="card-header bg-dark bg-gradient text-primary border-bottom border-primary d-flex align-items-center">
              <div className="me-3 bg-primary bg-opacity-25 p-2 rounded-circle">
                <i className="bi bi-key-fill text-primary"></i>
              </div>
              <h5 className="mb-0 text-primary fw-bold">Quantum Access Control</h5>
            </div>

            <div className="card-body position-relative quantum-bg">
              {/* Error Alert */}
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}
              
              {/* Success Alert */}
              {success && (
                <div className="alert alert-success d-flex align-items-center" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  <div>{success}</div>
                </div>
              )}
              
              {/* Form container */}
              <div className="p-3 bg-dark bg-opacity-75 rounded border border-primary mb-3">
                <form>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="file-id" className="form-label text-light">File ID</label>
                      <div className="input-group">
                        <span className="input-group-text bg-dark text-primary border-primary">
                          <i className="bi bi-file-earmark-lock"></i>
                        </span>
                        <input
                          type="text"
                          id="file-id"
                          className="form-control bg-dark text-light border-primary"
                          placeholder="Enter file ID"
                          value={fileId}
                          onChange={(e) => setFileId(e.target.value)}
                          disabled={granting}
                        />
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="wallet-address" className="form-label text-light">Recipient's Wallet Address</label>
                      <div className="input-group">
                        <span className="input-group-text bg-dark text-primary border-primary">
                          <i className="bi bi-wallet2"></i>
                        </span>
                        <input
                          type="text"
                          id="wallet-address"
                          className="form-control bg-dark text-light border-primary"
                          placeholder="0x..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          disabled={granting}
                        />
                      </div>
                    </div>
                    
                    <div className="col-12 mt-4">
                      <button 
                        type="button"
                        className="btn btn-primary"
                        onClick={handleGrant}
                        disabled={granting || !address || !fileId}
                      >
                        {granting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-plus-circle me-1"></i>
                            Grant Access
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              
              {/* Info box */}
              <div className="d-flex align-items-center p-3 bg-primary bg-opacity-10 rounded border border-primary">
                <i className="bi bi-shield-lock me-3 text-primary"></i>
                <small className="text-light">
                  Access will be granted through the blockchain using post-quantum cryptographic keys.
                  Your transaction will be recorded on the blockchain and cannot be reversed.
                </small>
              </div>
            </div>
          </div>

          {/* Current Address Display */}
          {currentAddress && (
            <div className="card bg-dark border-primary mt-4">
              <div className="card-body p-3 d-flex align-items-center">
                <i className="bi bi-person-badge me-2 text-primary"></i>
                <div>
                  <small className="text-light">Connected Wallet:</small>
                  <div className="text-primary">{currentAddress}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GrantAccess;