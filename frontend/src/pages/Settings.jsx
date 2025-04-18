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
  const [transactionSigning, setTransactionSigning] = useState("standard");
  const [keyRotationFrequency, setKeyRotationFrequency] = useState("monthly");
  const [whitelistedAddresses, setWhitelistedAddresses] = useState([]);
  const [newWhitelistAddress, setNewWhitelistAddress] = useState("");
  const [statefulFirewall, setStatefulFirewall] = useState(false);
  const [latticeEncryption, setLatticeEncryption] = useState(false);
  const [hashAlgorithm, setHashAlgorithm] = useState("sha3");
  const [quantumEntanglementVerification, setQuantumEntanglementVerification] = useState(false);
  const [timeLockDuration, setTimeLockDuration] = useState(24);
  const [hashSignatureScheme, setHashSignatureScheme] = useState("dilithium");
  const [quantumRNG, setQuantumRNG] = useState(false);
  const [zeroKnowledgeProofs, setZeroKnowledgeProofs] = useState(false);
  const [entropySource, setEntropySource] = useState("hybrid");

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
      setTransactionSigning("enhanced");
      setKeyRotationFrequency("monthly");
      setWhitelistedAddresses(["0x71C7656EC7ab88b098defB751B7401B5f6d8976F"]);
      setHashAlgorithm("sha3");
      setTimeLockDuration(24);
      setEntropySource("hybrid");
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
      setMfaEnabled(true);
      setTransactionSigning("quantum");
      setKeyRotationFrequency("weekly");
      setStatefulFirewall(true);
      setLatticeEncryption(true);
      setHashAlgorithm("sha3");
      setHashSignatureScheme("dilithium");
      setQuantumRNG(true);
      setZeroKnowledgeProofs(true);
      setEntropySource("quantum");
    } else if (level === "advanced") {
      setQuantumResistanceEnabled(false);
      setAutoBackupEnabled(true);
      setNotificationsEnabled(true);
      setMfaEnabled(true);
      setTransactionSigning("enhanced");
      setKeyRotationFrequency("monthly");
      setStatefulFirewall(true);
      setLatticeEncryption(false);
      setHashAlgorithm("sha3");
      setHashSignatureScheme("falcon");
      setQuantumRNG(false);
      setZeroKnowledgeProofs(true);
      setEntropySource("hybrid");
    } else {
      setQuantumResistanceEnabled(false);
      setAutoBackupEnabled(false);
      setNotificationsEnabled(true);
      setMfaEnabled(false);
      setTransactionSigning("standard");
      setKeyRotationFrequency("quarterly");
      setStatefulFirewall(false);
      setLatticeEncryption(false);
      setHashAlgorithm("sha256");
      setHashSignatureScheme("ecdsa");
      setQuantumRNG(false);
      setZeroKnowledgeProofs(false);
      setEntropySource("system");
    }
  };

  const addWhitelistAddress = () => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(newWhitelistAddress)) {
      setMessage({
        type: "danger",
        text: "Invalid Ethereum address format"
      });
      return;
    }
    if (!whitelistedAddresses.includes(newWhitelistAddress)) {
      setWhitelistedAddresses([...whitelistedAddresses, newWhitelistAddress]);
      setNewWhitelistAddress("");
      setMessage({
        type: "success",
        text: "Address added to whitelist successfully!"
      });
    } else {
      setMessage({
        type: "warning",
        text: "Address is already whitelisted"
      });
    }
  };

  const removeWhitelistAddress = (address) => {
    setWhitelistedAddresses(whitelistedAddresses.filter(a => a !== address));
    setMessage({
      type: "success",
      text: "Address removed from whitelist"
    });
  };

  const updateSetting = (setter, value, successMessage) => {
    setter(value);
    setMessage({
      type: "success",
      text: successMessage
    });
  };

  const saveSecuritySettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to save security settings
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMessage({
        type: "success",
        text: "Security settings updated successfully!"
      });
    } catch (error) {
      setMessage({
        type: "danger",
        text: `Error: ${error.message || "Failed to update security settings"}`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveQuantumSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to save quantum settings
      await new Promise(resolve => setTimeout(resolve, 1800));
      setMessage({
        type: "success",
        text: "Quantum protection settings updated successfully!"
      });
    } catch (error) {
      setMessage({
        type: "danger",
        text: `Error: ${error.message || "Failed to update quantum settings"}`
      });
    } finally {
      setIsLoading(false);
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

            {/* Security Settings Tab */}
            {activeTab === "security" && (
              <div className="row">
                {message.text && activeTab === "security" && (
                  <div className="col-12 mb-4">
                    <div className={`alert alert-${message.type} quantum-alert border-0`}>
                      {message.text}
                    </div>
                  </div>
                )}
                
                <div className="col-lg-6">
                  <div className="quantum-card blue-card mb-4">
                    <div className="card-header blue-header border-0">
                      <div className="d-flex align-items-center">
                        <div className="feature-icon blue-icon">
                          🛡️
                        </div>
                        <h5 className="ms-3 mb-0">Advanced Security Settings</h5>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      {/* Security Level Selection */}
                      <div className="mb-4">
                        <label className="form-label blue-text">
                          <i className="fas fa-layer-group me-2"></i>
                          Security Profile Level
                        </label>
                        <div className="security-level-container">
                          <div className="btn-group w-100">
                            <button
                              type="button"
                              className={`btn ${securityLevel === "standard" ? "quantum-btn-blue" : "btn-outline-secondary"}`}
                              onClick={() => handleSecurityLevelChange("standard")}
                            >
                              Standard
                            </button>
                            <button
                              type="button"
                              className={`btn ${securityLevel === "advanced" ? "quantum-btn-blue" : "btn-outline-secondary"}`}
                              onClick={() => handleSecurityLevelChange("advanced")}
                            >
                              Advanced
                            </button>
                            <button
                              type="button"
                              className={`btn ${securityLevel === "quantum" ? "quantum-btn-blue" : "btn-outline-secondary"}`}
                              onClick={() => handleSecurityLevelChange("quantum")}
                            >
                              Quantum
                            </button>
                          </div>
                          <div className="form-text quantum-form-text mt-2">
                            <i className="fas fa-info-circle me-1"></i>
                            Quantum level enables all post-quantum cryptography protections
                          </div>
                        </div>
                      </div>

                      {/* Transaction Signing Method */}
                      <div className="mb-4">
                        <label className="form-label blue-text">
                          <i className="fas fa-signature me-2"></i>
                          Transaction Signing Method
                        </label>
                        <select 
                          className="form-select quantum-input"
                          value={transactionSigning}
                          onChange={(e) => updateSetting(
                            setTransactionSigning,
                            e.target.value,
                            "Transaction signing method updated"
                          )}
                        >
                          <option value="standard">Standard (ECDSA)</option>
                          <option value="enhanced">Enhanced (EdDSA)</option>
                          <option value="quantum">Quantum-Resistant (Dilithium)</option>
                          <option value="hybrid">Hybrid (ECDSA + Dilithium)</option>
                        </select>
                        <div className="form-text quantum-form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          Hybrid and Quantum options protect against quantum computing threats
                        </div>
                      </div>

                      {/* Key Rotation Frequency */}
                      <div className="mb-4">
                        <label className="form-label blue-text">
                          <i className="fas fa-sync-alt me-2"></i>
                          Key Rotation Frequency
                        </label>
                        <select 
                          className="form-select quantum-input"
                          value={keyRotationFrequency}
                          onChange={(e) => updateSetting(
                            setKeyRotationFrequency,
                            e.target.value,
                            "Key rotation frequency updated"
                          )}
                        >
                          <option value="none">Never (Not Recommended)</option>
                          <option value="quarterly">Every 3 Months</option>
                          <option value="monthly">Monthly</option>
                          <option value="weekly">Weekly</option>
                          <option value="daily">Daily (Maximum Security)</option>
                        </select>
                        <div className="form-text quantum-form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          Regular key rotation reduces risk from key compromise
                        </div>
                      </div>

                      {/* Multi-Factor Authentication */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label blue-text mb-0">
                            <i className="fas fa-key me-2"></i>
                            Multi-Factor Authentication
                          </label>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="mfaToggle"
                              checked={mfaEnabled}
                              onChange={handleMfaToggle}
                            />
                          </div>
                        </div>
                        <div className="form-text quantum-form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          Require additional verification for all critical operations
                        </div>
                        
                        {showMfaSetup && (
                          <div className="mt-3 p-3 bg-dark rounded border border-secondary">
                            <form onSubmit={handleMfaSetup}>
                              <div className="mb-3">
                                <label htmlFor="verificationCode" className="form-label">
                                  Enter Verification Code
                                </label>
                                <input
                                  type="text"
                                  className="form-control quantum-input"
                                  id="verificationCode"
                                  value={verificationCode}
                                  onChange={(e) => setVerificationCode(e.target.value)}
                                  placeholder="123456"
                                  required
                                />
                                <div className="form-text quantum-form-text">
                                  Enter code "123456" for demo purposes
                                </div>
                              </div>
                              <div className="d-grid">
                                <button
                                  type="submit"
                                  className="btn quantum-btn-blue"
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                      Verifying...
                                    </>
                                  ) : (
                                    "Verify & Enable"
                                  )}
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>

                      {/* Stateful Firewall */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label blue-text mb-0">
                            <i className="fas fa-fire me-2"></i>
                            Stateful Transaction Firewall
                          </label>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="firewallToggle"
                              checked={statefulFirewall}
                              onChange={() => updateSetting(
                                setStatefulFirewall,
                                !statefulFirewall,
                                `Transaction firewall ${!statefulFirewall ? "enabled" : "disabled"}`
                              )}
                            />
                          </div>
                        </div>
                        <div className="form-text quantum-form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          Blocks suspicious transactions based on behavioral patterns
                        </div>
                      </div>

                      {/* Notifications */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label blue-text mb-0">
                            <i className="fas fa-bell me-2"></i>
                            Security Notifications
                          </label>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="notificationsToggle"
                              checked={notificationsEnabled}
                              onChange={() => updateSetting(
                                setNotificationsEnabled,
                                !notificationsEnabled,
                                `Security notifications ${!notificationsEnabled ? "enabled" : "disabled"}`
                              )}
                            />
                          </div>
                        </div>
                        <div className="form-text quantum-form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          Receive alerts for important security events
                        </div>
                      </div>
  
                      {/* Auto Backup */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label blue-text mb-0">
                            <i className="fas fa-cloud-upload-alt me-2"></i>
                            Automatic Backup
                          </label>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="autoBackupToggle"
                              checked={autoBackupEnabled}
                              onChange={() => updateSetting(
                                setAutoBackupEnabled,
                                !autoBackupEnabled,
                                `Automatic backup ${!autoBackupEnabled ? "enabled" : "disabled"}`
                              )}
                            />
                          </div>
                        </div>
                        <div className="form-text quantum-form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          Regularly back up your wallet configuration
                        </div>
                      </div>
  
                      <div className="d-grid">
                        <button
                          type="button"
                          className="btn btn-lg quantum-btn-blue"
                          onClick={saveSecuritySettings}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Saving Security Settings...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-shield-alt me-2"></i>
                              Save Security Settings
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
  
                <div className="col-lg-6">
                  <div className="quantum-card gold-card mb-4">
                    <div className="card-header gold-header border-0">
                      <div className="d-flex align-items-center">
                        <div className="feature-icon gold-icon">
                          📝
                        </div>
                        <h5 className="ms-3 mb-0">Whitelist Management</h5>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      <div className="mb-4">
                        <label className="form-label gold-text">
                          <i className="fas fa-list me-2"></i>
                          Whitelisted Addresses
                        </label>
                        <div className="whitelist-container">
                          {whitelistedAddresses.length > 0 ? (
                            <div className="list-group">
                              {whitelistedAddresses.map((address, index) => (
                                <div key={index} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                  <code className="address-code small">{address}</code>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => removeWhitelistAddress(address)}
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="alert alert-warning quantum-warning">
                              <i className="fas fa-exclamation-triangle me-2"></i>
                              No addresses whitelisted
                            </div>
                          )}
                        </div>
                      </div>
  
                      <div className="mb-4">
                        <label htmlFor="newWhitelistAddress" className="form-label gold-text">
                          <i className="fas fa-plus me-2"></i>
                          Add New Whitelisted Address
                        </label>
                        <div className="input-group">
                          <span className="input-group-text quantum-input-addon gold">
                            <i className="fas fa-wallet"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control quantum-input gold"
                            id="newWhitelistAddress"
                            value={newWhitelistAddress}
                            onChange={(e) => setNewWhitelistAddress(e.target.value)}
                            placeholder="0x..."
                          />
                          <button
                            className="btn quantum-btn-gold"
                            type="button"
                            onClick={addWhitelistAddress}
                          >
                            Add
                          </button>
                        </div>
                        <div className="form-text quantum-form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          Only whitelisted addresses can receive funds
                        </div>
                      </div>
  
                      {/* Time Lock Duration */}
                      <div className="mb-4">
                        <label className="form-label gold-text">
                          <i className="fas fa-clock me-2"></i>
                          Transaction Time Lock
                        </label>
                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control quantum-input gold"
                            value={timeLockDuration}
                            onChange={(e) => updateSetting(
                              setTimeLockDuration,
                              parseInt(e.target.value),
                              "Time lock duration updated"
                            )}
                            min="0"
                            max="72"
                          />
                          <span className="input-group-text quantum-input-addon gold">Hours</span>
                        </div>
                        <div className="form-text quantum-form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          Delay before high-value transactions are processed
                        </div>
                      </div>
  
                      {/* Hash Algorithm */}
                      <div className="mb-4">
                        <label className="form-label gold-text">
                          <i className="fas fa-hashtag me-2"></i>
                          Hash Algorithm
                        </label>
                        <select 
                          className="form-select quantum-input gold"
                          value={hashAlgorithm}
                          onChange={(e) => updateSetting(
                            setHashAlgorithm,
                            e.target.value,
                            "Hash algorithm updated"
                          )}
                        >
                          <option value="sha256">SHA-256 (Standard)</option>
                          <option value="sha3">SHA-3 (Recommended)</option>
                          <option value="blake2">BLAKE2 (Enhanced)</option>
                        </select>
                        <div className="form-text quantum-form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          Algorithm used for transaction verification
                        </div>
                      </div>
  
                      {/* Security Tips */}
                      <div className="alert quantum-tips mt-4">
                        <h6 className="gold-text">
                          <i className="fas fa-lightbulb me-2"></i>
                          Security Best Practices
                        </h6>
                        <ul className="quantum-tips-list mb-0 mt-2">
                          <li><i className="fas fa-check-circle me-2 gold-text"></i>Only whitelist addresses you regularly interact with</li>
                          <li><i className="fas fa-check-circle me-2 gold-text"></i>Enable MFA for all critical operations</li>
                          <li><i className="fas fa-check-circle me-2 gold-text"></i>Use time locks for large transactions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
  
            {/* Quantum Protection Tab */}
            {activeTab === "quantum" && (
              <div className="row">
                {message.text && activeTab === "quantum" && (
                  <div className="col-12 mb-4">
                    <div className={`alert alert-${message.type} quantum-alert border-0`}>
                      {message.text}
                    </div>
                  </div>
                )}
                
                <div className="col-lg-6">
                  <div className="quantum-card purple-card mb-4">
                    <div className="card-header purple-header border-0">
                      <div className="d-flex align-items-center">
                        <div className="feature-icon purple-icon">
                          ⚛️
                        </div>
                        <h5 className="ms-3 mb-0">Quantum Resistant Cryptography</h5>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      {/* Quantum Resistance */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label purple-text mb-0">
                            <i className="fas fa-atom me-2"></i>
                            Quantum Resistance Mode
                          </label>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="quantumResistanceToggle"
                              checked={quantumResistanceEnabled}
                              onChange={() => updateSetting(
                                setQuantumResistanceEnabled,
                                !quantumResistanceEnabled,
                                `Quantum resistance ${!quantumResistanceEnabled ? "enabled" : "disabled"}`
                              )}
                            />
                          </div>
                        </div>
                        <div className="form-text quantum-form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          Enable post-quantum cryptographic protections
                        </div>
                      </div>
  
                      {/* Lattice-Based Encryption */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label purple-text mb-0">
                            <i className="fas fa-cubes me-2"></i>
                            Lattice-Based Encryption
                          </label>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="latticeEncryptionToggle"
                              checked={latticeEncryption}
                              onChange={() => updateSetting(
                                setLatticeEncryption,
                                !latticeEncryption,
                                `Lattice-based encryption ${!latticeEncryption ? "enabled" : "disabled"}`
                              )}
                              disabled={!quantumResistanceEnabled}
                            />
                          </div>
                        </div>
                        <div className="form-text quantum-form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          Use NIST-approved lattice cryptography for key exchange
                        </div>
                      </div>
  
                      {/* Quantum RNG */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label purple-text mb-0">
                            <i className="fas fa-random me-2"></i>
                            Quantum Random Number Generator
                          </label>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="quantumRNGToggle"
                              checked={quantumRNG}
                              onChange={() => updateSetting(
                                setQuantumRNG,
                                !quantumRNG,
                                `Quantum RNG ${!quantumRNG ? "enabled" : "disabled"}`
                              )}
                              disabled={!quantumResistanceEnabled}
                            />
                          </div>
                        </div>
                        <div className="form-text quantum-form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          Use quantum sources of entropy for key generation
                        </div>
                      </div>
  
                      {/* Quantum Hash Signature */}
                      <div className="mb-4">
                        <label className="form-label purple-text">
                          <i className="fas fa-signature me-2"></i>
                          Post-Quantum Signature Scheme
                        </label>
                        <select 
                          className="form-select quantum-input purple"
                          value={hashSignatureScheme}
                          onChange={(e) => updateSetting(
                            setHashSignatureScheme,
                            e.target.value,
                            "Signature scheme updated"
                          )}
                          disabled={!quantumResistanceEnabled}
                        >
                          <option value="ecdsa">ECDSA (Not Quantum-Safe)</option>
                          <option value="falcon">FALCON (NIST Round 3)</option>
                          <option value="dilithium">Dilithium (NIST Selected)</option>
                          <option value="sphincs">SPHINCS+ (Hash-Based)</option>
                        </select>
                        <div className="form-text quantum-form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          Algorithm used for transaction signatures
                        </div>
                      </div>
  
                      {/* Entropy Source */}
                      <div className="mb-4">
                        <label className="form-label purple-text">
                          <i className="fas fa-dice me-2"></i>
                          Entropy Source
                        </label>
                        <select 
                          className="form-select quantum-input purple"
                          value={entropySource}
                          onChange={(e) => updateSetting(
                            setEntropySource,
                            e.target.value,
                            "Entropy source updated"
                          )}
                        >
                          <option value="system">System (Standard)</option>
                          <option value="hybrid">Hybrid (Enhanced)</option>
                          <option value="quantum">Quantum (Maximum Security)</option>
                        </select>
                        <div className="form-text quantum-form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          Source of randomness for cryptographic operations
                        </div>
                      </div>
  
                      <div className="d-grid">
                        <button
                          type="button"
                          className="btn btn-lg quantum-btn-purple"
                          onClick={saveQuantumSettings}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Saving Quantum Settings...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-atom me-2"></i>
                              Save Quantum Settings
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
  
                <div className="col-lg-6">
                  <div className="quantum-card green-card mb-4">
                    <div className="card-header green-header border-0">
                      <div className="d-flex align-items-center">
                        <div className="feature-icon green-icon">
                          🔒
                        </div>
                        <h5 className="ms-3 mb-0">Advanced Quantum Protection</h5>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      {/* Zero-Knowledge Proofs */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label green-text mb-0">
                            <i className="fas fa-mask me-2"></i>
                            Zero-Knowledge Proofs
                          </label>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="zkProofsToggle"
                              checked={zeroKnowledgeProofs}
                              onChange={() => updateSetting(
                                setZeroKnowledgeProofs,
                                !zeroKnowledgeProofs,
                                `Zero-knowledge proofs ${!zeroKnowledgeProofs ? "enabled" : "disabled"}`
                              )}
                            />
                          </div>
                        </div>
                        <div className="form-text quantum-form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          Use ZK proofs for transaction verification
                        </div>
                      </div>
  
                      {/* Quantum Entanglement Verification */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label green-text mb-0">
                            <i className="fas fa-link me-2"></i>
                            Quantum Entanglement Verification
                          </label>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="entanglementToggle"
                              checked={quantumEntanglementVerification}
                              onChange={() => updateSetting(
                                setQuantumEntanglementVerification,
                                !quantumEntanglementVerification,
                                `Quantum entanglement verification ${!quantumEntanglementVerification ? "enabled" : "disabled"}`
                              )}
                              disabled={!quantumResistanceEnabled}
                            />
                          </div>
                        </div>
                        <div className="form-text quantum-form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          Experimental: Uses quantum properties for enhanced security
                        </div>
                      </div>
  
                      {/* Quantum Security Level */}
                      <div className="mb-4">
                        <label className="form-label green-text mb-0">
                          <i className="fas fa-tachometer-alt me-2"></i>
                          Quantum Security Level
                        </label>
                        <div className="quantum-progress mt-2">
                          <div className="progress">
                            <div 
                              className="progress-bar bg-success" 
                              role="progressbar" 
                              style={{ 
                                width: securityLevel === "quantum" ? "100%" :  securityLevel === "advanced" ? "66%" : "33%" 
                              }}
                              aria-valuenow={
                                securityLevel === "quantum" ? "100" : 
                                securityLevel === "advanced" ? "66" : "33"
                              }
                              aria-valuemin="0" 
                              aria-valuemax="100"
                            ></div>
                          </div>
                          <div className="d-flex justify-content-between mt-1">
                            <small>Standard</small>
                            <small>Advanced</small>
                            <small>Quantum</small>
                          </div>
                        </div>
                        <div className="form-text quantum-form-text mt-2">
                          <i className="fas fa-info-circle me-1"></i>
                          Current protection level: {securityLevel === "quantum" ? "Maximum (Quantum Resistant)" : 
                                                    securityLevel === "advanced" ? "High" : "Basic"}
                        </div>
                      </div>
  
                      {/* Quantum Security Info */}
                      <div className="quantum-info-card mt-4">
                        <h6 className="green-text mb-3">
                          <i className="fas fa-info-circle me-2"></i>
                          About Quantum Computing Threats
                        </h6>
                        <p className="small mb-3">
                          Quantum computers pose significant threats to traditional cryptography:
                        </p>
                        <ul className="quantum-info-list">
                          <li>
                            <span className="icon-bullet">
                              <i className="fas fa-exclamation-triangle text-warning"></i>
                            </span>
                            <span>
                              <strong>Shor's Algorithm</strong> can break RSA, ECC, DSA, and DH 
                            </span>
                          </li>
                          <li>
                            <span className="icon-bullet">
                              <i className="fas fa-exclamation-triangle text-warning"></i>
                            </span>
                            <span>
                              <strong>Grover's Algorithm</strong> reduces symmetric key security
                            </span>
                          </li>
                          <li>
                            <span className="icon-bullet">
                              <i className="fas fa-shield-alt text-success"></i>
                            </span>
                            <span>
                              <strong>Post-Quantum Cryptography</strong> uses lattice-based, hash-based, and code-based algorithms
                            </span>
                          </li>
                          <li>
                            <span className="icon-bullet">
                              <i className="fas fa-shield-alt text-success"></i>
                            </span>
                            <span>
                              <strong>Hybrid approaches</strong> combine classical and quantum-resistant methods
                            </span>
                          </li>
                        </ul>
                      </div>
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