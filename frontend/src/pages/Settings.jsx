import React, { useEffect, useState } from 'react';

function Settings() {
  const [userAddress, setUserAddress] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserAddress(storedUser);
    }
  }, []);

  return (
    <div className="p-3">
      <h3>⚙️ Settings</h3>
      <hr />

      <h5>👤 Your Profile</h5>
      <p><strong>Wallet Address:</strong> <code>{userAddress}</code></p>

      <h5 className="mt-4">🎨 Preferences</h5>
      <p><strong>Theme:</strong> Quantum Night Mode (Coming Soon...)</p>
      <p><strong>Notifications:</strong> Email Alerts (Coming Soon...)</p>

      <h5 className="mt-4">🔒 Security</h5>
      <p>Enable Two-Factor Authentication (Coming Soon...)</p>
    </div>
  );
}

export default Settings;
