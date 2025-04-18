import React, { useEffect, useState } from "react";
import { getContract } from "../services/contract";
import "./settings.css";

function Settings() {
  const [userAddress, setUserAddress] = useState("");
  const [backupAddress, setBackupAddress] = useState("");
  const [currentBackup, setCurrentBackup] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("backup");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [securityLevel, setSecurityLevel] = useState("standard");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [quantumResistanceEnabled, setQuantumResistanceEnabled] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserAddress(storedUser);
      fetchBackupAddress(storedUser);
      fetchUserSettings(storedUser);
    }
  }, []);

  const fetchBackupAddress = async (address) => {
    try {
      setIsLoading(true);
      const contract = await getContract();
      const backup = await contract.getBackupAddress(address);
      if (backup && backup !== "0x0000000000000000000000000000000000000000") {
        setCurrentBackup(backup);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching backup address:", error);
      setIsLoading(false);
    }
  };

  const fetchUserSettings = async (address) => {
    // Simulation - in a real app, this would fetch from a backend
    setTimeout(() => {
      setRecoveryEmail("user@example.com");
      setSecurityLevel("advanced");
      setMfaEnabled(true);
    }, 800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (!/^0x[a-fA-F0-9]{40}$/.test(backupAddress)) {
        throw new Error("Invalid Ethereum address format");
      }

      const contract = await getContract();
      await contract.setBackupAddress(backupAddress);
      
      setMessage({
        type: "success",
        text: "Backup address set successfully! This will be used for emergency recovery."
      });
      setCurrentBackup(backupAddress);
      setBackupAddress("");
    } catch (error) {
      setMessage({
        type: "danger",
        text: `Error: ${error.message || "Failed to set backup address"}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({
        type: "success",
        text: "Recovery email updated successfully!"
      });
    } catch (error) {
      setMessage({
        type: "danger",
        text: `Error: ${error.message || "Failed to update email"}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaToggle = () => {
    if (!mfaEnabled) {
      setShowMfaSetup(true);
    } else {
      setMfaEnabled(false);
      setShowMfaSetup(false);
      setMessage({
        type: "warning",
        text: "Multi-factor authentication has been disabled."
      });
    }
  };

  const handleMfaSetup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      if (verificationCode === "123456") { // For demo purposes
        setMfaEnabled(true);
        setShowMfaSetup(false);
        setMessage({
          type: "success",
          text: "Multi-factor authentication enabled successfully!"
        });
      } else {
        throw new Error("Invalid verification code");
      }
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityLevelChange = (level) => {
    setSecurityLevel(level);
    
    // Automatically adjust settings based on security level
    if (level === "quantum") {
      setQuantumResistanceEnabled(true);
      setAutoBackupEnabled(true);
      setNotificationsEnabled(true);
    } else if (level === "advanced") {
      setQuantumResistanceEnabled(false);
      setAutoBackupEnabled(true);
      setNotificationsEnabled(true);
    } else {
      setQuantumResistanceEnabled(false);
      setAutoBackupEnabled(false);
    }
  };

  return (
    <div className="quantum-container container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Header with Da Vinci inspired design */}
          <div className="quantum-header text-center mb-5">
            <div className="quantum-logo-container position-relative d-inline-block">
              <div className="quantum-circle circle-outer"></div>
              <div className="quantum-circle circle-middle"></div>
              <div className="quantum-circle circle-inner"></div>
              <div className="quantum-logo-icon d-flex align-items-center justify-content-center">
                ⚙️
              </div>
            </div>
            <h1 className="quantum-title mt-4 mb-0">Quantum Secure Settings</h1>
            <p className="text-muted mb-0">Configure your blockchain account with quantum-resistant security</p>
          </div>

          {/* Account Identity Card */}
          <div className="quantum-card identity-card mb-4">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-auto">
                  <div className="quantum-icon-container bg-gradient">
                    👤
                  </div>
                </div>
                <div className="col">
                  <h4 className="mb-1">Your Quantum Identity</h4>
                  <div className="d-flex align-items-center">
                    <code className="address-code bg-dark border border-secondary rounded px-3 py-2 me-2">
                      {userAddress}
                    </code>
                    <button className="btn btn-sm copy-btn">
                      <i className="fas fa-copy me-1"></i> Copy
                    </button>
                  </div>
                </div>
                <div className="col-md-3 text-md-end mt-3 mt-md-0">
                  <div className="d-flex justify-content-md-end">
                    <span className="badge bg-success me-2">Verified</span>
                    <span className="badge quantum-badge">PQC Enhanced</span>
                  </div>
                  <small className="text-muted">Security Level: {securityLevel === "quantum" ? "Quantum" : securityLevel === "advanced" ? "Advanced" : "Standard"}</small>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation tabs */}
          <ul className="nav quantum-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === "backup" ? "active" : ""}`}
                onClick={() => setActiveTab("backup")}
              >
                <i className="fas fa-shield-alt me-2"></i>
                Backup & Recovery
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === "security" ? "active" : ""}`}
                onClick={() => setActiveTab("security")}
              >
                <i className="fas fa-lock me-2"></i>
                Security Settings
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === "quantum" ? "active" : ""}`}
                onClick={() => setActiveTab("quantum")}
              >
                <i className="fas fa-atom me-2"></i>
                Quantum Protection
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Backup & Recovery Tab */}
            {activeTab === "backup" && (
              <div className="row">
                <div className="col-lg-6">
                  <div className="quantum-card blue-card mb-4">
                    <div className="card-header blue-header border-0">
                      <div className="d-flex align-items-center">
                        <div className="feature-icon blue-icon">
                          🔐
                        </div>
                        <h5 className="ms-3 mb-0">Blockchain Backup Address</h5>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      <form onSubmit={handleSubmit}>
                        {message.text && activeTab === "backup" && (
                          <div className={`alert alert-${message.type} quantum-alert border-0 mb-4`}>
                            {message.text}
                          </div>
                        )}

                        <div className="mb-4">
                          <label className="form-label text-muted">Current Backup Address</label>
                          {isLoading ? (
                            <div className="placeholder-glow">
                              <span className="placeholder col-12" style={{ height: "40px" }}></span>
                            </div>
                          ) : currentBackup ? (
                            <div className="d-flex align-items-center">
                              <code className="address-code flex-grow-1 bg-dark border border-secondary rounded px-3 py-2">
                                {currentBackup}
                              </code>
                              <button type="button" className="btn btn-sm ms-2 copy-btn">
                                <i className="fas fa-copy"></i>
                              </button>
                            </div>
                          ) : (
                            <div className="alert alert-warning quantum-warning">
                              <i className="fas fa-exclamation-triangle me-2"></i>
                              No backup address configured
                            </div>
                          )}
                        </div>

                        <div className="mb-3">
                          <label htmlFor="backupAddress" className="form-label blue-text">
                            <i className="fas fa-key me-2"></i>
                            Set New Backup Address
                          </label>
                          <div className="input-group">
                            <span className="input-group-text quantum-input-addon">
                              <i className="fas fa-wallet"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control quantum-input"
                              id="backupAddress"
                              value={backupAddress}
                              onChange={(e) => setBackupAddress(e.target.value)}
                              placeholder="0x..."
                              required
                            />
                          </div>
                          <div className="form-text quantum-form-text">
                            <i className="fas fa-info-circle me-1"></i>
                            This address will be used for quantum-resistant recovery operations
                          </div>
                        </div>

                        <div className="d-grid">
                          <button
                            type="submit"
                            className="btn btn-lg quantum-btn-blue"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Processing...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-shield-alt me-2"></i>
                                Set Quantum-Safe Backup
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="quantum-card gold-card mb-4">
                    <div className="card-header gold-header border-0">
                      <div className="d-flex align-items-center">
                        <div className="feature-icon gold-icon">
                          📧
                        </div>
                        <h5 className="ms-3 mb-0">Email Recovery</h5>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      <form onSubmit={handleEmailSubmit}>
                        <div className="mb-4">
                          <label className="form-label text-muted">Current Recovery Email</label>
                          {isLoading ? (
                            <div className="placeholder-glow">
                              <span className="placeholder col-12" style={{ height: "40px" }}></span>
                            </div>
                          ) : recoveryEmail ? (
                            <div className="d-flex align-items-center">
                              <code className="email-code flex-grow-1 bg-dark border border-secondary rounded px-3 py-2">
                                {recoveryEmail}
                              </code>
                            </div>
                          ) : (
                            <div className="alert alert-warning quantum-warning">
                              <i className="fas fa-exclamation-triangle me-2"></i>
                              No recovery email configured
                            </div>
                          )}
                        </div>

                        <div className="mb-3">
                          <label htmlFor="recoveryEmail" className="form-label gold-text">
                            <i className="fas fa-envelope me-2"></i>
                            Set Recovery Email
                          </label>
                          <div className="input-group">
                            <span className="input-group-text quantum-input-addon gold">
                              <i className="fas fa-at"></i>
                            </span>
                            <input
                              type="email"
                              className="form-control quantum-input gold"
                              id="recoveryEmail"
                              value={recoveryEmail}
                              onChange={(e) => setRecoveryEmail(e.target.value)}
                              placeholder="your-email@example.com"
                              required
                            />
                          </div>
                          <div className="form-text quantum-form-text">
                            <i className="fas fa-info-circle me-1"></i>
                            Used for verification and recovery notifications
                          </div>
                        </div>

                        <div className="d-grid">
                          <button
                            type="submit"
                            className="btn btn-lg quantum-btn-gold"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Processing...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-envelope me-2"></i>
                                Update Recovery Email
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Quick backup tips */}
                  <div className="quantum-card tips-card">
                    <div className="card-body p-4">
                      <h5 className="blue-text">
                        <i className="fas fa-lightbulb me-2 gold-text"></i>
                        Quantum-Safe Backup Tips
                      </h5>
                      <ul className="quantum-tips-list list-group list-group-flush mt-3">
                        <li className="quantum-tip list-group-item">
                          <i className="fas fa-check-circle me-2 blue-text"></i>
                          <strong>Use hardware wallets</strong> with quantum-resistant algorithms
                        </li>
                        <li className="quantum-tip list-group-item">
                          <i className="fas fa-check-circle me-2 blue-text"></i>
                          <strong>Verify backup addresses</strong> with test transactions
                        </li>
                        <li className="quantum-tip list-group-item">
                          <i className="fas fa-check-circle me-2 blue-text"></i>
                          <strong>Enable auto-rotation</strong> of backup addresses
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional tabs would be implemented here */}
            {activeTab === "security" && (
              <div className="row">
                <div className="col-12">
                  <div className="quantum-card blue-card mb-4">
                    <div className="card-header blue-header border-0">
                      <div className="d-flex align-items-center">
                        <div className="feature-icon blue-icon">
                          🔒
                        </div>
                        <h5 className="ms-3 mb-0">Advanced Security Settings</h5>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      <p className="blue-text">Configure your security settings here...</p>
                      {/* Security settings would go here */}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "quantum" && (
              <div className="row">
                <div className="col-12">
                  <div className="quantum-card gold-card mb-4">
                    <div className="card-header gold-header border-0">
                      <div className="d-flex align-items-center">
                        <div className="feature-icon gold-icon">
                          ⚛️
                        </div>
                        <h5 className="ms-3 mb-0">Quantum Protection Settings</h5>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      <p className="gold-text">Configure your quantum protection settings here...</p>
                      {/* Quantum protection settings would go here */}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;