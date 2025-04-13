import React, { useEffect, useState } from 'react';
import { getContract } from '../services/contract';

function Dashboard() {
  const [userAddress, setUserAddress] = useState('');
  const [stats, setStats] = useState({
    totalFiles: 0,
    sharedFiles: 0,
    lastActivity: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserAddress(storedUser);
      fetchUserStats(storedUser);
    }
  }, []);

  const fetchUserStats = async (address) => {
    try {
      setLoading(true);
      const contract = await getContract();
      
      // Get all accessible files to calculate stats
      const result = await contract.getAccessibleFiles();
      // eslint-disable-next-line no-unused-vars
      const [fileIds, cids, owners, uploaders, timestamps] = result;
      
      // Calculate statistics
      const userFiles = fileIds.filter((_, index) => 
        uploaders[index].toLowerCase() === address.toLowerCase()
      );
      
      const sharedFiles = fileIds.filter((_, index) => 
        owners[index].toLowerCase() !== uploaders[index].toLowerCase() && 
        (owners[index].toLowerCase() === address.toLowerCase() || 
         uploaders[index].toLowerCase() === address.toLowerCase())
      );
      
      // Find the latest activity timestamp
      let latestTimestamp = 0;
      timestamps.forEach(timestamp => {
        const ts = Number(timestamp);
        if (ts > latestTimestamp) latestTimestamp = ts;
      });
      
      setStats({
        totalFiles: userFiles.length,
        sharedFiles: sharedFiles.length,
        lastActivity: latestTimestamp ? new Date(latestTimestamp * 1000) : null
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No activity yet';
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <h2 className="text-info">🔐 Welcome to Vaultis</h2>
        <p className="lead">Decentralized Quantum-Secure Storage using IPFS + Blockchain + PQC</p>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5>👤 Connected Wallet Address</h5>
          <code className="d-block p-2 bg-light border rounded text-warning">{userAddress}</code>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100 text-center">
            <div className="card-body">
              <h3 className="text-primary">{loading ? "..." : stats.totalFiles}</h3>
              <p className="mb-0">Total Files</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100 text-center">
            <div className="card-body">
              <h3 className="text-success">{loading ? "..." : stats.sharedFiles}</h3>
              <p className="mb-0">Shared Files</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100 text-center">
            <div className="card-body">
              <h3 className="text-info">{loading ? "..." : formatDate(stats.lastActivity).split(' ')[0]}</h3>
              <p className="mb-0">Last Activity</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <h5 className="mb-0">🔍 Features Coming Soon</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-info text-white p-2 me-3">
                  <i className="bi bi-box"></i>
                </div>
                <div>
                  <h6 className="mb-0">Track File Upload History</h6>
                  <small className="text-muted">View detailed upload logs and analytics</small>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-warning text-white p-2 me-3">
                  <i className="bi bi-people"></i>
                </div>
                <div>
                  <h6 className="mb-0">Advanced Access Control</h6>
                  <small className="text-muted">Role-based permissions and time-limited access</small>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-success text-white p-2 me-3">
                  <i className="bi bi-globe"></i>
                </div>
                <div>
                  <h6 className="mb-0">View Shared Files</h6>
                  <small className="text-muted">Enhanced sharing dashboard and notifications</small>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-danger text-white p-2 me-3">
                  <i className="bi bi-graph-up"></i>
                </div>
                <div>
                  <h6 className="mb-0">Dashboard Analytics</h6>
                  <small className="text-muted">Advanced usage metrics and storage insights</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;