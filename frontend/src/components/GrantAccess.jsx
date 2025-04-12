import React, { useState } from 'react';

function GrantAccess({ fileId }) {
  const [address, setAddress] = useState('');

  const handleGrant = () => {
    alert(`Access granted to ${address} for File ID ${fileId}`);
  };

  return (
    <div className="card p-3 border-dark shadow-sm">
      <h5 className="text-dark">🔑 Grant Access</h5>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Wallet address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button className="btn btn-dark" onClick={handleGrant}>Grant</button>
      </div>
    </div>
  );
}

export default GrantAccess;
