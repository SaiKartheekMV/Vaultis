import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Definitive list of file-related paths
  const fileRelatedPaths = ['/filelist', '/filedetails', '/download'];
  
  // Check if current path is related to files to auto-expand the submenu
  useEffect(() => {
    if (fileRelatedPaths.includes(currentPath)) {
      setExpandedSubmenu('files');
    }
  }, [currentPath]);
  
  const menuItems = [
    { path: '/', name: 'Quantum Dashboard', icon: '⚛️' },
    { path: '/blockchain', name: 'Blockchain Explorer', icon: '🔗' },
    { path: '/wallet', name: 'Crypto Wallet', icon: '💰' },
<<<<<<< HEAD
    { path: '/network', name: 'Node Network', icon: '🌐' },
    { path: '/files', name: 'Encrypted Files', icon: '🔐' },
=======
    { path: '/nodes', name: 'Node Network', icon: '🌐' },
    { 
      name: 'Encrypted Files', 
      icon: '🔐',
      id: 'files',
      submenu: [
        { path: '/filelist', name: 'FileList' },
        { path: '/filedetails', name: 'FileDetails' },
        { path: '/download', name: 'Download' }
      ]
    },
>>>>>>> ee0547746aeb4e96bddd13e08db1b38370470455
    { path: '/grant-access', name: 'Grant access', icon: '🗝️' },
    { path: '/settings', name: 'System Config', icon: '⚙️' }
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleSubmenu = (id) => {
    if (expandedSubmenu === id) {
      setExpandedSubmenu('');
    } else {
      setExpandedSubmenu(id);
    }
  };

  // Helper function to check if a path is file-related
  const isFileRelatedPath = () => {
    return fileRelatedPaths.includes(currentPath);
  };

  // Determine sidebar classes based on state
  const sidebarClasses = `
    bg-dark text-white d-flex flex-column transition-all 
    ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} 
    ${mobileOpen ? 'mobile-open' : ''}
  `;

  return (
    <>
      {/* Mobile Toggle Button - Outside the sidebar */}
      <button 
<<<<<<< HEAD
        className="btn btn-sm position-absolute d-none d-md-block" 
        onClick={toggleSidebar}
        style={{ 
          top: '10px', 
          right: '-0px',
          zIndex: 100,
=======
        className="mobile-toggle-btn d-md-none"
        onClick={toggleMobileSidebar}
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          zIndex: 1000,
>>>>>>> ee0547746aeb4e96bddd13e08db1b38370470455
          background: '#16213e',
          color: '#0cebf3',
          border: '1px solid #0cebf3',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px'
        }}>
        {mobileOpen ? '✕' : '☰'}
      </button>
      
      <div className={sidebarClasses}
        style={{
          width: collapsed ? '80px' : '250px',
          minWidth: collapsed ? '80px' : '250px',
          height: '100vh',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          boxShadow: '0 0 20px rgba(0, 195, 255, 0.15)',
          position: 'sticky',
          top: 0,
          transition: 'all 0.3s ease',
          zIndex: 900
        }}>
        
        {/* Desktop Collapse Toggle Button */}
        <button 
          className="btn btn-sm position-absolute d-none d-md-block" 
          onClick={toggleSidebar}
          style={{ 
            top: '10px', 
            right: '-12px',
            zIndex: 100,
            background: '#16213e',
            color: '#0cebf3',
            border: '1px solid #0cebf3',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px'
          }}>
          {collapsed ? '→' : '←'}
        </button>
        
        {/* Logo Area */}
        <div className="d-flex align-items-center justify-content-center p-3 mb-3">
          <div className="me-2" style={{ fontSize: collapsed ? '24px' : '28px' }}>🧠</div>
          {!collapsed && (
            <h4 className="mb-0" style={{ 
              background: 'linear-gradient(90deg, #0cebf3, #c56cf0)', 
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'monospace',
              letterSpacing: '1px'
            }}>
              VAULTIS
            </h4>
          )}
        </div>
        
        {/* Golden Ratio Inspired Divider */}
        <div className="mx-auto mb-3" style={{ 
          width: collapsed ? '40px' : '80%', 
          height: '2px',
          background: 'linear-gradient(90deg, rgba(12, 235, 243, 0.2), rgba(255, 215, 0, 0.6), rgba(12, 235, 243, 0.2))'
        }}></div>
        
        {/* Navigation Menu */}
        <ul className="nav flex-column mt-2 flex-grow-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path || item.id} className="nav-item mb-2">
              {item.submenu ? (
                <div>
                  <div 
                    className={`nav-link d-flex align-items-center ${isFileRelatedPath() ? 'active' : ''}`}
                    onClick={() => !collapsed && toggleSubmenu(item.id)}
                    style={{
                      padding: collapsed ? '10px 0' : '10px',
                      justifyContent: collapsed ? 'center' : 'space-between',
                      background: isFileRelatedPath() ? 'rgba(12, 235, 243, 0.1)' : 'transparent',
                      borderLeft: isFileRelatedPath() ? '3px solid #0cebf3' : '3px solid transparent',
                      borderRadius: '4px',
                      color: isFileRelatedPath() ? '#ffffff' : '#adb5bd',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <span className={collapsed ? '' : 'me-3'} style={{ 
                        fontSize: collapsed ? '20px' : '16px',
                        filter: isFileRelatedPath() ? 'drop-shadow(0 0 5px rgba(12, 235, 243, 0.5))' : 'none'
                      }}>
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <span style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.name}
                        </span>
                      )}
                    </div>
                    {!collapsed && (
                      <span style={{ fontSize: '12px' }}>
                        {expandedSubmenu === item.id ? '▼' : '▶'}
                      </span>
                    )}
                  </div>
                  
                  {/* Submenu Items */}
                  {((expandedSubmenu === item.id) || (collapsed && isFileRelatedPath())) && (
                    <ul className="nav flex-column submenu" style={{
                      listStyle: 'none',
                      padding: collapsed ? '0' : '0 0 0 30px',
                      margin: '5px 0',
                      maxHeight: '500px',
                      transition: 'max-height 0.3s ease',
                      overflow: 'hidden'
                    }}>
                      {item.submenu.map((subItem) => (
                        <li key={subItem.path} className="nav-item">
                          <Link 
                            className={`nav-link ${currentPath === subItem.path ? 'active' : ''}`}
                            to={subItem.path}
                            style={{
                              padding: '8px 10px',
                              fontSize: collapsed ? '12px' : '14px',
                              display: 'flex',
                              justifyContent: collapsed ? 'center' : 'flex-start',
                              color: currentPath === subItem.path ? '#0cebf3' : '#8a8d91',
                              borderLeft: currentPath === subItem.path ? '2px solid #0cebf3' : '2px solid transparent',
                              background: currentPath === subItem.path ? 'rgba(12, 235, 243, 0.05)' : 'transparent',
                              borderRadius: '2px',
                              margin: '2px 0'
                            }}
                          >
                            {!collapsed && subItem.name}
                            {collapsed && subItem.name.charAt(0)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link 
                  className={`nav-link ${currentPath === item.path ? 'active' : ''} d-flex align-items-center`} 
                  to={item.path}
                  style={{
                    padding: collapsed ? '10px 0' : '10px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background: currentPath === item.path ? 'rgba(12, 235, 243, 0.1)' : 'transparent',
                    borderLeft: currentPath === item.path ? '3px solid #0cebf3' : '3px solid transparent',
                    borderRadius: '4px',
                    color: currentPath === item.path ? '#ffffff' : '#adb5bd',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span className={collapsed ? '' : 'me-3'} style={{ 
                    fontSize: collapsed ? '20px' : '16px',
                    filter: currentPath === item.path ? 'drop-shadow(0 0 5px rgba(12, 235, 243, 0.5))' : 'none'
                  }}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.name}
                    </span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
        
        {/* Bottom Area */}
        <div className="mt-auto px-3 pb-3">
          <div className="nav-divider my-3" style={{ 
            height: '1px',
            background: 'linear-gradient(90deg, rgba(12, 235, 243, 0.1), rgba(255, 215, 0, 0.3), rgba(12, 235, 243, 0.1))'
          }}></div>
          
          <div className={`d-flex ${collapsed ? 'justify-content-center' : 'align-items-center'}`}>
            <span className="badge me-2" style={{ 
              background: 'linear-gradient(45deg, #0cebf3, #7367f0)',
              fontSize: '10px',
              display: collapsed ? 'none' : 'inline-block'
            }}>
              ALPHA
            </span>
            <small style={{ 
              color: '#0cebf3',
              fontSize: collapsed ? '10px' : '12px',
              textAlign: collapsed ? 'center' : 'left'
            }}>
              {collapsed ? 'v1.0' : 'Quantum Nexus v1.0.8'}
            </small>
          </div>
          
          {!collapsed && (
            <div className="mt-2 d-flex align-items-center" style={{ fontSize: '11px', color: '#adb5bd' }}>
              <div className="me-1" style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: '#00ff00',
                boxShadow: '0 0 5px #00ff00' 
              }}></div>
              <span>Node Status: Connected</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div 
          className="sidebar-backdrop d-md-none" 
          onClick={toggleMobileSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 899
          }}
        />
      )}
      
      {/* Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .sidebar-expanded {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .mobile-open {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
}

export default Sidebar;