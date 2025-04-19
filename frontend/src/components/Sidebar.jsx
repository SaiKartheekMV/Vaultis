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
          background: '#0a1128',
          color: '#fe0557',
          border: '1px solid #fe0557',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          boxShadow: '0 0 10px rgba(254, 5, 87, 0.7)'
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
          background: 'linear-gradient(135deg, #0a1128 0%, #001b54 100%)',
          borderRight: '1px solid rgba(0, 149, 255, 0.2)',
          boxShadow: '0 0 25px rgba(254, 5, 87, 0.2)',
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
            top: '15px',
            right: '-12px',
            background: '#0a1128',
            color: '#0095ff',
            border: '1px solid #0095ff',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            boxShadow: '0 0 8px rgba(0, 149, 255, 0.6)'
          }}
        >
          {collapsed ? '→' : '←'}
        </button>

        {/* Logo */}
        <div className="d-flex align-items-center justify-content-center py-4 mb-3">
          <div 
            className="me-2" 
            style={{ 
              fontSize: collapsed ? '28px' : '32px',
              textShadow: '0 0 10px rgba(254, 5, 87, 0.8)'
            }}
          >
            ⚛️
          </div>
          {!collapsed && (
            <h4 className="mb-0" style={{
              background: 'linear-gradient(90deg, #fe0557, #0095ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: '"Courier New", monospace',
              letterSpacing: '2px',
              fontWeight: 'bold',
              textShadow: '0 0 15px rgba(0, 149, 255, 0.5)'
            }}>
              VAULTIS
            </h4>
          )}
        </div>

        {/* Divider */}
        <div className="mx-auto mb-4" style={{
          width: collapsed ? '40px' : '85%',
          height: '2px',
          background: 'linear-gradient(90deg, rgba(254, 5, 87, 0.3), rgba(0, 149, 255, 0.7), rgba(254, 5, 87, 0.3))'
        }}></div>

        {/* Menu Items */}
        <ul className="nav flex-column mt-2 flex-grow-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path || item.id} className="nav-item mb-3">
              {item.submenu ? (
                <>
                  <div
                    className={`nav-link d-flex align-items-center ${isInSubmenu(item.id) ? 'active' : ''}`}
                    onClick={() => !collapsed && toggleSubmenu(item.id)}
                    style={{
                      padding: collapsed ? '12px 0' : '12px',
                      justifyContent: collapsed ? 'center' : 'space-between',
                      background: isInSubmenu(item.id) ? 'rgba(254, 5, 87, 0.15)' : 'transparent',
                      borderLeft: isInSubmenu(item.id) ? '3px solid #fe0557' : '3px solid transparent',
                      borderRadius: '6px',
                      color: isInSubmenu(item.id) ? '#ffffff' : '#b8c7e0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <span className={collapsed ? '' : 'me-3'} style={{
                        fontSize: collapsed ? '22px' : '18px',
                        filter: isInSubmenu(item.id) ? 'drop-shadow(0 0 5px rgba(254, 5, 87, 0.8))' : 'none'
                      }}>
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <span style={{
                          fontWeight: isInSubmenu(item.id) ? '600' : '400',
                          letterSpacing: '0.5px'
                        }}>
                          {item.name}
                        </span>
                      )}
                    </div>
                    {!collapsed && (
                      <span style={{ 
                        fontSize: '12px', 
                        color: isInSubmenu(item.id) ? '#fe0557' : '#0095ff' 
                      }}>
                        {expandedSubmenu === item.id ? '▼' : '▶'}
                      </span>
                    )}
                  </div>

                  {(expandedSubmenu === item.id || (collapsed && isInSubmenu(item.id))) && (
                    <ul className="nav flex-column submenu" style={{
                      listStyle: 'none',
                      padding: collapsed ? '0' : '0 0 0 35px',
                      margin: '5px 0'
                    }}>
                      {item.submenu.map((subItem) => (
                        <li key={subItem.path} className="nav-item">
                          <Link
                            className={`nav-link ${currentPath === subItem.path ? 'active' : ''}`}
                            to={subItem.path}
                            style={{
                              padding: '10px',
                              fontSize: collapsed ? '12px' : '14px',
                              display: 'flex',
                              justifyContent: collapsed ? 'center' : 'flex-start',
                              color: currentPath === subItem.path ? '#0095ff' : '#8a9cc2',
                              borderLeft: currentPath === subItem.path ? '2px solid #0095ff' : '2px solid transparent',
                              background: currentPath === subItem.path ? 'rgba(0, 149, 255, 0.08)' : 'transparent',
                              borderRadius: '4px',
                              margin: '2px 0',
                              transition: 'all 0.2s ease'
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
                    padding: collapsed ? '12px 0' : '12px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background: currentPath === item.path ? 'rgba(0, 149, 255, 0.15)' : 'transparent',
                    borderLeft: currentPath === item.path ? '3px solid #0095ff' : '3px solid transparent',
                    borderRadius: '6px',
                    color: currentPath === item.path ? '#ffffff' : '#b8c7e0',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {currentPath === item.path && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'radial-gradient(circle at center, rgba(0, 149, 255, 0.08) 0%, transparent 70%)',
                      pointerEvents: 'none'
                    }}></div>
                  )}
                  <span className={collapsed ? '' : 'me-3'} style={{
                    fontSize: collapsed ? '22px' : '18px',
                    filter: currentPath === item.path ? 'drop-shadow(0 0 5px rgba(0, 149, 255, 0.8))' : 'none'
                  }}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span style={{
                      fontWeight: currentPath === item.path ? '600' : '400',
                      letterSpacing: '0.5px'
                    }}>
                      {item.name}
                    </span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Bottom Info */}
        <div className="mt-auto px-3 pb-4 pt-3">
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, rgba(254, 5, 87, 0.2), rgba(0, 149, 255, 0.4), rgba(254, 5, 87, 0.2))',
            marginBottom: '12px'
          }}></div>
          <div className={`d-flex ${collapsed ? 'justify-content-center' : 'justify-content-between align-items-center'}`}>
            {!collapsed && (
              <div className="d-flex align-items-center">
                <span className="badge me-2" style={{
                  background: 'linear-gradient(45deg, #fe0557, #0095ff)',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  padding: '5px 8px',
                  borderRadius: '4px',
                  boxShadow: '0 0 10px rgba(254, 5, 87, 0.5)'
                }}>QUANTUM</span>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#00ff41',
                  boxShadow: '0 0 8px rgba(0, 255, 65, 0.8)'
                }}></div>
              </div>
            )}
            <small style={{
              color: collapsed ? '#0095ff' : '#b8c7e0',
              fontSize: collapsed ? '10px' : '12px',
              fontWeight: 'bold',
              textAlign: 'center',
              fontFamily: '"Courier New", monospace',
              letterSpacing: '1px'
            }}>
              v1.09 ALPHA
            </small>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;