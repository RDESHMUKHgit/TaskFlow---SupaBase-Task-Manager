import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiCheckSquare, FiLoader } from 'react-icons/fi';
import './ProtectedRoute.css';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-card glass-card">
          <div className="auth-loading-icon">
            <FiCheckSquare size={32} />
          </div>
          <h2 className="auth-loading-title">TaskFlow</h2>
          <p className="auth-loading-text">Authenticating your secure session...</p>
          <div className="auth-spinner">
            <FiLoader className="spin" size={24} />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
}
