import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getContract } from '../services/contract';

function FileRecovery() {
  const [missingFiles, setMissingFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [privateKey, setPrivateKey] = useState('');
  const [email, setEmail] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState('');
  const [recoveryProgress, setRecoveryProgress] = useState(0);
  const [isEmailConfigured, setIsEmailConfigured] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const monitoringIntervalRef = useRef(null);

  useEffect(() => {
    // Check if user has email configured
    const storedEmail = getUserEmail();
    if (storedEmail) {
      setEmail(storedEmail);
      setIsEmailConfigured(true);
      setNotificationsEnabled(localStorage.getItem('notificationsEnabled') === 'true');
    }
    
    // Load missing files
    checkMissingFiles();
    
    // Set up monitoring service if notifications are enabled
    if (localStorage.getItem('notificationsEnabled') === 'true') {
      startMonitoringService();
    }
    
    return () => {
      // Clean up monitoring service
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, []);

  // Get user email from local storage
  const getUserEmail = () => {
    if (!window.ethereum) return null;
    
    try {
      const walletAddress = localStorage.getItem('walletAddress');
      return localStorage.getItem(`userEmail_${walletAddress}`);
    } catch (err) {
      console.error("Error getting user email:", err);
      return null;
    }
  };

  // Save user email to local storage
  const saveUserEmail = async (emailAddress) => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error("No wallet connected");
      }
      
      const walletAddress = accounts[0];
      localStorage.setItem(`userEmail_${walletAddress}`, emailAddress);
      localStorage.setItem('walletAddress', walletAddress);
      
      return true;
    } catch (err) {
      console.error("Error saving user email:", err);
      return false;
    }
  };

  // Check for missing files
  const checkMissingFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!window.ethereum) {
        throw new Error("MetaMask not detected");
      }
      
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error("Please connect your wallet to view files");
      }
      
      const userAddress = accounts[0];
      const contract = await getContract();
      
      // Get file count from contract
      const fileCount = await contract.getFileCount();
      const unavailableFiles = [];
      
      // Fetch all files that belong to the current user
      for (let i = 0; i < fileCount; i++) {
        try {
          const fileData = await contract.getFileData(i);
          
          if (fileData.owner?.toLowerCase() === userAddress?.toLowerCase()) {
            // Check file availability
            try {
              const response = await axios.get(`http://localhost:5000/api/check-file/${fileData.cid}`);
              
              if (!response.data.available) {
                unavailableFiles.push({
                  id: i,
                  cid: fileData.cid,
                  timestamp: new Date(Number(fileData.timestamp) * 1000),
                  status: 'unavailable'
                });
              }
            } catch (err) {
              unavailableFiles.push({
                id: i,
                cid: fileData.cid,
                timestamp: new Date(Number(fileData.timestamp) * 1000),
                status: 'error',
                error: err.message
              });
            }
          }
        } catch (err) {
          console.error(`Error fetching file ${i}:`, err);
        }
      }
      
      setMissingFiles(unavailableFiles);
    } catch (err) {
      console.error("Error checking missing files:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Start file monitoring service
  const startMonitoringService = () => {
    // Check for missing files hourly
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }
    
    monitoringIntervalRef.current = setInterval(() => {
      checkMissingFiles();
    }, 3600000); // Check every hour
    
    console.log("File monitoring service started");
  };

  // Stop file monitoring service
  const stopMonitoringService = () => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
      console.log("File monitoring service stopped");
    }
  };

  // Handle email configuration
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setNotificationStatus('Please enter a valid email address');
      return;
    }
    
    const success = await saveUserEmail(email);
    
    if (success) {
      setIsEmailConfigured(true);
      setNotificationStatus('Email configured successfully! You will receive notifications for missing files.');
    } else {
      setNotificationStatus('Failed to save email configuration');
    }
  };

  // Toggle notification settings
  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('notificationsEnabled', newValue.toString());
    
    if (newValue) {
      startMonitoringService();
      setNotificationStatus('File monitoring notifications enabled');
    } else {
      stopMonitoringService();
      setNotificationStatus('File monitoring notifications disabled');
    }
  };

  // Handle file recovery attempt
  const attemptRecovery = async (file) => {
    setSelectedFile(file);
    setPrivateKey('');
    setRecoveryStatus('');
    setRecoveryProgress(0);
  };

  // Submit recovery request with private key
  const submitRecovery = async (e) => {
    e.preventDefault();
    
    if (!selectedFile || !privateKey) {
      setRecoveryStatus('Please provide your private key to recover this file');
      return;
    }
    
    try {
      setRecoveryStatus('Attempting to recover file...');
      setRecoveryProgress(10);
      
      // Step 1: Request server to check IPFS nodes for file
      setRecoveryProgress(30);
      const checkResponse = await axios.post('http://localhost:5000/api/recover-file/check', {
        cid: selectedFile.cid
      });
      
      if (!checkResponse.data.found) {
        // File not found in connected IPFS nodes
        setRecoveryProgress(0);
        setRecoveryStatus('❌ File not found on any connected IPFS nodes. Attempting to restore from backup...');
        
        // Step 2: Try to restore from backup
        setRecoveryProgress(50);
        const backupResponse = await axios.post('http://localhost:5000/api/recover-file/backup', {
          cid: selectedFile.cid,
          privateKey: privateKey
        });
        
        if (backupResponse.data.success) {
          // Successfully restored from backup
          setRecoveryProgress(100);
          setRecoveryStatus('✅ File successfully recovered from backup! It is now available in your file list.');
          
          // Refresh missing files list
          setTimeout(() => {
            checkMissingFiles();
            setSelectedFile(null);
          }, 3000);
        } else {
          // Backup restoration failed
          setRecoveryProgress(0);
          setRecoveryStatus(`❌ Failed to recover file: ${backupResponse.data.error || 'Unknown error'}`);
          
          // If email is configured, send notification about failed recovery
          if (isEmailConfigured && notificationsEnabled) {
            await sendRecoveryFailureEmail(selectedFile.cid);
          }
        }
      } else {
        // File found in IPFS nodes
        setRecoveryProgress(70);
        const pinResponse = await axios.post('http://localhost:5000/api/recover-file/pin', {
          cid: selectedFile.cid
        });
        
        if (pinResponse.data.success) {
          // Successfully pinned file
          setRecoveryProgress(100);
          setRecoveryStatus('✅ File successfully recovered! It is now pinned and available in your file list.');
          
          // Refresh missing files list
          setTimeout(() => {
            checkMissingFiles();
            setSelectedFile(null);
          }, 3000);
        } else {
          // Pinning failed
          setRecoveryProgress(0);
          setRecoveryStatus(`❌ Failed to recover file: ${pinResponse.data.error || 'Unknown error'}`);
        }
      }
    } catch (err) {
      console.error("Recovery error:", err);
      setRecoveryProgress(0);
      setRecoveryStatus(`❌ Recovery failed: ${err.message}`);
    }
  };

  // Send email about failed recovery
  const sendRecoveryFailureEmail = async (cid) => {
    try {
      const response = await axios.post('http://localhost:5000/api/send-email', {
        to: email,
        subject: "File Recovery Failed: Action Required",
        message: `We were unable to recover your file (CID: ${cid}). Please ensure you have the correct private key and try again.`
      });
      
      return response.data.success;
    } catch (err) {
      console.error("Failed to send recovery failure email:", err);
      return false;
    }
  };

  // Send test email notification
  const sendTestEmail = async () => {
    try {
      setNotificationStatus('Sending test email...');
      
      const response = await axios.post('http://localhost:5000/api/send-email', {
        to: email,
        subject: "Test Email - Quantum File Storage",
        message: "This is a test email from your Quantum-Secured File Storage system. Email notifications are working correctly!"
      });
      
      if (response.data.success) {
        setNotificationStatus('✅ Test email sent successfully!');
      } else {
        setNotificationStatus('❌ Failed to send test email');
      }
    } catch (err) {
      console.error("Error sending test email:", err);
      setNotificationStatus(`❌ Error sending test email: ${err.message}`);
    }
  };

  // Request manual backup check
  const requestManualCheck = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await checkMissingFiles();
      
      if (missingFiles.length === 0) {
        setError("All files are currently available. No recovery needed.");
      }
    } catch (err) {
      setError(`Check failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-recovery-container">
      {/* Header with quantum-themed gradient */}
      <div className="p-4 mb-4" style={{
        background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '12px',
        borderBottom: '1px solid rgba(12, 235, 243, 0.3)',
      }}>
        <div className="d-flex align-items-center">
          <div className="me-3 p-2 rounded-circle" style={{
            background: 'rgba(12, 235, 243, 0.15)',
            boxShadow: '0 0 10px rgba(12, 235, 243, 0.3)',
          }}>
            <span style={{ fontSize: '1.25rem' }}>🔄</span>
          </div>
          <h4 className="mb-0" style={{ 
            background: 'linear-gradient(90deg, #ffffff, #0cebf3)', 
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'monospace',
            letterSpacing: '1px'
          }}>
            QUANTUM FILE RECOVERY
          </h4>
        </div>
      </div>

      {/* Email Configuration Section */}
      <div className="card border-0 p-4 mb-4 shadow-lg" style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        borderRadius: '12px',
      }}>
        <h5 className="mb-3">Email Notification Settings</h5>
        
        {!isEmailConfigured ? (
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-3">
              <label className="form-label">Your Email Address</label>
              <div className="input-group">
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  style={{
                    borderColor: 'rgba(12, 235, 243, 0.3)',
                  }}
                />
                <button 
                  type="submit" 
                  className="btn text-white"
                  style={{
                    background: 'linear-gradient(90deg, #0cebf3, #7367f0)',
                    boxShadow: '0 4px 6px rgba(12, 235, 243, 0.2)',
                  }}
                >
                  Save Email
                </button>
              </div>
              <small className="text-muted">You'll receive notifications when files are missing or recovered</small>
            </div>
          </form>
        ) : (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <p className="mb-0">Notifications sent to: <strong>{email}</strong></p>
                <div className="form-check form-switch mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={toggleNotifications}
                    id="notificationToggle"
                    style={{
                      background: notificationsEnabled ? '#0cebf3' : '',
                      borderColor: 'rgba(12, 235, 243, 0.5)',
                    }}
                  />
                  <label className="form-check-label" htmlFor="notificationToggle">
                    {notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled'}
                  </label>
                </div>
              </div>
              <div>
                <button 
                  className="btn btn-sm me-2" 
                  onClick={() => setIsEmailConfigured(false)}
                  style={{
                    background: 'rgba(12, 235, 243, 0.1)',
                    border: '1px solid rgba(12, 235, 243, 0.3)',
                    color: '#16213e',
                  }}
                >
                  Change Email
                </button>
                <button 
                  className="btn btn-sm"
                  onClick={sendTestEmail}
                  style={{
                    background: 'rgba(12, 235, 243, 0.1)',
                    border: '1px solid rgba(12, 235, 243, 0.3)',
                    color: '#16213e',
                  }}
                >
                  Send Test Email
                </button>
              </div>
            </div>
          </div>
        )}
        
        {notificationStatus && (
          <div className={`alert ${notificationStatus.includes('❌') ? 'alert-danger' : 'alert-info'} mt-3 mb-0`} role="alert">
            {notificationStatus}
          </div>
        )}
      </div>

      {/* Missing Files Section */}
      <div className="card border-0 p-4 shadow-lg" style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        borderRadius: '12px',
      }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0">Files Requiring Recovery</h5>
          <button 
            className="btn btn-sm" 
            onClick={requestManualCheck}
            disabled={loading}
            style={{
              background: 'rgba(12, 235, 243, 0.1)',
              border: '1px solid rgba(12, 235, 243, 0.3)',
              color: '#16213e',
            }}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2"></span>Checking...</>
            ) : (
              <>🔍 Check for Missing Files</>
            )}
          </button>
        </div>

        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            {error}
          </div>
        )}

        {missingFiles.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3" style={{ fontSize: '3rem' }}>🎉</div>
            <h5 className="mb-2">All Files Available</h5>
            <p className="text-muted">No files currently need recovery. All your quantum-encrypted files are accessible.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>CID</th>
                  <th>Upload Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {missingFiles.map(file => (
                  <tr key={file.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {file.cid.substring(0, 12)}...{file.cid.substring(file.cid.length - 8)}
                    </td>
                    <td>{file.timestamp.toLocaleString()}</td>
                    <td>
                      <span className="badge bg-danger">Unavailable</span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm" 
                        onClick={() => attemptRecovery(file)}
                        style={{
                          background: 'linear-gradient(90deg, #0cebf3, #7367f0)',
                          color: 'white',
                        }}
                      >
                        Recover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recovery Modal */}
      {selectedFile && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="modal-header" style={{
                background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)',
                borderBottom: '1px solid rgba(12, 235, 243, 0.3)',
              }}>
                <h5 className="modal-title" style={{ 
                  background: 'linear-gradient(90deg, #ffffff, #0cebf3)', 
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>File Recovery</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedFile(null)}></button>
              </div>
              <div className="modal-body">
                <p>To recover your file, please provide your private key:</p>
                <div className="mb-3">
                  <label className="form-label">CID</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={selectedFile.cid}
                    readOnly
                    style={{
                      fontFamily: 'monospace',
                      backgroundColor: 'rgba(22, 33, 62, 0.03)',
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Your Quantum Private Key</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Paste your private key here"
                    style={{
                      fontFamily: 'monospace',
                      borderColor: 'rgba(12, 235, 243, 0.3)',
                    }}
                  ></textarea>
                  <small className="text-muted">This is the private key you saved when uploading the file</small>
                </div>
                
                {recoveryStatus && (
                  <div className={`alert ${recoveryStatus.includes('❌') ? 'alert-danger' : 'alert-info'} mt-3`} role="alert">
                    {recoveryStatus}
                  </div>
                )}
                
                {recoveryProgress > 0 && (
                  <div className="mt-3">
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ 
                          width: `${recoveryProgress}%`,
                          background: 'linear-gradient(90deg, #0cebf3, #7367f0)',
                        }} 
                        aria-valuenow={recoveryProgress} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedFile(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn text-white"
                  onClick={submitRecovery}
                  disabled={recoveryProgress > 0 && recoveryProgress < 100}
                  style={{
                    background: 'linear-gradient(90deg, #0cebf3, #7367f0)',
                  }}
                >
                  {recoveryProgress > 0 && recoveryProgress < 100 ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Recovering...</>
                  ) : (
                    'Recover File'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quantum-inspired footer decoration */}
      <div className="mt-4 text-center" style={{ opacity: 0.7 }}>
        <div style={{ 
          width: '120px', 
          height: '1px',
          margin: '0 auto',
          background: 'linear-gradient(90deg, rgba(12, 235, 243, 0), rgba(255, 215, 0, 0.6), rgba(12, 235, 243, 0))'
        }}></div>
        <small className="text-muted d-block mt-2" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
          QUANTUM-SECURED • FILE RECOVERY SYSTEM
        </small>
      </div>
    </div>
  );
}

export default FileRecovery;