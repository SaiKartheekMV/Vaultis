import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [, setAccount] = useState(null);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      
      if (!window.ethereum) {
        setError("🦊 MetaMask not detected. Please install MetaMask to continue.");
        setIsConnecting(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);
      localStorage.setItem("user", address);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("❌ Wallet connection failed. Please try again.");
      setIsConnecting(false);
    }
  };

  // Clear MetaMask connection data on tab/window close
  useEffect(() => {
    localStorage.removeItem("user"); // always clear session on load
    
    const handleBeforeUnload = () => {
      localStorage.removeItem("user");
      setAccount(null);
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <div className="login-page">
      <div className="quantum-particles"></div>
      
      <div className="login-container">
        <div className="branding-section">
          <div className="logo-container">
            <div className="quantum-logo">
              <div className="atom-orbit"></div>
              <div className="atom-orbit two"></div>
              <div className="atom-orbit three"></div>
              <div className="atom-core"></div>
            </div>
          </div>
          
          <h1 className="app-title">VAULTIS</h1>
          <div className="tagline">Quantum-Secured Blockchain Storage</div>
        </div>
        
        <div className="login-section">
          <h2 className="welcome-text">Welcome to the Future of Secure Storage</h2>
          <p className="description">
            Experience decentralized quantum-resistant encryption for your files, 
            powered by PQC algorithms and IPFS technology.
          </p>
          
          <button 
            onClick={connectWallet} 
            className={`connect-wallet-btn ${isConnecting ? 'connecting' : ''}`}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <div className="spinner"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="metamask-icon" viewBox="0 0 24 24">
                  <path d="M20.6,4.5l-8.1-0.2l-2.2,6.7L8.2,4.5L0,4.7l4.5,14.2l7.7-5.8l7.8,5.8L20.6,4.5z M4.6,17.6L1,6.1l6.3-0.1l1.9,5.6l-4.6,6H4.6z M17.3,17.6l-4.6-6l1.8-5.9l6.4-0.1L17.3,17.6z M12,13.6l-5.2,4l3.7-5.4l1.5,1.4V13.6z M12,13.5l1.5-1.4l3.8,5.4L12,13.5z" />
                </svg>
                <span>Connect with MetaMask</span>
              </>
            )}
          </button>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="security-badges">
            <div className="badge">
              <span className="badge-icon">🔒</span>
              <span className="badge-text">Quantum Resistant</span>
            </div>
            <div className="badge">
              <span className="badge-icon">⛓️</span>
              <span className="badge-text">Blockchain Secured</span>
            </div>
            <div className="badge">
              <span className="badge-icon">🌐</span>
              <span className="badge-text">Decentralized</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="version-badge">v1.0.0 Beta</div>
    </div>
  );
};

export default Login;