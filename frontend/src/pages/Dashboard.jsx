import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [userAddress, setUserAddress] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserAddress(storedUser);
    }
  }, []);

  return (
    <div className="text-center">
      <h2 className="mb-4 text-info">🔐 Welcome to Vaultis</h2>
      <p>Decentralized Quantum-Secure Storage using IPFS + Blockchain + PQC.</p>

      <div className="mt-4">
        <h5>👤 Connected Wallet Address:</h5>
        <code className="text-warning">{userAddress}</code>
      </div>

      <div className="mt-5">
        <h5>🔍 Features Coming Soon:</h5>
        <ul className="list-unstyled">
          <li>📦 Track File Upload History</li>
          <li>👥 Access Control Panel</li>
          <li>🌐 View Shared Files</li>
          <li>📊 Dashboard Analytics</li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
