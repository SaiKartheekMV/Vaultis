import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import BlockchainExplorer from './pages/BlockchainExplorer';
import NodeNetwork from './pages/NodeNetwork';
import FileCenter from './pages/FileCenter'; // Renamed component for consolidated file operations
import Wallet from './pages/Wallet';
import Settings from './pages/Settings';
import Login from './pages/Login';
import QuantumFileDownloader from './pages/DownloadCenter';
import './App.css';

// Placeholder component for Download
const Download = () => (
  <div className="p-4">
    <h2>Download</h2>
    <p>This page is under construction</p>
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  return user ? children : <Navigate to="/login" />;
};

// Public route wrapper
const PublicRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  return user ? <Navigate to="/" /> : children;
};

// Layout for pages with sidebar and navbar
const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="content-container">
          <React.Suspense fallback={<div>Loading...</div>}>
            {children}
          </React.Suspense>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        {/* Protected Routes */}
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
              <BlockchainExplorer />
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
        <Route path="/network" element={
          <ProtectedRoute>
            <Layout>
              <NodeNetwork />
            </Layout>
          </ProtectedRoute>
        } />

        {/* File Center - Consolidated file operations */}
        <Route path="/file-center" element={
          <ProtectedRoute>
            <Layout>
              <FileCenter />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/download-center" element={
          <ProtectedRoute>
            <Layout>
              <QuantumFileDownloader />
            </Layout>
          </ProtectedRoute>
        } />
        {/* File Operations Routes */}
        

        {/* Legacy Routes - All redirect to File Center */}
        <Route path="/files" element={
          <Navigate to="/file-center" replace />
        } />
        <Route path="/upload-form" element={
          <Navigate to="/file-center" replace />
        } />
        <Route path="/file-management" element={
          <Navigate to="/file-center" replace />
        } />
        <Route path="/file-list" element={
          <Navigate to="/file-center" replace />
        } />
        <Route path="/file-details" element={
          <Navigate to="/file-center" replace />
        } />

        {/* Settings Route */}
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;