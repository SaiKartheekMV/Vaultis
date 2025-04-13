import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [, setAccount] = useState(null);

  const connectWallet = async () => {
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
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("❌ Wallet connection failed. Try again.");
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
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 renaissance-bg text-white text-center">
      <h1 className="display-4 fw-bold glow-text">🔐 Vaultis</h1>
      <p className="mb-4 fs-5">Quantum-Secured File Storage in the Renaissance of Blockchain</p>

      <button
        onClick={connectWallet}
        className="btn btn-outline-light btn-lg px-5 py-2 rounded-pill glow-button"
      >
        🔌 Connect with MetaMask
      </button>

      {error && <div className="mt-4 text-danger fw-bold">{error}</div>}
    </div>
  );
};

export default Login;
