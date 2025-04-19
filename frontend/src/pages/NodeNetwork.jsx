import React, { useState, useEffect } from 'react';

function NodeNetwork() {
  // State for storing node data
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [networkStats, setNetworkStats] = useState({
    activeNodes: 0,
    totalNodes: 0,
    averagePing: 0,
    networkLoad: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // New state for user status
  const [currentUser, setCurrentUser] = useState(null);

  // Simulate fetching nodes data and user data
  useEffect(() => {
    // This would be replaced with your actual API calls
    const fetchData = () => {
      setIsLoading(true);
      
      // Simulate network delay
      setTimeout(() => {
        // Simulated node data
        const mockNodes = [
          { 
            id: 'node-001', 
            name: 'Quantum Node Alpha', 
            status: 'active', 
            location: 'Frankfurt, DE',
            ipAddress: '192.168.1.101',
            uptime: '99.8%',
            ping: 23,
            lastSeen: new Date().toISOString(),
            connections: 15,
            type: 'validator',
            cpu: 35,
            memory: 42
          },
          { 
            id: 'node-002', 
            name: 'Quantum Node Beta', 
            status: 'active', 
            location: 'New York, US',
            ipAddress: '192.168.1.102',
            uptime: '98.5%',
            ping: 78,
            lastSeen: new Date().toISOString(),
            connections: 9,
            type: 'validator',
            cpu: 52,
            memory: 61
          },
          { 
            id: 'node-003', 
            name: 'Quantum Node Gamma', 
            status: 'inactive', 
            location: 'Tokyo, JP',
            ipAddress: '192.168.1.103',
            uptime: '92.1%',
            ping: 110,
            lastSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            connections: 0,
            type: 'relay',
            cpu: 0,
            memory: 12
          },
          { 
            id: 'node-004', 
            name: 'Quantum Node Delta', 
            status: 'active', 
            location: 'Singapore, SG',
            ipAddress: '192.168.1.104',
            uptime: '99.9%',
            ping: 45,
            lastSeen: new Date().toISOString(),
            connections: 22,
            type: 'validator',
            cpu: 28,
            memory: 39
          },
          { 
            id: 'node-005', 
            name: 'Quantum Node Epsilon', 
            status: 'maintenance', 
            location: 'London, UK',
            ipAddress: '192.168.1.105',
            uptime: '95.2%',
            ping: 37,
            lastSeen: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
            connections: 3,
            type: 'relay',
            cpu: 18,
            memory: 25
          }
        ];
        
        setNodes(mockNodes);
        
        // Calculate network stats
        const active = mockNodes.filter(node => node.status === 'active').length;
        const avgPing = mockNodes.reduce((sum, node) => sum + node.ping, 0) / mockNodes.length;
        
        setNetworkStats({
          activeNodes: active,
          totalNodes: mockNodes.length,
          averagePing: avgPing.toFixed(1),
          networkLoad: Math.floor(Math.random() * 40) + 30 // Random value between 30-70%
        });
        
        // Simulate fetching user's data (would come from MetaMask connection in real app)
        fetchUserData();
        
        setIsLoading(false);
      }, 1200); // Simulate network delay
    };
    
    const fetchUserData = () => {
      // This simulates getting MetaMask data after connection
      // In a real implementation, this would use Web3 or ethers.js to connect to MetaMask
      
      // Determine user's geolocation (in a real app, use navigator.geolocation or IP-based service)
      const getUserLocation = () => {
        // Simulated location detection
        const locations = ['New York, US', 'London, UK', 'Tokyo, JP', 'Berlin, DE', 'Sydney, AU'];
        return locations[Math.floor(Math.random() * locations.length)];
      };
      
      // Simulate ping calculation
      const calculatePing = () => {
        return Math.floor(Math.random() * 100) + 15; // 15-115ms
      };
      
      // Simulated user data
      const mockUserData = {
        address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        displayName: 'MetaMask User',  // This would come from ENS or user profile
        status: Math.random() > 0.1 ? 'active' : 'inactive', // Mostly active
        location: getUserLocation(),
        ping: calculatePing(),
        connectedSince: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        totalVisits: Math.floor(Math.random() * 50) + 1
      };
      
      setCurrentUser(mockUserData);
    };
    
    fetchData();
    
    // Set up interval to refresh data (every 30 seconds)
    const intervalId = setInterval(fetchData, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Event handlers
  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const handleCloseDetails = () => {
    setSelectedNode(null);
  };

  const handleDisconnectWallet = () => {
    // In a real implementation, this would disconnect from MetaMask
    alert("This would disconnect your wallet in a real implementation");
    // Update user status to inactive when disconnected
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        status: 'inactive',
        lastSeen: new Date().toISOString()
      });
    }
  };

  // Filter nodes based on status
  const filteredNodes = filterStatus === 'all' 
    ? nodes 
    : nodes.filter(node => node.status === filterStatus);

  // Function to determine status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#4ade80'; // green
      case 'inactive': return '#ef4444'; // red
      case 'maintenance': return '#facc15'; // yellow
      default: return '#9ca3af'; // gray
    }
  };

  // Format the date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  // Calculate time elapsed for "last seen"
  const timeElapsed = (dateString) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now - then;
    
    // Convert to appropriate time unit
    if (diffMs < 60000) { // Less than a minute
      return 'Just now';
    } else if (diffMs < 3600000) { // Less than an hour
      const mins = Math.floor(diffMs / 60000);
      return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffMs < 86400000) { // Less than a day
      const hours = Math.floor(diffMs / 3600000);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else { // Days or more
      const days = Math.floor(diffMs / 86400000);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  return (
    <div className="container-fluid py-4 px-3">
      {/* Page Header */}
      <div className="row mb-4 align-items-center">
        <div className="col">
          <h2 className="mb-1" style={{ 
            background: 'linear-gradient(90deg, #0cebf3, #c56cf0)', 
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'monospace',
            letterSpacing: '1px'
          }}>
            Node Network <span className="ms-2" style={{ fontSize: '22px' }}>🌐</span>
          </h2>
          <p className="text-muted">Monitor and manage distributed quantum nodes</p>
        </div>
        <div className="col-auto">
          <button className="btn" style={{ 
            background: 'linear-gradient(45deg, #0cebf3, #7367f0)',
            color: 'white',
            border: 'none'
          }}>
            <i className="fa fa-plus me-2"></i> Add New Node
          </button>
        </div>
      </div>

      {/* User Status Panel - New Addition */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ 
            background: 'rgba(26, 26, 46, 0.8)',
            boxShadow: '0 0 20px rgba(0, 195, 255, 0.15)'
          }}>
            <div className="card-body p-3">
              {isLoading || !currentUser ? (
                <div className="d-flex align-items-center">
                  <div className="spinner-border spinner-border-sm me-3" style={{ color: '#0cebf3' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span className="text-muted">Connecting to wallet...</span>
                </div>
              ) : (
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div style={{ 
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0cebf3, #7367f0)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '20px',
                        boxShadow: '0 0 10px rgba(12, 235, 243, 0.5)'
                      }}>
                        {currentUser.displayName.charAt(0)}
                      </div>
                      <div className="ms-3">
                        <div className="d-flex align-items-center">
                          <h5 className="mb-0" style={{ color: '#0cebf3' }}>{currentUser.displayName}</h5>
                          <div className="ms-2 d-flex align-items-center">
                            <div style={{ 
                              width: '10px', 
                              height: '10px', 
                              borderRadius: '50%', 
                              backgroundColor: getStatusColor(currentUser.status),
                              boxShadow: `0 0 5px ${getStatusColor(currentUser.status)}` 
                            }}></div>
                            <span className="ms-1 text-capitalize" style={{ 
                              color: getStatusColor(currentUser.status),
                              fontSize: '0.85rem'
                            }}>
                              {currentUser.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                          {currentUser.address.substring(0, 6)}...{currentUser.address.substring(38)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="row text-md-end mt-3 mt-md-0">
                      <div className="col-4">
                        <small className="text-muted d-block">Location</small>
                        <span>{currentUser.location}</span>
                      </div>
                      <div className="col-4">
                        <small className="text-muted d-block">Current Ping</small>
                        <span style={{ color: currentUser.ping > 100 ? '#ef4444' : currentUser.ping > 50 ? '#facc15' : '#4ade80' }}>
                          {currentUser.ping} ms
                        </span>
                      </div>
                      <div className="col-4">
                        {currentUser.status === 'active' ? (
                          <button 
                            className="btn btn-sm w-100" 
                            style={{ 
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.3)'
                            }}
                            onClick={handleDisconnectWallet}
                          >
                            Disconnect
                          </button>
                        ) : (
                          <div>
                            <small className="text-muted d-block">Last Seen</small>
                            <span>{timeElapsed(currentUser.lastSeen)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3 mb-md-0">
          <div className="card border-0 shadow-sm h-100" style={{ background: 'rgba(26, 26, 46, 0.8)' }}>
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(12, 235, 243, 0.2)',
                  color: '#0cebf3',
                  fontSize: '18px'
                }}>
                  🟢
                </div>
                <div className="ms-3">
                  <h6 className="card-title mb-0 text-muted">Active Nodes</h6>
                  <h3 className="mb-0" style={{ color: '#0cebf3' }}>
                    {isLoading ? '-' : `${networkStats.activeNodes}/${networkStats.totalNodes}`}
                  </h3>
                </div>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ 
                    width: isLoading ? '0%' : `${(networkStats.activeNodes/networkStats.totalNodes)*100}%`,
                    background: 'linear-gradient(90deg, #0cebf3, #7367f0)'
                  }} 
                  aria-valuenow={isLoading ? 0 : (networkStats.activeNodes/networkStats.totalNodes)*100} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3 mb-md-0">
          <div className="card border-0 shadow-sm h-100" style={{ background: 'rgba(26, 26, 46, 0.8)' }}>
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(197, 108, 240, 0.2)',
                  color: '#c56cf0',
                  fontSize: '18px'
                }}>
                  ⚡
                </div>
                <div className="ms-3">
                  <h6 className="card-title mb-0 text-muted">Network Load</h6>
                  <h3 className="mb-0" style={{ color: '#c56cf0' }}>
                    {isLoading ? '-' : `${networkStats.networkLoad}%`}
                  </h3>
                </div>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ 
                    width: isLoading ? '0%' : `${networkStats.networkLoad}%`,
                    background: 'linear-gradient(90deg, #c56cf0, #7367f0)'
                  }} 
                  aria-valuenow={isLoading ? 0 : networkStats.networkLoad} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3 mb-md-0">
          <div className="card border-0 shadow-sm h-100" style={{ background: 'rgba(26, 26, 46, 0.8)' }}>
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(115, 103, 240, 0.2)',
                  color: '#7367f0',
                  fontSize: '18px'
                }}>
                  ⏱️
                </div>
                <div className="ms-3">
                  <h6 className="card-title mb-0 text-muted">Avg. Ping</h6>
                  <h3 className="mb-0" style={{ color: '#7367f0' }}>
                    {isLoading ? '-' : `${networkStats.averagePing} ms`}
                  </h3>
                </div>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ 
                    width: isLoading ? '0%' : `${Math.min((networkStats.averagePing/200)*100, 100)}%`,
                    background: 'linear-gradient(90deg, #7367f0, #0cebf3)'
                  }} 
                  aria-valuenow={isLoading ? 0 : Math.min((networkStats.averagePing/200)*100, 100)} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ background: 'rgba(26, 26, 46, 0.8)' }}>
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 215, 0, 0.2)',
                  color: '#ffd700',
                  fontSize: '18px'
                }}>
                  🔄
                </div>
                <div className="ms-3">
                  <h6 className="card-title mb-0 text-muted">Last Sync</h6>
                  <h3 className="mb-0" style={{ color: '#ffd700', fontSize: '20px' }}>
                    {isLoading ? '-' : new Date().toLocaleTimeString()}
                  </h3>
                </div>
              </div>
              <button className="btn btn-sm w-100" style={{ 
                background: 'rgba(255, 215, 0, 0.1)',
                color: '#ffd700',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}>
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Network Map and Nodes List */}
      <div className="row">
        {/* Node List Section */}
        <div className={selectedNode ? "col-lg-8" : "col-lg-12"}>
          <div className="card border-0 shadow-sm" style={{ 
            background: 'rgba(26, 26, 46, 0.8)',
            boxShadow: '0 0 20px rgba(0, 195, 255, 0.15)'
          }}>
            <div className="card-header d-flex justify-content-between align-items-center" style={{ 
              background: 'rgba(22, 33, 62, 0.8)',
              borderBottom: '1px solid rgba(12, 235, 243, 0.2)'
            }}>
              <h5 className="card-title mb-0" style={{ color: '#0cebf3' }}>
                Network Nodes
              </h5>
              
              {/* Filter controls */}
              <div className="btn-group btn-group-sm">
                <button 
                  className={`btn ${filterStatus === 'all' ? 'active' : ''}`} 
                  style={{ 
                    background: filterStatus === 'all' ? 'rgba(12, 235, 243, 0.3)' : 'rgba(22, 33, 62, 0.8)',
                    color: filterStatus === 'all' ? '#fff' : '#adb5bd',
                    border: '1px solid rgba(12, 235, 243, 0.3)'
                  }}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </button>
                <button 
                  className={`btn ${filterStatus === 'active' ? 'active' : ''}`} 
                  style={{ 
                    background: filterStatus === 'active' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(22, 33, 62, 0.8)',
                    color: filterStatus === 'active' ? '#fff' : '#adb5bd',
                    border: '1px solid rgba(74, 222, 128, 0.3)'
                  }}
                  onClick={() => setFilterStatus('active')}
                >
                  Active
                </button>
                <button 
                  className={`btn ${filterStatus === 'inactive' ? 'active' : ''}`} 
                  style={{ 
                    background: filterStatus === 'inactive' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(22, 33, 62, 0.8)',
                    color: filterStatus === 'inactive' ? '#fff' : '#adb5bd',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                  onClick={() => setFilterStatus('inactive')}
                >
                  Inactive
                </button>
                <button 
                  className={`btn ${filterStatus === 'maintenance' ? 'active' : ''}`} 
                  style={{ 
                    background: filterStatus === 'maintenance' ? 'rgba(250, 204, 21, 0.3)' : 'rgba(22, 33, 62, 0.8)',
                    color: filterStatus === 'maintenance' ? '#fff' : '#adb5bd',
                    border: '1px solid rgba(250, 204, 21, 0.3)'
                  }}
                  onClick={() => setFilterStatus('maintenance')}
                >
                  Maintenance
                </button>
              </div>
            </div>
            
            <div className="card-body p-0">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" style={{ color: '#0cebf3' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Retrieving network nodes...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover" style={{ color: '#adb5bd' }}>
                    <thead style={{ color: '#fff' }}>
                      <tr>
                        <th className="ps-4">Status</th>
                        <th>Node ID</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Ping</th>
                        <th>Connections</th>
                        <th>Last Seen</th>
                        <th className="text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNodes.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="text-center py-4">
                            No nodes matching the current filter
                          </td>
                        </tr>
                      ) : filteredNodes.map(node => (
                        <tr 
                          key={node.id} 
                          onClick={() => handleNodeClick(node)}
                          style={{ 
                            cursor: 'pointer',
                            background: selectedNode && selectedNode.id === node.id ? 'rgba(12, 235, 243, 0.05)' : 'transparent'
                          }}
                        >
                          <td className="ps-4">
                            <div className="d-flex align-items-center">
                              <div style={{ 
                                width: '12px', 
                                height: '12px', 
                                borderRadius: '50%', 
                                backgroundColor: getStatusColor(node.status),
                                boxShadow: `0 0 5px ${getStatusColor(node.status)}` 
                              }}></div>
                              <span className="ms-2 text-capitalize">{node.status}</span>
                            </div>
                          </td>
                          <td><code>{node.id}</code></td>
                          <td>{node.name}</td>
                          <td><span className="badge" style={{ 
                            backgroundColor: node.type === 'validator' ? 'rgba(12, 235, 243, 0.2)' : 'rgba(197, 108, 240, 0.2)',
                            color: node.type === 'validator' ? '#0cebf3' : '#c56cf0',
                            border: `1px solid ${node.type === 'validator' ? 'rgba(12, 235, 243, 0.3)' : 'rgba(197, 108, 240, 0.3)'}`
                          }}>{node.type}</span></td>
                          <td>{node.location}</td>
                          <td>
                            {node.status === 'active' ? (
                              <span style={{ color: node.ping > 100 ? '#ef4444' : node.ping > 50 ? '#facc15' : '#4ade80' }}>
                                {node.ping} ms
                              </span>
                            ) : '—'}
                          </td>
                          <td>{node.connections}</td>
                          <td style={{ fontSize: '0.85rem' }}>
                            {timeElapsed(node.lastSeen)}
                          </td>
                          <td className="text-end pe-4">
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-secondary" title="Restart Node">
                                🔄
                              </button>
                              <button className="btn btn-outline-info" title="Node Settings">
                                ⚙️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Node Details Panel (Conditional) */}
        {selectedNode && (
          <div className="col-lg-4 mt-4 mt-lg-0">
            <div className="card border-0 shadow-sm" style={{ 
              background: 'rgba(26, 26, 46, 0.8)',
              boxShadow: '0 0 20px rgba(0, 195, 255, 0.15)'
            }}>
              <div className="card-header d-flex justify-content-between align-items-center" style={{ 
                background: 'rgba(22, 33, 62, 0.8)',
                borderBottom: '1px solid rgba(12, 235, 243, 0.2)'
              }}>
                <h5 className="card-title mb-0" style={{ color: '#0cebf3' }}>
                  Node Details
                </h5>
                <button 
                  className="btn-close btn-close-white"
                  onClick={handleCloseDetails}
                  style={{ fontSize: '0.75rem' }}
                ></button>
              </div>
              
              <div className="card-body">
                <div className="d-flex align-items-center mb-4">
                  <div style={{ 
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    background: 'linear-gradient(135deg, rgba(12, 235, 243, 0.2), rgba(197, 108, 240, 0.2))',
                    border: '1px solid rgba(12, 235, 243, 0.3)'
                  }}>
                    
                    {selectedNode.type === 'validator' ? '⚛️' : '🔄'}
                    </div>
                    <div className="ms-3">
                      <h4 className="mb-0">{selectedNode.name}</h4>
                      <div className="d-flex align-items-center">
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          backgroundColor: getStatusColor(selectedNode.status),
                          boxShadow: `0 0 5px ${getStatusColor(selectedNode.status)}` 
                        }}></div>
                        <span className="ms-1 text-capitalize" style={{ color: getStatusColor(selectedNode.status) }}>
                          {selectedNode.status}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="text-capitalize">{selectedNode.type}</span>
                      </div>
                    </div>
                  </div>
  
                  <div className="row mb-3">
                    <div className="col-6">
                      <div className="mb-3">
                        <small className="text-muted d-block">Node ID</small>
                        <code>{selectedNode.id}</code>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block">IP Address</small>
                        <span>{selectedNode.ipAddress}</span>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block">Location</small>
                        <span>{selectedNode.location}</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mb-3">
                        <small className="text-muted d-block">Uptime</small>
                        <span>{selectedNode.uptime}</span>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block">Connected Peers</small>
                        <span>{selectedNode.connections}</span>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block">Last Seen</small>
                        <span>{timeElapsed(selectedNode.lastSeen)}</span>
                      </div>
                    </div>
                  </div>
  
                  {/* Performance Metrics */}
                  <h6 className="mb-3" style={{ color: '#0cebf3' }}>Performance Metrics</h6>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small>CPU Usage</small>
                      <small>{selectedNode.cpu}%</small>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ 
                          width: `${selectedNode.cpu}%`,
                          background: 'linear-gradient(90deg, #0cebf3, #7367f0)'
                        }} 
                        aria-valuenow={selectedNode.cpu} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      />
                    </div>
                  </div>
  
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-1">
                      <small>Memory Usage</small>
                      <small>{selectedNode.memory}%</small>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ 
                          width: `${selectedNode.memory}%`,
                          background: 'linear-gradient(90deg, #c56cf0, #7367f0)'
                        }} 
                        aria-valuenow={selectedNode.memory} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      />
                    </div>
                  </div>
  
                  {/* Action Buttons */}
                  <div className="d-flex gap-2 mt-4">
                    <button className="btn btn-sm flex-grow-1" style={{ 
                      background: 'rgba(12, 235, 243, 0.1)', 
                      color: '#0cebf3',
                      border: '1px solid rgba(12, 235, 243, 0.3)'
                    }}>
                      Restart Node
                    </button>
                    <button className="btn btn-sm flex-grow-1" style={{ 
                      background: 'rgba(197, 108, 240, 0.1)', 
                      color: '#c56cf0',
                      border: '1px solid rgba(197, 108, 240, 0.3)'
                    }}>
                      Node Logs
                    </button>
                    <button className="btn btn-sm flex-grow-1" style={{ 
                      background: 'rgba(115, 103, 240, 0.1)', 
                      color: '#7367f0',
                      border: '1px solid rgba(115, 103, 240, 0.3)'
                    }}>
                      Configure
                    </button>
                  </div>
                </div>
              </div>
  
              {/* Network Visualization Card */}
              <div className="card border-0 shadow-sm mt-4" style={{ 
                background: 'rgba(26, 26, 46, 0.8)',
                boxShadow: '0 0 20px rgba(0, 195, 255, 0.15)'
              }}>
                <div className="card-header" style={{ 
                  background: 'rgba(22, 33, 62, 0.8)',
                  borderBottom: '1px solid rgba(12, 235, 243, 0.2)'
                }}>
                  <h5 className="card-title mb-0" style={{ color: '#0cebf3' }}>
                    Node Connections
                  </h5>
                </div>
                
                <div className="card-body text-center py-5">
                  {/* Placeholder for network visualization */}
                  <p className="text-muted mb-3">Network visualization would appear here</p>
                  <div style={{ 
                    width: '100%', 
                    height: '150px', 
                    background: 'linear-gradient(135deg, rgba(12, 235, 243, 0.05), rgba(197, 108, 240, 0.05))',
                    borderRadius: '8px',
                    border: '1px dashed rgba(12, 235, 243, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    🌐
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
  
        {/* User Activity History - New Addition */}
        {currentUser && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm" style={{ 
                background: 'rgba(26, 26, 46, 0.8)',
                boxShadow: '0 0 20px rgba(0, 195, 255, 0.15)'
              }}>
                <div className="card-header d-flex justify-content-between align-items-center" style={{ 
                  background: 'rgba(22, 33, 62, 0.8)',
                  borderBottom: '1px solid rgba(12, 235, 243, 0.2)'
                }}>
                  <h5 className="card-title mb-0" style={{ color: '#0cebf3' }}>
                    Your Network Statistics
                  </h5>
                  <button className="btn btn-sm" style={{ 
                    background: 'rgba(12, 235, 243, 0.1)',
                    color: '#0cebf3',
                    border: '1px solid rgba(12, 235, 243, 0.3)'
                  }}>
                    View Full History
                  </button>
                </div>
                
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 mb-3 mb-md-0">
                      <div className="p-3" style={{ 
                        background: 'rgba(12, 235, 243, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(12, 235, 243, 0.1)'
                      }}>
                        <div className="d-flex justify-content-between">
                          <h6 style={{ color: '#0cebf3' }}>Total Sessions</h6>
                          <span className="badge" style={{ 
                            backgroundColor: 'rgba(12, 235, 243, 0.2)',
                            color: '#0cebf3'
                          }}>{currentUser.totalVisits}</span>
                        </div>
                        <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                          Last connection: {timeElapsed(currentUser.connectedSince)}
                        </p>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3 mb-md-0">
                      <div className="p-3" style={{ 
                        background: 'rgba(197, 108, 240, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(197, 108, 240, 0.1)'
                      }}>
                        <div className="d-flex justify-content-between">
                          <h6 style={{ color: '#c56cf0' }}>Connection Quality</h6>
                          <span className="badge" style={{ 
                            backgroundColor: 'rgba(197, 108, 240, 0.2)',
                            color: '#c56cf0'
                          }}>
                            {currentUser.ping < 50 ? 'Excellent' : currentUser.ping < 100 ? 'Good' : 'Fair'}
                          </span>
                        </div>
                        <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                          Current ping: {currentUser.ping} ms
                        </p>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3 mb-md-0">
                      <div className="p-3" style={{ 
                        background: 'rgba(115, 103, 240, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(115, 103, 240, 0.1)'
                      }}>
                        <div className="d-flex justify-content-between">
                          <h6 style={{ color: '#7367f0' }}>Access Location</h6>
                          <span className="badge" style={{ 
                            backgroundColor: 'rgba(115, 103, 240, 0.2)',
                            color: '#7367f0'
                          }}>Detected</span>
                        </div>
                        <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                          {currentUser.location}
                        </p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3" style={{ 
                        background: 'rgba(255, 215, 0, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 215, 0, 0.1)'
                      }}>
                        <div className="d-flex justify-content-between">
                          <h6 style={{ color: '#ffd700' }}>Wallet Status</h6>
                          <span className="badge" style={{ 
                            backgroundColor: currentUser.status === 'active' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: currentUser.status === 'active' ? '#4ade80' : '#ef4444'
                          }}>
                            {currentUser.status === 'active' ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                        <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                          {currentUser.status === 'active' 
                            ? `Connected since ${new Date(currentUser.connectedSince).toLocaleTimeString()}`
                            : `Last seen ${timeElapsed(currentUser.lastSeen)}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  export default NodeNetwork;