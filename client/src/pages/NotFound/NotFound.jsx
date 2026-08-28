import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiAlertCircle } from 'react-icons/fi';
import './NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-page animate-fade-in">
      <div className="notfound-card glass-card">
        <div className="notfound-icon">
          <FiAlertCircle />
        </div>
        <h1 className="notfound-code">404</h1>
        <h2 className="notfound-title">Page Not Found</h2>
        <p className="notfound-text">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          <FiHome size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
