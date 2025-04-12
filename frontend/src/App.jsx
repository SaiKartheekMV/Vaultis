import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import Settings from './pages/Settings';
import Login from './pages/Login';

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  return user ? <Navigate to="/dashboard" /> : children;
};

const Layout = ({ children }) => (
  <div className="d-flex">
    <Sidebar />
    <div className="flex-grow-1">
      <Navbar />
      <div className="container mt-4">{children}</div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
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
