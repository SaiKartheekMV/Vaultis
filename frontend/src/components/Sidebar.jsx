import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Define paths that should expand submenus
  const fileEncryptionPaths = ['/file-center'];
  const fileOperationsPaths = ['/grant-access', '/download'];

  useEffect(() => {
    if (fileEncryptionPaths.some(path => currentPath.includes(path))) {
      setExpandedSubmenu('file-encryption');
    } else if (fileOperationsPaths.some(path => currentPath.includes(path))) {
      setExpandedSubmenu('file-operations');
    }
  }, [currentPath]);

  const menuItems = [
    { path: '/', name: 'Dashboard', icon: '📊' },
    { path: '/blockchain', name: 'Blockchain Explorer', icon: '🔗' },
    { path: '/wallet', name: 'Crypto Wallet', icon: '💰' },
    { path: '/network', name: 'Node Network', icon: '🌐' },
    {
      id: 'file-encryption',
      name: 'File Encryption',
      icon: '🔐',
      submenu: [
        { path: '/file-center', name: 'File Center' }
      ]
    },
    { path: '/settings', name: 'Settings', icon: '⚙️' }
  ];

  const toggleSidebar = () => setCollapsed(!collapsed);
  const toggleMobileSidebar = () => setMobileOpen(!mobileOpen);

  const toggleSubmenu = (id) => {
    setExpandedSubmenu(expandedSubmenu === id ? '' : id);
  };

  const isInSubmenu = (submenuId) => {
    if (submenuId === 'file-encryption') {
      return fileEncryptionPaths.some(path => currentPath.includes(path));
    } else if (submenuId === 'file-operations') {
      return fileOperationsPaths.some(path => currentPath.includes(path));
    }
    return false;
  };

  const sidebarClasses = `
    bg-dark text-white d-flex flex-column transition-all 
    ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} 
    ${mobileOpen ? 'mobile-open' : ''}
  `;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="mobile-toggle-btn d-md-none"
        onClick={toggleMobileSidebar}
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          background: '#16213e',
          color: '#0cebf3',
          border: '1px solid #0cebf3',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px'
        }}
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      <div
        className={sidebarClasses}
        style={{
          width: collapsed ? '80px' : '250px',
          minWidth: collapsed ? '80px' : '250px',
          height: '100vh',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          boxShadow: '0 0 20px rgba(197, 108, 240, 0.25)',
          position: 'sticky',
          top: 0,
          transition: 'all 0.3s ease',
          zIndex: 900
        }}
      >
        {/* Collapse Toggle (Desktop) */}
        <button
          className="btn btn-sm position-absolute d-none d-md-block"
          onClick={toggleSidebar}
          style={{
            top: '10px',
            right: '0px',
            background: '#16213e',
            color: '#0cebf3',
            border: '1px solid #0cebf3',
            borderRadius: '50%',
            width: 'auto',
            height: 'auto',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
        >
          {collapsed ? '→' : '←'}
        </button>

        {/* Logo */}
        <div className="d-flex align-items-center justify-content-center p-3 mb-3">
          <div className="me-2" style={{ fontSize: collapsed ? '24px' : '28px' }}>⚛️</div>
          {!collapsed && (
            <h4 className="mb-0" style={{
              background: 'linear-gradient(90deg, #0cebf3, #c56cf0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'monospace',
              letterSpacing: '1px',
              fontWeight: 'bold'
            }}>
              VAULTIS
            </h4>
          )}
        </div>

        {/* Divider */}
        <div className="mx-auto mb-3" style={{
          width: collapsed ? '40px' : '80%',
          height: '2px',
          background: 'linear-gradient(90deg, rgba(12, 235, 243, 0.2), rgba(197, 108, 240, 0.6), rgba(12, 235, 243, 0.2))'
        }}></div>

        {/* Menu Items */}
        <ul className="nav flex-column mt-2 flex-grow-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path || item.id} className="nav-item mb-2">
              {item.submenu ? (
                <>
                  <div
                    className={`nav-link d-flex align-items-center ${isInSubmenu(item.id) ? 'active' : ''}`}
                    onClick={() => !collapsed && toggleSubmenu(item.id)}
                    style={{
                      padding: collapsed ? '10px 0' : '10px',
                      justifyContent: collapsed ? 'center' : 'space-between',
                      background: isInSubmenu(item.id) ? 'rgba(197, 108, 240, 0.1)' : 'transparent',
                      borderLeft: isInSubmenu(item.id) ? '3px solid #c56cf0' : '3px solid transparent',
                      borderRadius: '4px',
                      color: isInSubmenu(item.id) ? '#ffffff' : '#adb5bd',
                      cursor: 'pointer'
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <span className={collapsed ? '' : 'me-3'} style={{
                        fontSize: collapsed ? '20px' : '16px',
                        filter: isInSubmenu(item.id) ? 'drop-shadow(0 0 5px rgba(197, 108, 240, 0.5))' : 'none'
                      }}>
                        {item.icon}
                      </span>
                      {!collapsed && <span>{item.name}</span>}
                    </div>
                    {!collapsed && <span style={{ fontSize: '12px' }}>{expandedSubmenu === item.id ? '▼' : '▶'}</span>}
                  </div>

                  {(expandedSubmenu === item.id || (collapsed && isInSubmenu(item.id))) && (
                    <ul className="nav flex-column submenu" style={{
                      listStyle: 'none',
                      padding: collapsed ? '0' : '0 0 0 30px',
                      margin: '5px 0'
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
                            {!collapsed ? subItem.name : subItem.name.charAt(0)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
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
                    color: currentPath === item.path ? '#ffffff' : '#adb5bd'
                  }}
                >
                  <span className={collapsed ? '' : 'me-3'} style={{
                    fontSize: collapsed ? '20px' : '16px',
                    filter: currentPath === item.path ? 'drop-shadow(0 0 5px rgba(12, 235, 243, 0.5))' : 'none'
                  }}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Bottom Info */}
        <div className="mt-auto px-3 pb-3">
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, rgba(12, 235, 243, 0.1), rgba(197, 108, 240, 0.3), rgba(12, 235, 243, 0.1))'
          }}></div>
          <div className={`d-flex ${collapsed ? 'justify-content-center' : 'align-items-center'}`}>
            {!collapsed && (
              <span className="badge me-2" style={{
                background: 'linear-gradient(45deg, #0cebf3, #c56cf0)',
                fontSize: '10px'
              }}>QUANTUM</span>
            )}
            <small style={{
              color: '#0cebf3',
              fontSize: collapsed ? '10px' : '12px',
              textAlign: 'center'
            }}>
              v1.0.0
            </small>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;