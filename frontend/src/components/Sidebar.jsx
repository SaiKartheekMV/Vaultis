import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [collapsed, setCollapsed] = useState(false);
  
  const menuItems = [
    { path: '/', name: 'Quantum Dashboard', icon: '⚛️' },
    { path: '/blockchain', name: 'Blockchain Explorer', icon: '🔗' },
    { path: '/wallet', name: 'Crypto Wallet', icon: '💰' },
    { path: '/network', name: 'Node Network', icon: '🌐' },
    { path: '/files', name: 'Encrypted Files', icon: '🔐' },
    { path: '/grant-access', name: 'Grant access', icon: '🗝️' },
    { path: '/settings', name: 'System Config', icon: '⚙️' }
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`bg-dark text-white d-flex flex-column transition-all ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
      style={{
        width: collapsed ? '80px' : '250px',
        minWidth: collapsed ? '80px' : '250px',
        height: 'auto',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        boxShadow: '0 0 20px rgba(0, 195, 255, 0.15)',
        position: 'relative',
        transition: 'all 0.3s ease'
      }}>
      
      {/* Collapse Toggle Button */}
      <button 
        className="btn btn-sm position-absolute d-none d-md-block" 
        onClick={toggleSidebar}
        style={{ 
          top: '10px', 
          right: '-0px',
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
          <li key={item.path} className="nav-item mb-2">
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
      
      {/* Add responsive styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .sidebar-expanded {
            width: 250px !important;
            min-width: 250px !important;
            transform: translateX(0);
          }
          .sidebar-collapsed {
            width: 0 !important;
            min-width: 0 !important;
            padding: 0 !important;
            transform: translateX(-100%);
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  );
}

export default Sidebar;