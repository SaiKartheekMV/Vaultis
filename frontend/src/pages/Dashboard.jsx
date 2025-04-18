import React, { useEffect, useState, useRef } from 'react';
import { getContract } from '../services/contract';

function Dashboard() {
  const [userAddress, setUserAddress] = useState('');
  const [stats, setStats] = useState({
    totalFiles: 0,
    sharedFiles: 0,
    lastActivity: null
  });
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypes, setFileTypes] = useState({});
  const [storageStats, setStorageStats] = useState({ used: 0, byType: {} });
  const [pinnedFiles, setPinnedFiles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [integrityResults, setIntegrityResults] = useState({});
  const [showPreviewer, setShowPreviewer] = useState(false);
  const canvasRef = useRef(null);
  
  // For demo purposes - file size distribution data
  const [fileSizeData] = useState([
    { size: '0-1MB', count: 15 },
    { size: '1-5MB', count: 8 },
    { size: '5-10MB', count: 5 },
    { size: '10-50MB', count: 3 },
    { size: '50MB+', count: 1 }
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserAddress(storedUser);
      fetchUserStats(storedUser);
      fetchAllFiles(storedUser);
      fetchPinnedFiles(storedUser);
      loadMockNotifications();
    }
    
    // For demo purposes - draw storage chart
    if (canvasRef.current) {
      drawStorageChart();
    }
  }, []);
  
  // Draw simple chart for storage usage
  const drawStorageChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const fileTypes = ['Documents', 'Images', 'Videos', 'Other'];
    const data = [40, 25, 20, 15]; // Percentages
    const colors = ['#4361ee', '#3a0ca3', '#7209b7', '#f72585'];
    
    let startAngle = 0;
    const total = data.reduce((acc, val) => acc + val, 0);
    
    for (let i = 0; i < data.length; i++) {
      const sliceAngle = (2 * Math.PI * data[i]) / total;
      
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.moveTo(75, 75);
      ctx.arc(75, 75, 75, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();
      
      startAngle += sliceAngle;
    }
  };

  const fetchUserStats = async (address) => {
    try {
      setLoading(true);
      const contract = await getContract();
      
      // Get all accessible files to calculate stats
      const result = await contract.getAccessibleFiles();
      const [fileIds, cids, owners, uploaders, timestamps, fileSizes = []] = result;
      
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
      
      // Calculate total storage used (mock data if fileSizes not available)
      const totalSize = fileSizes.length > 0 
        ? fileSizes.reduce((acc, size) => acc + Number(size), 0)
        : userFiles.length * 2.5 * 1024 * 1024; // Assume average 2.5MB per file
        
      // Mock data for file types
      const typeData = {
        'pdf': Math.floor(userFiles.length * 0.4),
        'jpg': Math.floor(userFiles.length * 0.3),
        'doc': Math.floor(userFiles.length * 0.2),
        'other': userFiles.length - Math.floor(userFiles.length * 0.9)
      };
      
      setFileTypes(typeData);
      setStorageStats({
        used: totalSize,
        byType: {
          documents: totalSize * 0.4,
          images: totalSize * 0.3,
          videos: totalSize * 0.2,
          other: totalSize * 0.1
        }
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
  
  const fetchAllFiles = async (address) => {
    try {
      const contract = await getContract();
      const result = await contract.getAccessibleFiles();
      const [fileIds, cids, owners, uploaders, timestamps] = result;
      
      // Create file objects with necessary info
      const filesList = fileIds.map((id, index) => {
        // Mock data for demo purposes
        const fileName = `File-${id.toString().padStart(3, '0')}.${['pdf', 'jpg', 'doc', 'txt'][Math.floor(Math.random() * 4)]}`;
        const fileSize = Math.floor(Math.random() * 10 * 1024 * 1024); // Random size up to 10MB
        
        return {
          id: id.toString(),
          name: fileName,
          cid: cids[index],
          owner: owners[index],
          uploader: uploaders[index],
          timestamp: Number(timestamps[index]),
          isOwner: owners[index].toLowerCase() === address.toLowerCase(),
          isUploader: uploaders[index].toLowerCase() === address.toLowerCase(),
          size: fileSize,
          type: fileName.split('.').pop(),
          preview: fileName.endsWith('.jpg') || fileName.endsWith('.pdf'),
          lastAccessed: new Date(Number(timestamps[index]) * 1000 + Math.random() * 86400000)
        };
      });
      
      // Generate integrity check results (for demo)
      const integrity = {};
      fileIds.forEach(id => {
        integrity[id.toString()] = Math.random() > 0.1; // 90% of files pass integrity check
      });
      
      setIntegrityResults(integrity);
      setFiles(filesList);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };
  
  const fetchPinnedFiles = async (address) => {
    // In a real implementation, this would fetch from blockchain or local storage
    // For demo, we'll use random selection from files
    setTimeout(() => {
      const mockPinned = files
        .filter(() => Math.random() > 0.7) // Randomly select ~30% of files
        .slice(0, 3); // Limit to 3 files
      setPinnedFiles(mockPinned);
    }, 1000);
  };
  
  const loadMockNotifications = () => {
    // Mock notifications for demo
    const mockNotifications = [
      { id: 1, type: 'share', message: 'User 0x5ab...e3f shared a file with you', timestamp: Date.now() - 3600000, read: false },
      { id: 2, type: 'integrity', message: 'Integrity check completed for 5 files', timestamp: Date.now() - 86400000, read: true },
      { id: 3, type: 'system', message: 'Quantum encryption keys rotated successfully', timestamp: Date.now() - 172800000, read: true }
    ];
    setNotifications(mockNotifications);
  };

  const formatDate = (date) => {
    if (!date) return 'No activity yet';
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const verifyFileIntegrity = (fileId) => {
    // In a real implementation, this would perform cryptographic verification
    // For demo, we toggle the status
    setIntegrityResults(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }));
  };
  
  const togglePinFile = (file) => {
    if (pinnedFiles.some(f => f.id === file.id)) {
      // Remove from pinned
      setPinnedFiles(pinnedFiles.filter(f => f.id !== file.id));
    } else {
      // Add to pinned
      setPinnedFiles([...pinnedFiles, file]);
    }
  };
  
  const markNotificationRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  const previewFile = (file) => {
    setSelectedFile(file);
    setShowPreviewer(true);
  };
  
  const closePreview = () => {
    setShowPreviewer(false);
    setSelectedFile(null);
  };
  
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.id.toString().includes(searchTerm)
  );

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <h2 className="text-info">🔐 Welcome to Vaultis</h2>
        <p className="lead">Decentralized Quantum-Secure Storage using IPFS + Blockchain + PQC</p>
      </div>

      {/* Stats Cards */}
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
      
      {/* Search and File Management */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="card-title">🔍 File Search & Management</h4>
          <div className="input-group mb-3">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search files by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="button">Search</button>
          </div>
          
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Integrity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.slice(0, 5).map(file => (
                  <tr key={file.id}>
                    <td>{file.name}</td>
                    <td>{formatFileSize(file.size)}</td>
                    <td>{new Date(file.timestamp * 1000).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${integrityResults[file.id] ? 'bg-success' : 'bg-danger'}`}>
                        {integrityResults[file.id] ? 'Verified' : 'Failed'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        {file.preview && (
                          <button 
                            className="btn btn-outline-primary" 
                            onClick={() => previewFile(file)}
                          >
                            Preview
                          </button>
                        )}
                        <button 
                          className="btn btn-outline-info"
                          onClick={() => verifyFileIntegrity(file.id)}
                        >
                          Verify
                        </button>
                        <button 
                          className={`btn ${pinnedFiles.some(f => f.id === file.id) ? 'btn-warning' : 'btn-outline-warning'}`}
                          onClick={() => togglePinFile(file)}
                        >
                          {pinnedFiles.some(f => f.id === file.id) ? 'Unpin' : 'Pin'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredFiles.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-3">No files found matching your search</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredFiles.length > 5 && (
            <div className="text-center mt-2">
              <button className="btn btn-outline-secondary btn-sm">Show More Files</button>
            </div>
          )}
        </div>
      </div>
      
      {/* File Analytics and Storage Usage */}
      <div className="row mb-4">
        {/* File Type Distribution */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h4 className="card-title">📊 File Analytics</h4>
              <h6 className="card-subtitle mb-3 text-muted">Distribution by Size</h6>
              
              <div className="file-size-chart">
                {fileSizeData.map((item, index) => (
                  <div key={index} className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <span>{item.size}</span>
                      <span>{item.count} files</span>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ width: `${(item.count / fileSizeData.reduce((acc, val) => acc + val.count, 0)) * 100}%` }}
                        aria-valuenow={item.count} 
                        aria-valuemin="0" 
                        aria-valuemax={fileSizeData.reduce((acc, val) => acc + val.count, 0)}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <h6 className="card-subtitle mt-4 mb-3 text-muted">File Type Distribution</h6>
              <div className="file-type-stats d-flex justify-content-around">
                {Object.entries(fileTypes).map(([type, count]) => (
                  <div key={type} className="text-center">
                    <div className="display-6">{count}</div>
                    <div className="text-muted">.{type}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Storage Usage */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h4 className="card-title">💾 Storage Usage</h4>
              <div className="text-center mb-3">
                <div className="display-5">{formatFileSize(storageStats.used)}</div>
                <div className="text-muted">Total Storage Used</div>
              </div>
              
              <div className="storage-chart-container text-center mb-4">
                <canvas ref={canvasRef} width="150" height="150"></canvas>
              </div>
              
              <div className="storage-type-breakdown">
                <div className="d-flex justify-content-between mb-1">
                  <span>Documents</span>
                  <span>{formatFileSize(storageStats.byType.documents)}</span>
                </div>
                <div className="progress mb-2">
                  <div 
                    className="progress-bar bg-primary" 
                    role="progressbar" 
                    style={{ width: '40%' }}
                    aria-valuenow="40"
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
                
                <div className="d-flex justify-content-between mb-1">
                  <span>Images</span>
                  <span>{formatFileSize(storageStats.byType.images)}</span>
                </div>
                <div className="progress mb-2">
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: '30%' }}
                    aria-valuenow="30"
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
                
                <div className="d-flex justify-content-between mb-1">
                  <span>Videos</span>
                  <span>{formatFileSize(storageStats.byType.videos)}</span>
                </div>
                <div className="progress mb-2">
                  <div 
                    className="progress-bar bg-warning" 
                    role="progressbar" 
                    style={{ width: '20%' }}
                    aria-valuenow="20"
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
                
                <div className="d-flex justify-content-between mb-1">
                  <span>Other</span>
                  <span>{formatFileSize(storageStats.byType.other)}</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-info" 
                    role="progressbar" 
                    style={{ width: '10%' }}
                    aria-valuenow="10"
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pinned Files and Notifications Row */}
      <div className="row mb-4">
        {/* Pinned Files */}
        <div className="col-md-7">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h4 className="card-title">📌 Favorites/Pinned Files</h4>
              
              {pinnedFiles.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p>No pinned files yet. Pin important files for quick access.</p>
                </div>
              ) : (
                <div className="row">
                  {pinnedFiles.map(file => (
                    <div key={file.id} className="col-md-4 mb-3">
                      <div className="card h-100">
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="card-title mb-0 text-truncate">{file.name}</h6>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => togglePinFile(file)}
                            >
                              Unpin
                            </button>
                          </div>
                          <p className="card-text text-muted small mb-0">
                            Size: {formatFileSize(file.size)}
                          </p>
                          <p className="card-text text-muted small">
                            Uploaded: {new Date(file.timestamp * 1000).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="card-footer p-2 d-flex justify-content-between">
                          {file.preview && (
                            <button 
                              className="btn btn-sm btn-outline-primary" 
                              onClick={() => previewFile(file)}
                            >
                              Preview
                            </button>
                          )}
                          <button className="btn btn-sm btn-outline-secondary">
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Notifications */}
        <div className="col-md-5">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h4 className="card-title">🔔 Notifications</h4>
              
              <ul className="list-group">
                {notifications.length === 0 ? (
                  <li className="list-group-item text-center py-3">
                    No new notifications
                  </li>
                ) : (
                  notifications.map(notification => (
                    <li 
                      key={notification.id} 
                      className={`list-group-item d-flex justify-content-between align-items-start ${!notification.read ? 'bg-light' : ''}`}
                    >
                      <div className="ms-2 me-auto">
                        <div className="d-flex align-items-center">
                          {!notification.read && (
                            <span className="badge bg-primary rounded-pill me-2"></span>
                          )}
                          <div>
                            <div className="fw-bold">
                              {notification.type === 'share' && '🔄 Share'}
                              {notification.type === 'integrity' && '🛡️ Integrity'}
                              {notification.type === 'system' && '⚙️ System'}
                            </div>
                            {notification.message}
                          </div>
                        </div>
                        <small className="text-muted">
                          {new Date(notification.timestamp).toLocaleString()}
                        </small>
                      </div>
                      
                      {!notification.read && (
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => markNotificationRead(notification.id)}
                        >
                          Mark Read
                        </button>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* File Integrity Status */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="card-title">🛡️ File Integrity Verification</h4>
          <p className="card-text text-muted">
            Verify cryptographic integrity of your files with quantum-resistant signatures
          </p>
          
          <div className="row">
            <div className="col-md-8">
              <div className="progress mb-3" style={{ height: '25px' }}>
                <div 
                  className="progress-bar bg-success" 
                  role="progressbar" 
                  style={{ width: `${Object.values(integrityResults).filter(Boolean).length / Object.values(integrityResults).length * 100}%` }}
                  aria-valuenow={Object.values(integrityResults).filter(Boolean).length} 
                  aria-valuemin="0" 
                  aria-valuemax={Object.values(integrityResults).length}
                >
                  {Object.values(integrityResults).filter(Boolean).length} / {Object.values(integrityResults).length} Files Verified
                </div>
              </div>
              
              <div className="d-flex   gap-4 mb-3">
                <div>
                  <div className="h4 mb-0 text-success">{Object.values(integrityResults).filter(Boolean).length}</div>
                  <div className="text-muted">Verified</div>
                </div>
                <div>
                  <div className="h4 mb-0 text-danger">{Object.values(integrityResults).filter(res => !res).length}</div>
                  <div className="text-muted">Failed</div>
                </div>
                <div>
                  <div className="h4 mb-0 text-primary">{Object.values(integrityResults).length}</div>
                  <div className="text-muted">Total Files</div>
                </div>
              </div>
              
              <button className="btn btn-primary">
                Verify All Files
              </button>
            </div>
            
            <div className="col-md-4">
              <div className="card bg-light">
                <div className="card-body">
                  <h6 className="card-title">How It Works</h6>
                  <p className="card-text small">
                    Vaultis uses post-quantum cryptographic (PQC) signatures to ensure file integrity. 
                    Each file is signed when uploaded, and can be verified later to detect tampering.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* File Preview Modal */}
      {showPreviewer && selectedFile && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedFile.name}</h5>
                <button type="button" className="btn-close" onClick={closePreview}></button>
              </div>
              <div className="modal-body">
                {selectedFile.type === 'jpg' ? (
                  <div className="text-center">
                    <div className="bg-light p-5 text-muted">
                      [Image Preview Placeholder]
                    </div>
                  </div>
                ) : selectedFile.type === 'pdf' ? (
                  <div className="text-center">
                    <div className="bg-light p-5 text-muted">
                      [PDF Preview Placeholder]
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-info">
                    Preview not available for this file type.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <div className="text-start me-auto">
                  <div><strong>File ID:</strong> {selectedFile.id}</div>
                  <div><strong>Size:</strong> {formatFileSize(selectedFile.size)}</div>
                  <div className="small text-muted">Last accessed: {selectedFile.lastAccessed.toLocaleString()}</div>
                </div>
                <button type="button" className="btn btn-secondary" onClick={closePreview}>Close</button>
                <button type="button" className="btn btn-primary">Download</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default Dashboard;