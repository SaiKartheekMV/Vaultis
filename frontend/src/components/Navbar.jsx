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
      <nav className="navbar navbar-dark bg-dark shadow">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <span className="navbar-brand mb-0 h1">🧠 Vaultis Dashboard</span>
          {connecting ? (
            <div className="d-flex align-items-center">
              <div className="spinner-border spinner-border-sm text-light me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="text-light">Connecting wallet...</span>
            </div>
          ) : address ? (
            <div className="metamask-button d-flex align-items-center">
              <div
                className="btn bg-light rounded-pill px-3 py-1 d-flex align-items-center gap-2"
                onClick={() => setShowModal(true)}
                style={{ cursor: 'pointer' }}
              >
                <span className="text-dark fw-bold">{balance} ETH</span>
                <img
                  src="/metamask-icon.svg"
                  className="metamask-icon"
                  alt="wallet"
                  width="24"
                  height="24"
                />
                <span className="text-dark fw-semibold">{truncateAddress(address)}</span>
                <span className="text-dark">▾</span>
              </div>
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
            <img
              src="/metamask-icon.svg"
              alt="wallet"
              className="wallet-icon"
            />
            <p className="wallet-address" title={address}>{truncateAddress(address)}</p>
            <p className="wallet-balance">{balance} ETH</p>
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