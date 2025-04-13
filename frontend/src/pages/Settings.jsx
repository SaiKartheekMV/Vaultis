import React, { useEffect, useState } from "react";
import { getContract } from "../services/contract";

function Settings() {
  const [userAddress, setUserAddress] = useState("");
  const [backupAddress, setBackupAddress] = useState("");
  const [currentBackup, setCurrentBackup] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserAddress(storedUser);
      fetchBackupAddress(storedUser);
    }
  }, []);

  const fetchBackupAddress = async (address) => {
    try {
      const contract = await getContract();
      const backup = await contract.getBackupAddress(address);
      if (backup && backup !== "0x0000000000000000000000000000000000000000") {
        setCurrentBackup(backup);
      }
    } catch (error) {
      console.error("Error fetching backup address:", error);
    }
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

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h4 className="mb-0">⚙️ Account Settings</h4>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h5>👤 Your Wallet Address</h5>
                <code className="d-block p-2 bg-light border rounded">{userAddress}</code>
              </div>

              <div className="mb-4">
                <h5>🔐 Current Backup Address</h5>
                {currentBackup ? (
                  <code className="d-block p-2 bg-light border rounded">{currentBackup}</code>
                ) : (
                  <p className="text-muted">No backup address set. Configure one below for emergency recovery.</p>
                )}
              </div>

              <hr />

              <form onSubmit={handleSubmit}>
                <h5>🛡️ Set Backup Recovery Address</h5>
                <p className="text-muted mb-3">
                  This address will be able to recover your files in case you lose access to your main wallet.
                </p>

                {message.text && (
                  <div className={`alert alert-${message.type} mb-3`}>
                    {message.text}
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="backupAddress" className="form-label">Ethereum Address (0x...)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="backupAddress"
                    value={backupAddress}
                    onChange={(e) => setBackupAddress(e.target.value)}
                    placeholder="0x0000000000000000000000000000000000000000"
                    required
                  />
                  <div className="form-text">
                    Enter a valid Ethereum address that you control and keep secure.
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Save Backup Address"}
                </button>
              </form>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">📝 Security Recommendations</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <strong>💼 Use a hardware wallet</strong> - Securely store your keys offline
                </li>
                <li className="list-group-item">
                  <strong>🔄 Regularly verify backup address</strong> - Ensure it's still accessible to you
                </li>
                <li className="list-group-item">
                  <strong>⚠️ Never share private keys</strong> - Not even with support or admin users
                </li>
                <li className="list-group-item">
                  <strong>📱 Enable 2FA where possible</strong> - Add an extra layer of security
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;