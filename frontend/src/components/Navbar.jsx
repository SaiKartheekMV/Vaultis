import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWalletDetails = async () => {
      if (window.ethereum && localStorage.getItem('user')) {
        try {
          setConnecting(true);
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const addr = await signer.getAddress();
          const bal = await provider.getBalance(addr);
          setAddress(addr);
          setBalance(ethers.formatEther(bal).slice(0, 6)); // Show up to 6 characters
        } catch (error) {
          console.error("Error connecting to wallet:", error);
          localStorage.removeItem('user'); // Clear invalid connection
        } finally {
          setConnecting(false);
        }
      }
    };
    
    fetchWalletDetails();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', fetchWalletDetails);
      window.ethereum.on('chainChanged', fetchWalletDetails);
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', fetchWalletDetails);
        window.ethereum.removeListener('chainChanged', fetchWalletDetails);
      }
    };
  }, []);

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    // Show a tiny tooltip or toast here if you want feedback
  };

  const disconnect = () => {
    localStorage.removeItem('user');
    setAddress('');
    setBalance('');
    setShowModal(false);
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar navbar-dark bg-dark-quantum">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <span className="navbar-brand mb-0 h1">
              <span className="me-2">☢️</span>
              Quantum Menu
            </span>
          </div>
          <div className="navbar-center d-none d-md-block">
            <div className="quantum-badge">
              <span className="quantum-badge-icon">💬</span>
              Vaultis Dashboard
            </div>
          </div>
          {connecting ? (
            <div className="d-flex align-items-center">
              <div className="spinner-border spinner-border-sm text-light me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="text-light">Connecting wallet...</span>
            </div>
          ) : address ? (
            <div className="wallet-button">
              <button 
                className="btn eth-balance-btn"
                onClick={() => setShowModal(true)}
              >
                <span className="eth-balance">{balance} ETH</span>
                <span className="wallet-fox">🦊</span>
                <span className="wallet-address">{truncateAddress(address)}</span>
                <span className="dropdown-arrow">▾</span>
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-outline-light" 
              onClick={() => navigate('/login')}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>

      {/* Wallet Modal */}
      {showModal && (
        <div className="wallet-modal" onClick={() => setShowModal(false)}>
          <div className="wallet-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            <div className="wallet-header">
              <img
                src="/metamask-icon.svg"
                alt="wallet"
                className="wallet-icon"
              />
              <h5>Wallet Details</h5>
            </div>
            <div className="wallet-info">
              <p className="wallet-address" title={address}>{truncateAddress(address)}</p>
              <p className="wallet-balance">{balance} ETH</p>
            </div>
            <div className="modal-buttons">
              <button onClick={copyToClipboard} className="copy-btn">
                📋 Copy Address
              </button>
              <button onClick={disconnect} className="disconnect">
                🔌 Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;