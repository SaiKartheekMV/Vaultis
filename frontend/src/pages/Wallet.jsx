import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './Wallet.css';

function Wallet() {
  const [account, setAccount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [network, setNetwork] = useState(null);
  
  // Sepolia testnet chainId (hex and decimal)
  const SEPOLIA_CHAIN_ID = '0xaa36a7'; // Hex representation
  const SEPOLIA_CHAIN_ID_DECIMAL = '11155111'; // Decimal representation
  
  // Load wallet data and set up event listeners
  useEffect(() => {
    const loadWalletData = async () => {
      try {
        setLoading(true);
        // Check if user is already logged in
        const savedAddress = localStorage.getItem("user");
        
        if (savedAddress && window.ethereum) {
          // Connect to wallet
          const provider = new ethers.BrowserProvider(window.ethereum);
          
          // Check if connected to Sepolia
          const network = await provider.getNetwork();
          const chainId = network.chainId.toString();
          setNetwork(network.name);
          
          // Ensure user is on Sepolia network
          if (chainId !== SEPOLIA_CHAIN_ID_DECIMAL) {
            setError("Please connect to Sepolia testnet in your wallet");
            // Prompt user to switch to Sepolia
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: SEPOLIA_CHAIN_ID }], // Use the hex chain ID here
              });
              // Wait a moment for network to switch before proceeding
              await new Promise(resolve => setTimeout(resolve, 1000));
              // Refresh the page to reflect the new network
              window.location.reload();
              return;
            } catch (switchError) {
              // User rejected the network switch
              console.error("Failed to switch to Sepolia:", switchError);
            }
            setLoading(false);
            return;
          }
          
          // Update account state
          setAccount(savedAddress);
          
          // Fetch transaction history
          await fetchTransactionHistory(savedAddress);
        } else {
          // User not logged in, redirect to login page
          window.location.href = "/login";
        }
      } catch (err) {
        console.error("Error loading wallet data:", err);
        setError("Failed to load transaction data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadWalletData();
    
    // Set up event listeners for wallet changes
    if (window.ethereum) {
      // Listen for account changes
      const accountsChangedHandler = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          localStorage.removeItem("user");
          window.location.href = "/login";
        } else {
          // User switched accounts
          const newAccount = accounts[0];
          setAccount(newAccount);
          localStorage.setItem("user", newAccount);
          refreshTransactions(newAccount);
        }
      };
      
      // Listen for chain changes
      const chainChangedHandler = (chainId) => {
        // Convert hex chainId to decimal for comparison
        const chainIdDecimal = parseInt(chainId, 16).toString();
        if (chainIdDecimal !== SEPOLIA_CHAIN_ID_DECIMAL) {
          setError("Please connect to Sepolia testnet");
        } else {
          setError(null);
          window.location.reload();
        }
      };
      
      window.ethereum.on('accountsChanged', accountsChangedHandler);
      window.ethereum.on('chainChanged', chainChangedHandler);
      
      // Set up polling for transaction updates
      const updateInterval = setInterval(() => {
        const savedAddress = localStorage.getItem("user");
        if (savedAddress && window.ethereum) {
          refreshTransactions(savedAddress, false);
        }
      }, 15000); // Check for updates every 15 seconds
      
      return () => {
        // Clean up listeners when component unmounts
        window.ethereum.removeListener('accountsChanged', accountsChangedHandler);
        window.ethereum.removeListener('chainChanged', chainChangedHandler);
        clearInterval(updateInterval);
      };
    }
  }, []);

  // Improved transaction history fetching
  const fetchTransactionHistory = async (address) => {
    try {
      if (!window.ethereum) throw new Error("Ethereum provider not found");
      
      setError(null); // Clear any previous errors
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Get recent blocks
      const blockNumber = await provider.getBlockNumber();
      
      // We'll scan the last 100 blocks for better transaction coverage
      const blocksToScan = 100;
      const startBlock = Math.max(0, blockNumber - blocksToScan);
      
      console.log(`Scanning blocks ${startBlock} to ${blockNumber} for transactions...`);
      
      // Create an array to collect transactions
      let allTransactions = [];
      
      // Scan blocks more efficiently - process in batches
      const batchSize = 10;
      
      for (let i = 0; i < blocksToScan; i += batchSize) {
        // Create an array of promises for the batch
        const blockPromises = [];
        
        for (let j = 0; j < batchSize && i + j < blocksToScan; j++) {
          const blockToCheck = blockNumber - (i + j);
          if (blockToCheck < 0) continue;
          
          blockPromises.push(provider.getBlockWithTransactions(blockToCheck));
        }
        
        // Process the batch of blocks in parallel
        const blocks = await Promise.all(blockPromises);
        
        // Process each block's transactions
        for (const block of blocks) {
          if (!block || !block.transactions) continue;
          
          // Filter for transactions related to this address
          const relevantTxs = block.transactions.filter(tx => 
            (tx.from && tx.from.toLowerCase() === address.toLowerCase()) || 
            (tx.to && tx.to?.toLowerCase() === address.toLowerCase())
          );
          
          if (relevantTxs.length > 0) {
            // Format transactions
            const formattedTxs = await Promise.all(relevantTxs.map(async (tx) => {
              try {
                // Get transaction receipt for confirmation status
                const receipt = await provider.getTransactionReceipt(tx.hash);
                
                // Get current block for confirmation count
                const confirmations = receipt ? blockNumber - receipt.blockNumber + 1 : 0;
                
                // Format date
                const timestamp = block.timestamp ? 
                  new Date(Number(block.timestamp) * 1000).toLocaleString() : 'Pending';
                
                // Format transaction
                return {
                  hash: tx.hash,
                  type: tx.from.toLowerCase() === address.toLowerCase() ? 'Sent' : 'Received',
                  timestamp: timestamp,
                  amount: tx.value ? `${ethers.formatEther(tx.value)} ETH` : '0 ETH',
                  status: receipt ? (receipt.status ? 'Confirmed' : 'Failed') : 'Pending',
                  confirmations: confirmations,
                  to: tx.to || 'Contract Creation',
                  from: tx.from,
                  gasUsed: receipt ? receipt.gasUsed.toString() : 'Pending',
                  gasPrice: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') : 'Pending'
                };
              } catch (err) {
                console.error(`Error processing tx ${tx.hash}:`, err);
                return null;
              }
            }));
            
            // Add valid transactions to our collection
            allTransactions = [...allTransactions, ...formattedTxs.filter(tx => tx !== null)];
          }
        }
        
        // If we've found enough transactions, we can stop scanning
        if (allTransactions.length >= 50) {
          console.log(`Found ${allTransactions.length} transactions, stopping scan`);
          break;
        }
      }
      
      // Sort transactions by timestamp (newest first)
      allTransactions.sort((a, b) => {
        // Handle 'Pending' case
        if (a.timestamp === 'Pending') return -1;
        if (b.timestamp === 'Pending') return 1;
        
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB - dateA;
      });
      
      console.log(`Found a total of ${allTransactions.length} transactions`);
      
      // If transactions found, update state
      if (allTransactions.length > 0) {
        setTransactions(allTransactions);
      } else {
        // If no transactions found with block scanning, try fetching pending transactions
        await fetchPendingTransactions(address, provider);
      }
    } catch (err) {
      console.error("Error fetching transaction history:", err);
      setError("Failed to fetch transaction history. Using alternative method.");
      
      // Try an alternative approach - mempool and pending txs
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          await fetchPendingTransactions(address, provider);
        }
      } catch (fallbackErr) {
        console.error("Fallback transaction fetch failed:", fallbackErr);
        setError("Could not retrieve transaction history. Please try again later.");
        setTransactions([]);
      }
    }
  };
  
  // Method to fetch pending transactions from mempool
  const fetchPendingTransactions = async (address, provider) => {
    try {
      console.log("Attempting to fetch pending transactions...");
      
      // Get the latest nonce for the account
      const nonce = await provider.getTransactionCount(address, "pending");
      const latestNonce = await provider.getTransactionCount(address, "latest");
      
      console.log(`Current nonce: ${latestNonce}, Pending nonce: ${nonce}`);
      
      // If there are pending transactions
      if (nonce > latestNonce) {
        const pendingTxs = [];
        
        // Create placeholders for pending transactions
        for (let i = latestNonce; i < nonce; i++) {
          pendingTxs.push({
            hash: `pending-${i}`,
            type: 'Sent',
            timestamp: 'Pending',
            amount: 'Pending',
            status: 'Pending',
            confirmations: 0,
            to: 'Pending',
            from: address,
            gasUsed: 'Pending',
            gasPrice: 'Pending'
          });
        }
        
        setTransactions(pendingTxs);
        console.log(`Added ${pendingTxs.length} pending transactions`);
      } else {
        // No pending transactions found
        console.log("No pending transactions found");
        if (transactions.length === 0) {
          setTransactions([]);
        }
      }
    } catch (err) {
      console.error("Error fetching pending transactions:", err);
      throw err;
    }
  };
  
  // Refresh transactions data
  const refreshTransactions = async (address, showRefreshing = true) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        // Check if on Sepolia before refreshing
        const network = await provider.getNetwork();
        if (network.chainId.toString() === SEPOLIA_CHAIN_ID_DECIMAL) {
          await fetchTransactionHistory(address);
        } else {
          if (showRefreshing) {
            setError("Please connect to Sepolia testnet to view transactions");
          }
        }
      }
    } catch (err) {
      console.error("Error refreshing transactions:", err);
      // Don't show error on silent refreshes
      if (showRefreshing) {
        setError("Failed to refresh transactions");
      }
    } finally {
      if (showRefreshing) setRefreshing(false);
    }
  };
  
  // Handle manual refresh
  const handleRefresh = () => {
    if (account) {
      refreshTransactions(account);
    }
  };

  // Format transaction hash for display with null/undefined handling
  const formatTxHash = (hash) => {
    if (!hash) return 'Unknown';
    if (hash.startsWith('pending-')) return `Pending #${hash.replace('pending-', '')}`;
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 4)}`;
  };
  
  // Format address for display with null/undefined handling
  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    if (address === 'Pending' || address === 'Contract Creation') return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading transaction history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}
      
      {/* Network Badge */}
      <div className="mb-3">
        <span className="badge bg-info me-2">Network:</span>
        {network?.toLowerCase() === 'sepolia' ? (
          <span className="badge bg-success">Sepolia Testnet</span>
        ) : (
          <span className="badge bg-warning">Please connect to Sepolia Testnet</span>
        )}
      </div>
      
      {/* Transaction History Card */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <i className="bi bi-clock-history me-2"></i> Transaction History
          </h4>
          <div>
            <button 
              className="btn btn-sm btn-outline-primary" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  Refreshing...
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>
        <div className="card-body">
          {transactions.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Hash</th>
                    <th>Type</th>
                    <th>From/To</th>
                    <th>Timestamp</th>
                    <th>Amount</th>
                    <th>Gas (used × price)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, index) => (
                    <tr key={tx.hash || index}>
                      <td>
                        {tx.hash && !tx.hash.startsWith('pending-') ? (
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${tx.hash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="tx-hash font-monospace text-truncate"
                            style={{ maxWidth: '150px', display: 'inline-block' }}
                          >
                            {formatTxHash(tx.hash)}
                          </a>
                        ) : (
                          <span className="font-monospace">{formatTxHash(tx.hash)}</span>
                        )}
                      </td>
                      <td>
                        {tx.type === 'Sent' ? (
                          <span className="badge bg-warning">Sent</span>
                        ) : (
                          <span className="badge bg-success">Received</span>
                        )}
                      </td>
                      <td>
                        {tx.type === 'Sent' ? (
                          <span>
                            To: {tx.to !== 'Pending' ? (
                              <a 
                                href={`https://sepolia.etherscan.io/address/${tx.to}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-monospace"
                              >
                                {formatAddress(tx.to)}
                              </a>
                            ) : (
                              <span className="font-monospace">Pending</span>
                            )}
                          </span>
                        ) : (
                          <span>
                            From: {tx.from !== 'Pending' ? (
                              <a 
                                href={`https://sepolia.etherscan.io/address/${tx.from}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-monospace"
                              >
                                {formatAddress(tx.from)}
                              </a>
                            ) : (
                              <span className="font-monospace">Pending</span>
                            )}
                          </span>
                        )}
                      </td>
                      <td>{tx.timestamp}</td>
                      <td>{tx.amount}</td>
                      <td>
                        {tx.gasUsed !== 'Pending' && tx.gasPrice !== 'Pending' 
                          ? `${tx.gasUsed} × ${tx.gasPrice} Gwei`
                          : 'Pending'
                        }
                      </td>
                      <td>
                        {tx.status === 'Confirmed' ? (
                          <span className="badge bg-success">
                            Confirmed {tx.confirmations > 0 ? `(${tx.confirmations})` : ''}
                          </span>
                        ) : tx.status === 'Failed' ? (
                          <span className="badge bg-danger">Failed</span>
                        ) : (
                          <span className="badge bg-warning">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted">No transactions found for this wallet on Sepolia</p>
              <button className="btn btn-outline-primary btn-sm" onClick={handleRefresh}>
                <i className="bi bi-arrow-repeat me-1"></i> Refresh
              </button>
            </div>
          )}
        </div>
        <div className="card-footer text-muted">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              <i className="bi bi-info-circle me-1"></i> 
              Transactions are automatically refreshed every 15 seconds
            </span>
            <span>
              Connected as: <a 
                href={`https://sepolia.etherscan.io/address/${account}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-monospace"
              >
                {formatAddress(account)}
              </a>
            </span>
          </div>
        </div>
      </div>
      
      {/* Account Balance Card */}
      <div className="card mt-4">
        <div className="card-header">
          <h4 className="mb-0">
            <i className="bi bi-wallet2 me-2"></i> Wallet Balance
          </h4>
        </div>
        <div className="card-body">
          <AccountBalance 
            account={account} 
            onError={setError} 
          />
        </div>
      </div>
    </div>
  );
}

// Separate component for account balance
function AccountBalance({ account, onError }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (!account || !window.ethereum) return;
        
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balanceWei = await provider.getBalance(account);
        const balanceEth = ethers.formatEther(balanceWei);
        
        // Format to 6 decimal places for better readability
        setBalance(parseFloat(balanceEth).toFixed(6));
      } catch (err) {
        console.error("Error fetching balance:", err);
        onError("Failed to fetch wallet balance");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBalance();
    
    // Set up polling for balance updates
    const balanceInterval = setInterval(fetchBalance, 30000); // Update every 30 seconds
    
    return () => clearInterval(balanceInterval);
  }, [account, onError]);
  
  if (loading) {
    return (
      <div className="text-center py-3">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2">Loading balance...</span>
      </div>
    );
  }
  
  return (
    <div className="d-flex align-items-center justify-content-center py-3">
      <div className="text-center">
        <h2 className="mb-0">{balance} ETH</h2>
        <p className="text-muted mb-0">Sepolia Testnet</p>
      </div>
    </div>
  );
}

export default Wallet;