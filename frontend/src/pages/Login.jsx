import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [account, setAccount] = useState(null);

  const connectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        setError("🦊 Please install MetaMask to continue.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);
      localStorage.setItem("user", address);
      localStorage.setItem("walletConnected", "true");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("❌ Wallet connection failed. Try again.");
    }
  }, []);

  // Auto-connect if previously connected
  useEffect(() => {
    const previouslyConnected = localStorage.getItem("walletConnected");
    if (previouslyConnected) {
      connectWallet();
    }

    // Disconnect MetaMask (clear state) on window/tab close
    const handleBeforeUnload = () => {
      localStorage.removeItem("user");
      localStorage.removeItem("walletConnected");
      setAccount(null);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [connectWallet]);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 renaissance-bg text-white text-center">
      <h1 className="display-4 fw-bold glow-text">🔐 Vaultis</h1>
      <p className="mb-4 fs-5">Quantum-Secured File Storage in the Renaissance of Blockchain</p>

      <button
        onClick={connectWallet}
        className="btn btn-outline-light btn-lg px-5 py-2 rounded-pill glow-button"
      >
        {account ? "✅ Connected" : "🔌 Connect with MetaMask"}
      </button>

      {error && <div className="mt-4 text-danger fw-bold">{error}</div>}
    </div>
  );
};

export default Login;
