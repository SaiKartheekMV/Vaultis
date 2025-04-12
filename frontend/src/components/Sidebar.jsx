import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="bg-dark text-white p-3 vh-100" style={{ width: '250px' }}>
      <h4 className="mb-4">☢️ Quantum Menu</h4>
      <ul className="nav flex-column">
        <li className="nav-item mb-2"><Link className="nav-link text-white" to="/">Dashboard</Link></li>
        <li className="nav-item mb-2"><Link className="nav-link text-white" to="/files">Files</Link></li>
        <li className="nav-item mb-2"><Link className="nav-link text-white" to="/settings">Settings</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;
