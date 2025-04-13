import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const menuItems = [
    { path: '/', name: 'Dashboard', icon: '📊' },
    { path: '/files', name: 'Files', icon: '📁' },
    { path: '/settings', name: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="bg-dark text-white p-3 vh-100 d-flex flex-column" style={{ width: '250px', minWidth: '250px' }}>
      <div className="mb-4 d-flex align-items-center">
        <span className="fs-4 me-2">☢️</span>
        <h4 className="mb-0">Quantum Menu</h4>
      </div>
      
      <div className="nav-divider bg-secondary opacity-25 my-2"></div>
      
      <ul className="nav flex-column mt-2 flex-grow-1">
        {menuItems.map((item) => (
          <li key={item.path} className="nav-item mb-2">
            <Link 
              className={`nav-link ${currentPath === item.path ? 'active bg-primary bg-opacity-25 rounded' : 'text-white'} d-flex align-items-center`} 
              to={item.path}
            >
              <span className="me-3">{item.icon}</span>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      
      <div className="mt-auto">
        <div className="nav-divider bg-secondary opacity-25 my-3"></div>
        <div className="d-flex align-items-center mb-2">
          <span className="badge bg-info me-2">Beta</span>
          <small>Vaultis v0.1.0</small>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;