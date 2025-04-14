import React, { useState } from 'react';
import { getContract } from '../services/contract';
import './GrantAccess.css'; // Import your CSS file for styles

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
    <div className="card bg-dark border-primary mb-4 mt-4">
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
              <div className="col-md-8 col-lg-9">
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
              <div className="col-md-4 col-lg-3 d-flex align-items-end">
                <button 
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={handleGrant}
                  disabled={granting || !address}
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
          </small>
        </div>
      </div>
    </div>
  );
}

// Add this CSS to your stylesheet
// .quantum-bg {
//   background-color: #12002e;
//   background-image: 
//     linear-gradient(rgba(66, 0, 128, 0.1) 1px, transparent 1px),
//     linear-gradient(90deg, rgba(66, 0, 128, 0.1) 1px, transparent 1px);
//   background-size: 20px 20px;
// }

export default GrantAccess;