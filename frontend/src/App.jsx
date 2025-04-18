import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Blockchain from './pages/BlockchainExplorer';
import NodeNetwork from './pages/NodeNetwork';
import Files from './pages/Files';
import GrantAccess from './pages/GrantAccess';
import Wallet from './pages/Wallet';
import Settings from './pages/Settings';
import Login from './pages/Login';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  return user ? <Navigate to="/" /> : children;
};

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="content-container">{children}</div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/blockchain" element={
          <ProtectedRoute>
            <Layout>
              <Blockchain />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/network" element={
          <ProtectedRoute>
            <Layout>
              <NodeNetwork />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/files" element={
          <ProtectedRoute>
            <Layout>
              <Files />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/grant-access" element={
          <ProtectedRoute>
            <Layout>
              <GrantAccess />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/wallet" element={
          <ProtectedRoute>
            <Layout>
              <Wallet />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;