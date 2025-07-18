import React, { useEffect, useState, useRef } from 'react';
import { getContract } from '../services/contract';
import './Dashboard.css'; // Assuming you have a CSS file for styles

function Dashboard() {
  // Removed unused userAddress state
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
      // setUserAddress(storedUser); // Removed as it is not defined or used
      fetchUserStats(storedUser);
      fetchAllFiles(storedUser);
      fetchPinnedFiles(storedUser);
      loadMockNotifications();
    }
    
    // For demo purposes - draw storage chart
    if (canvasRef.current) {
      drawStorageChart();
    }

    // Add dark theme to body
    document.body.classList.add('bg-dark');
    document.body.style.color = '#e0e0ff';

    return () => {
      document.body.classList.remove('bg-dark');
    };
  }, []);
  
  // Draw simple chart for storage usage
  const drawStorageChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const _FILE_TYPES = ['Documents', 'Images', 'Videos', 'Other'];
    const data = [40, 25, 20, 15]; // Percentages
    const colors = ['#ff2a6d', '#05d9e8', '#01012b', '#d300c5'];
    
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
      const [fileIds, _cids, owners, uploaders, timestamps, fileSizes = []] = result;
      
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
    <div className="container py-4" style={{ background: '#010b19' }}>
      <div className="text-center mb-4">
        <h2 className="text-danger" style={{ 
          fontFamily: 'Georgia, serif', 
          textShadow: '0 0 10px #ff2a6d, 0 0 20px #ff2a6d', 
          letterSpacing: '2px'
        }}>
          🔐 VAULTIS <span className="fs-5" style={{ fontFamily: 'serif', fontStyle: 'italic' }}>Codex Securitas</span>
        </h2>
        <p className="lead" style={{ color: '#05d9e8', fontFamily: 'serif' }}>
          Decentralized Quantum-Secure Storage using IPFS + Blockchain + PQC
          <span className="d-block mt-1" style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#9fa8da' }}>
            "In the manner of Da Vinci, securing the future with the wisdom of the past"
          </span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow h-100 text-center" style={{ 
            background: 'linear-gradient(135deg, #01012b 0%, #001f3f 100%)',
            border: '1px solid #05d9e8',
            boxShadow: '0 0 10px rgba(5, 217, 232, 0.5)',
            borderRadius: '10px'
          }}>
            <div className="card-body">
              <h3 className="text-danger" style={{ textShadow: '0 0 5px #ff2a6d' }}>
                {loading ? "..." : stats.totalFiles}
              </h3>
              <p className="mb-0" style={{ color: '#05d9e8' }}>Total Files</p>
              <div className="mt-2">
                <svg height="20" width="100">
                  <line x1="0" y1="10" x2="100" y2="10" style={{ stroke: '#05d9e8', strokeWidth: 1, strokeDasharray: '5,5', opacity: 0.5 }} />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow h-100 text-center" style={{ 
            background: 'linear-gradient(135deg, #01012b 0%, #001f3f 100%)',
            border: '1px solid #05d9e8',
            boxShadow: '0 0 10px rgba(5, 217, 232, 0.5)',
            borderRadius: '10px'
          }}>
            <div className="card-body">
              <h3 className="text-danger" style={{ textShadow: '0 0 5px #ff2a6d' }}>
                {loading ? "..." : stats.sharedFiles}
              </h3>
              <p className="mb-0" style={{ color: '#05d9e8' }}>Shared Files</p>
              <div className="mt-2">
                <svg height="20" width="100">
                  <line x1="0" y1="10" x2="100" y2="10" style={{ stroke: '#05d9e8', strokeWidth: 1, strokeDasharray: '5,5', opacity: 0.5 }} />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow h-100 text-center" style={{ 
            background: 'linear-gradient(135deg, #01012b 0%, #001f3f 100%)',
            border: '1px solid #05d9e8',
            boxShadow: '0 0 10px rgba(5, 217, 232, 0.5)',
            borderRadius: '10px'
          }}>
            <div className="card-body">
              <h3 className="text-danger" style={{ textShadow: '0 0 5px #ff2a6d' }}>
                {loading ? "..." : formatDate(stats.lastActivity).split(' ')[0]}
              </h3>
              <p className="mb-0" style={{ color: '#05d9e8' }}>Last Activity</p>
              <div className="mt-2">
                <svg height="20" width="100">
                  <line x1="0" y1="10" x2="100" y2="10" style={{ stroke: '#05d9e8', strokeWidth: 1, strokeDasharray: '5,5', opacity: 0.5 }} />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and File Management */}
      <div className="card shadow mb-4" style={{ 
        background: 'linear-gradient(135deg, #01012b 0%, #001f3f 100%)',
        border: '1px solid #05d9e8',
        boxShadow: '0 0 15px rgba(5, 217, 232, 0.3)',
        borderRadius: '10px'
      }}>
        <div className="card-body">
          <h4 className="card-title" style={{ 
            color: '#ff2a6d', 
            fontFamily: 'Georgia, serif',
            borderBottom: '1px solid rgba(5, 217, 232, 0.3)',
            paddingBottom: '10px'
          }}>
            🔍 File Search & Management <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#9fa8da' }}>Archivum Digitalis</span>
          </h4>
          <div className="input-group mb-3" style={{ borderRadius: '5px', overflow: 'hidden' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search files by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                background: '#02071a', 
                color: '#e0e0ff', 
                border: '1px solid #05d9e8'
              }}
            />
            <button 
              className="btn" 
              type="button"
              style={{ 
                background: '#ff2a6d', 
                color: '#e0e0ff',
                borderColor: '#ff2a6d'
              }}
            >
              Search
            </button>
          </div>
          
          <div className="table-responsive">
            <table className="table" style={{ color: '#e0e0ff' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #05d9e8' }}>
                  <th style={{ color: '#05d9e8' }}>Name</th>
                  <th style={{ color: '#05d9e8' }}>Size</th>
                  <th style={{ color: '#05d9e8' }}>Uploaded</th>
                  <th style={{ color: '#05d9e8' }}>Integrity</th>
                  <th style={{ color: '#05d9e8' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.slice(0, 5).map(file => (
                  <tr key={file.id} style={{ borderBottom: '1px solid rgba(5, 217, 232, 0.2)' }}>
                    <td>{file.name}</td>
                    <td>{formatFileSize(file.size)}</td>
                    <td>{new Date(file.timestamp * 1000).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${integrityResults[file.id] ? 'bg-success' : 'bg-danger'}`}
                        style={{ 
                          background: integrityResults[file.id] ? '#05d9e8' : '#ff2a6d',
                          textShadow: integrityResults[file.id] ? '0 0 5px #05d9e8' : '0 0 5px #ff2a6d',
                          padding: '5px 10px',
                          borderRadius: '12px'
                        }}
                      >
                        {integrityResults[file.id] ? 'Verified' : 'Failed'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        {file.preview && (
                          <button 
                            className="btn"
                            style={{ 
                              background: '#01012b', 
                              color: '#05d9e8',
                              border: '1px solid #05d9e8',
                              marginRight: '2px'
                            }}
                            onClick={() => previewFile(file)}
                          >
                            Preview
                          </button>
                        )}
                        <button 
                          className="btn"
                          style={{ 
                            background: '#01012b', 
                            color: '#05d9e8',
                            border: '1px solid #05d9e8',
                            marginRight: '2px'
                          }}
                          onClick={() => verifyFileIntegrity(file.id)}
                        >
                          Verify
                        </button>
                        <button 
                          className="btn"
                          style={{ 
                            background: pinnedFiles.some(f => f.id === file.id) ? '#ff2a6d' : '#01012b',
                            color: pinnedFiles.some(f => f.id === file.id) ? '#fff' : '#ff2a6d',
                            border: '1px solid #ff2a6d',
                          }}
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
              <button 
                className="btn btn-sm"
                style={{ 
                  background: 'transparent', 
                  color: '#05d9e8',
                  border: '1px solid #05d9e8',
                  borderRadius: '15px',
                  padding: '5px 15px'
                }}
              >
                Show More Files
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* File Analytics and Storage Usage */}
      <div className="row mb-4">
        {/* File Type Distribution */}
        <div className="col-md-6">
          <div className="card shadow h-100" style={{ 
            background: 'linear-gradient(135deg, #01012b 0%, #001f3f 100%)',
            border: '1px solid #05d9e8',
            boxShadow: '0 0 15px rgba(5, 217, 232, 0.3)',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div className="card-body">
              <h4 className="card-title" style={{ 
                color: '#ff2a6d', 
                fontFamily: 'Georgia, serif',
                borderBottom: '1px solid rgba(5, 217, 232, 0.3)',
                paddingBottom: '10px'
              }}>
                📊 File Analytics <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#9fa8da' }}>Proportio Aurea</span>
              </h4>
              <h6 className="card-subtitle mb-3" style={{ color: '#9fa8da', fontStyle: 'italic' }}>Distribution by Size</h6>
              
              <div className="file-size-chart">
                {fileSizeData.map((item, index) => (
                  <div key={index} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span style={{ color: '#e0e0ff' }}>{item.size}</span>
                      <span style={{ color: '#05d9e8' }}>{item.count} files</span>
                    </div>
                    <div className="progress" style={{ height: '8px', backgroundColor: 'rgba(1, 1, 43, 0.5)' }}>
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ 
                          width: `${(item.count / fileSizeData.reduce((acc, val) => acc + val.count, 0)) * 100}%`,
                          background: 'linear-gradient(90deg, #ff2a6d, #05d9e8)',
                          boxShadow: '0 0 10px rgba(255, 42, 109, 0.5)'
                        }}
                        aria-valuenow={item.count} 
                        aria-valuemin="0" 
                        aria-valuemax={fileSizeData.reduce((acc, val) => acc + val.count, 0)}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <h6 className="card-subtitle mt-4 mb-3" style={{ color: '#9fa8da', fontStyle: 'italic' }}>File Type Distribution</h6>
              <div className="file-type-stats d-flex justify-content-around">
                {Object.entries(fileTypes).map(([type, count], index) => (
                  <div key={type} className="text-center" style={{ 
                    padding: '10px', 
                    borderRadius: '10px', 
                    background: 'rgba(1, 1, 43, 0.7)',
                    border: '1px solid rgba(5, 217, 232, 0.3)'
                  }}>
                    <div className="display-6" style={{ 
                      color: ['#ff2a6d', '#05d9e8', '#D300C5', '#7B68EE'][index % 4],
                      textShadow: `0 0 5px ${['#ff2a6d', '#05d9e8', '#D300C5', '#7B68EE'][index % 4]}`
                    }}>
                      {count}
                    </div>
                    <div style={{ color: '#9fa8da' }}>.{type}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Storage Usage */}
        <div className="col-md-6">
          <div className="card shadow h-100" style={{ 
            background: 'linear-gradient(135deg, #01012b 0%, #001f3f 100%)',
            border: '1px solid #05d9e8',
            boxShadow: '0 0 15px rgba(5, 217, 232, 0.3)',
            borderRadius: '10px'
          }}>
            <div className="card-body">
              <h4 className="card-title" style={{ 
                color: '#ff2a6d', 
                fontFamily: 'Georgia, serif',
                borderBottom: '1px solid rgba(5, 217, 232, 0.3)',
                paddingBottom: '10px'
              }}>
                💾 Storage Usage <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#9fa8da' }}>Spatium Digitalis</span>
              </h4>
              <div className="text-center mb-3">
                <div className="display-5" style={{ color: '#ff2a6d', textShadow: '0 0 5px #ff2a6d' }}>
                  {formatFileSize(storageStats.used)}
                </div>
                <div style={{ color: '#9fa8da', fontStyle: 'italic' }}>Total Storage Used</div>
              </div>
              
              <div className="storage-chart-container text-center mb-4">
                <canvas ref={canvasRef} width="150" height="150" style={{ 
                  border: '2px solid rgba(5, 217, 232, 0.3)',
                  borderRadius: '50%',
                  padding: '5px',
                  background: 'rgba(1, 1, 43, 0.5)'
                }}></canvas>
                <div style={{ position: 'relative', marginTop: '-85px', pointerEvents: 'none' }}>
                  <div style={{ 
                    fontFamily: 'serif', 
                    fontStyle: 'italic', 
                    color: '#9fa8da', 
                    fontSize: '0.8rem' 
                  }}>Quantum Storage</div>
                </div>
              </div>
              
              <div className="storage-type-breakdown" style={{ marginTop: '70px' }}>
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ fontFamily: 'serif', color: '#e0e0ff' }}>Documents</span>
                  <span style={{ color: '#05d9e8' }}>{formatFileSize(storageStats.byType.documents)}</span>
                </div>
                <div className="progress mb-2" style={{ height: '6px', backgroundColor: 'rgba(1, 1, 43, 0.5)' }}>
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{ 
                      width: '40%',
                      background: '#ff2a6d',
                      boxShadow: '0 0 10px rgba(255, 42, 109, 0.5)'
                    }}
                    aria-valuenow="40"
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
                
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ fontFamily: 'serif', color: '#e0e0ff' }}>Images</span>
                  <span style={{ color: '#05d9e8' }}>{formatFileSize(storageStats.byType.images)}</span>
                </div>
                <div className="progress mb-2" style={{ height: '6px', backgroundColor: 'rgba(1, 1, 43, 0.5)' }}>
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{ 
                      width: '30%',
                      background: '#05d9e8',
                      boxShadow: '0 0 10px rgba(5, 217, 232, 0.5)'
                    }}
                    aria-valuenow="30"
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
                
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ fontFamily: 'serif', color: '#e0e0ff' }}>Videos</span>
                  <span style={{ color: '#05d9e8' }}>{formatFileSize(storageStats.byType.videos)}</span>
                </div>
                <div className="progress mb-2" style={{ height: '6px', backgroundColor: 'rgba(1, 1, 43, 0.5)' }}>
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{ 
                      width: '20%',
                      background: '#D300C5',
                      boxShadow: '0 0 10px rgba(211, 0, 197, 0.5)'
                    }}
                    aria-valuenow="20"
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div><div className="d-flex justify-content-between mb-1">
                  <span style={{ fontFamily: 'serif', color: '#e0e0ff' }}>Other</span>
                  <span style={{ color: '#05d9e8' }}>{formatFileSize(storageStats.byType.other)}</span>
                </div>
                <div className="progress mb-2" style={{ height: '6px', backgroundColor: 'rgba(1, 1, 43, 0.5)' }}>
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{ 
                      width: '10%',
                      background: '#7B68EE',
                      boxShadow: '0 0 10px rgba(123, 104, 238, 0.5)'
                    }}
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
      
      {/* Pinned Files and Notifications */}
      <div className="row mb-4">
        {/* Pinned Files */}
        <div className="col-md-6 mb-4 mb-md-0">
          <div className="card shadow h-100" style={{ 
            background: 'linear-gradient(135deg, #01012b 0%, #001f3f 100%)',
            border: '1px solid #05d9e8',
            boxShadow: '0 0 15px rgba(5, 217, 232, 0.3)',
            borderRadius: '10px'
          }}>
            <div className="card-body">
              <h4 className="card-title" style={{ 
                color: '#ff2a6d', 
                fontFamily: 'Georgia, serif',
                borderBottom: '1px solid rgba(5, 217, 232, 0.3)',
                paddingBottom: '10px'
              }}>
                📌 Pinned Files <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#9fa8da' }}>Summum Prioritas</span>
              </h4>
              
              {pinnedFiles.length > 0 ? (
                <div className="pinned-files-list">
                  {pinnedFiles.map(file => (
                    <div key={file.id} className="pinned-file-item d-flex align-items-center mb-3 p-2" style={{
                      background: 'rgba(1, 1, 43, 0.7)',
                      borderRadius: '8px',
                      border: '1px solid rgba(5, 217, 232, 0.2)'
                    }}>
                      <div className="file-icon me-3" style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: 'rgba(5, 217, 232, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        color: '#05d9e8',
                        border: '1px solid rgba(5, 217, 232, 0.3)'
                      }}>
                        {file.type === 'pdf' && '📄'}
                        {file.type === 'jpg' && '🖼️'}
                        {file.type === 'doc' && '📝'}
                        {file.type === 'txt' && '📝'}
                        {!['pdf', 'jpg', 'doc', 'txt'].includes(file.type) && '📁'}
                      </div>
                      <div className="file-details flex-grow-1">
                        <div className="file-name" style={{ color: '#e0e0ff' }}>{file.name}</div>
                        <div className="file-meta" style={{ fontSize: '0.8rem', color: '#9fa8da' }}>
                          {formatFileSize(file.size)} • Last accessed: {file.lastAccessed.toLocaleDateString()}
                        </div>
                      </div>
                      <button 
                        className="btn btn-sm"
                        style={{ 
                          background: 'transparent', 
                          color: '#ff2a6d',
                          border: '1px solid #ff2a6d',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => togglePinFile(file)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4" style={{ color: '#9fa8da', fontStyle: 'italic' }}>
                  No files pinned yet. Pin important files for quick access.
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Notifications */}
        <div className="col-md-6">
          <div className="card shadow h-100" style={{ 
            background: 'linear-gradient(135deg, #01012b 0%, #001f3f 100%)',
            border: '1px solid #05d9e8',
            boxShadow: '0 0 15px rgba(5, 217, 232, 0.3)',
            borderRadius: '10px'
          }}>
            <div className="card-body">
              <h4 className="card-title" style={{ 
                color: '#ff2a6d', 
                fontFamily: 'Georgia, serif',
                borderBottom: '1px solid rgba(5, 217, 232, 0.3)',
                paddingBottom: '10px'
              }}>
                🔔 Notifications <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#9fa8da' }}>Notum Facere</span>
              </h4>
              
              {notifications.length > 0 ? (
                <div className="notifications-list">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item d-flex align-items-center mb-3 p-2 ${notification.read ? '' : 'unread'}`}
                      style={{
                        background: notification.read ? 'rgba(1, 1, 43, 0.7)' : 'rgba(5, 217, 232, 0.1)',
                        borderRadius: '8px',
                        border: notification.read ? '1px solid rgba(5, 217, 232, 0.2)' : '1px solid rgba(5, 217, 232, 0.5)'
                      }}
                      onClick={() => markNotificationRead(notification.id)}
                    >
                      <div className="notification-icon me-3" style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: 'rgba(5, 217, 232, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        color: notification.type === 'share' ? '#ff2a6d' : '#05d9e8',
                        border: '1px solid rgba(5, 217, 232, 0.3)'
                      }}>
                        {notification.type === 'share' && '🔄'}
                        {notification.type === 'integrity' && '🔐'}
                        {notification.type === 'system' && '⚙️'}
                      </div>
                      <div className="notification-details flex-grow-1">
                        <div className="notification-message" style={{ 
                          color: notification.read ? '#e0e0ff' : '#05d9e8',
                          fontWeight: notification.read ? 'normal' : 'bold'
                        }}>
                          {notification.message}
                        </div>
                        <div className="notification-time" style={{ fontSize: '0.8rem', color: '#9fa8da' }}>
                          {new Date(notification.timestamp).toLocaleString()}
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="notification-badge" style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: '#ff2a6d',
                          boxShadow: '0 0 5px rgba(255, 42, 109, 0.7)'
                        }}></div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4" style={{ color: '#9fa8da', fontStyle: 'italic' }}>
                  No new notifications
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* File Preview Modal */}
      {showPreviewer && selectedFile && (
        <div className="file-preview-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(1, 1, 43, 0.9)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="file-preview-container" style={{
            width: '80%',
            maxWidth: '800px',
            background: '#010b19',
            borderRadius: '10px',
            border: '1px solid #05d9e8',
            boxShadow: '0 0 20px rgba(5, 217, 232, 0.5)',
            padding: '20px',
            position: 'relative'
          }}>
            <div className="preview-header d-flex justify-content-between align-items-center mb-3">
              <h5 style={{ color: '#ff2a6d', margin: 0 }}>{selectedFile.name}</h5>
              <button 
                className="btn-close"
                style={{ 
                  background: 'transparent', 
                  color: '#05d9e8',
                  border: '1px solid #05d9e8',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}
                onClick={closePreview}
              >
                ×
              </button>
            </div>
            <div className="preview-content text-center p-4">
              {selectedFile.type === 'jpg' ? (
                <div className="image-preview" style={{
                  background: 'rgba(1, 1, 43, 0.7)',
                  border: '1px solid rgba(5, 217, 232, 0.3)',
                  borderRadius: '8px',
                  padding: '10px',
                  minHeight: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ color: '#9fa8da', fontStyle: 'italic' }}>
                    [Image Preview Placeholder]
                  </div>
                </div>
              ) : selectedFile.type === 'pdf' ? (
                <div className="pdf-preview" style={{
                  background: 'rgba(1, 1, 43, 0.7)',
                  border: '1px solid rgba(5, 217, 232, 0.3)',
                  borderRadius: '8px',
                  padding: '10px',
                  minHeight: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ color: '#9fa8da', fontStyle: 'italic' }}>
                    [PDF Preview Placeholder]
                  </div>
                </div>
              ) : (
                <div className="file-preview" style={{
                  background: 'rgba(1, 1, 43, 0.7)',
                  border: '1px solid rgba(5, 217, 232, 0.3)',
                  borderRadius: '8px',
                  padding: '10px',
                  minHeight: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ color: '#9fa8da', fontStyle: 'italic' }}>
                    Preview not available for this file type
                  </div>
                </div>
              )}
            </div>
            <div className="preview-footer d-flex justify-content-between mt-3">
              <div className="file-details" style={{ color: '#9fa8da', fontSize: '0.9rem' }}>
                <div>Size: {formatFileSize(selectedFile.size)}</div>
                <div>Uploaded: {new Date(selectedFile.timestamp * 1000).toLocaleDateString()}</div>
              </div>
              <div className="preview-actions">
                <button 
                  className="btn btn-sm me-2"
                  style={{ 
                    background: '#01012b', 
                    color: '#05d9e8',
                    border: '1px solid #05d9e8',
                  }}
                >
                  Download
                </button>
                <button 
                  className="btn btn-sm"
                  style={{ 
                    background: '#01012b', 
                    color: '#ff2a6d',
                    border: '1px solid #ff2a6d',
                  }}
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="text-center mt-5" style={{ color: '#9fa8da', borderTop: '1px solid rgba(5, 217, 232, 0.2)', paddingTop: '20px' }}>
        <p className="mb-0">
          <span style={{ fontFamily: 'serif', fontStyle: 'italic' }}>VAULTIS Codex Securitas</span> &copy; 2025
          <span className="mx-2">|</span>
          <span style={{ fontSize: '0.8rem' }}>"Secure by Design, Private by Default"</span>
        </p>
      </footer>
    </div>
  );
}

export default Dashboard;