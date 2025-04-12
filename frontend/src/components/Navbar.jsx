import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWalletDetails = async () => {
      if (window.ethereum && localStorage.getItem('user')) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();
        const bal = await provider.getBalance(addr);
        setAddress(addr);
        setBalance(ethers.formatEther(bal).slice(0, 6)); // Show up to 6 characters
      }
    };
    fetchWalletDetails();
  }, []);

  const truncateAddress = (addr) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
  };

  const disconnect = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar navbar-dark bg-dark shadow">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <span className="navbar-brand mb-0 h1">🧠 Vaultis Dashboard</span>
          {address && (
            <div className="metamask-button d-flex align-items-center">
              <div
                className="btn bg-light rounded-pill px-3 py-1 d-flex align-items-center gap-2"
                onClick={() => setShowModal(true)}
                style={{ cursor: 'pointer' }}
              >
                <span className="text-dark fw-bold">{balance} ETH</span>
                <img
                  src="/metamask-icon.svg"  // ✅ Correct public path usage
                  className="metamask-icon"
                  alt="wallet"
                  width="24"
                  height="24"
                />
                <span className="text-dark fw-semibold">{truncateAddress(address)}</span>
                <span className="text-dark">▾</span>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Modal */}
      {showModal && (
        <div className="wallet-modal">
          <div className="wallet-content">
            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            <img
              src="/metamask-icon.svg"  // ✅ Using same public path
              alt="wallet"
              className="wallet-icon"
            />
            <p className="wallet-address">{truncateAddress(address)}</p>
            <p className="wallet-balance">{balance} ETH</p>
            <div className="modal-buttons">
              <button onClick={copyToClipboard}>📋 Copy Address</button>
              <button onClick={disconnect} className="disconnect">🔌 Disconnect</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
