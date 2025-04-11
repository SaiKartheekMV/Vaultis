import React, { useState } from 'react';

function GrantAccess({ fileId }) {
  const [address, setAddress] = useState('');

  const handleGrant = () => {
    if (!address) return alert('Enter a wallet address!');
    alert(`Access granted to: ${address} for file #${fileId}`);
  };

  return (
    <div className="card shadow">
      <div className="card-body">
        <h5 className="card-title">👤 Grant Access</h5>
        <input
          type="text"
          className="form-control mb-2"
          placeholder="0xabc123..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button className="btn btn-success" onClick={handleGrant}>
          Grant Access
        </button>
      </div>
    </div>
  );
}

export default GrantAccess;
