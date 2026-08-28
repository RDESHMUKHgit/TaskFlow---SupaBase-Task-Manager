import React from 'react';
import { FiPlus, FiSearch, FiCheckSquare, FiDatabase, FiServer, FiX } from 'react-icons/fi';
import { useTaskContext } from '../../context/TaskContext';
import './Navbar.css';

export default function Navbar() {
  const {
    searchQuery,
    setSearchQuery,
    openCreateModal,
    isDbReady,
    serverOnline,
  } = useTaskContext();

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo & Name */}
        <div className="navbar-brand">
          <div className="brand-icon">
            <FiCheckSquare />
          </div>
          <div className="brand-text">
            <span className="brand-title">TaskFlow</span>
            <span className="brand-badge">Supabase + Express</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="navbar-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search tasks, descriptions, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="clear-search-btn"
              title="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>

        {/* Status badges & Quick Actions */}
        <div className="navbar-actions">
          {/* Status Indicators */}
          <div className="system-status">
            <div
              className={`status-pill ${serverOnline ? 'online' : 'offline'}`}
              title={serverOnline ? 'Express Server Online' : 'Express Server Offline'}
            >
              <FiServer />
              <span>{serverOnline ? 'API Active' : 'API Offline'}</span>
            </div>

            <div
              className={`status-pill ${isDbReady ? 'online' : 'warning'}`}
              title={isDbReady ? 'Supabase DB Connected' : 'Supabase Table Missing'}
            >
              <FiDatabase />
              <span>{isDbReady ? 'Supabase Ready' : 'Setup DB Table'}</span>
            </div>
          </div>

          {/* New Task Action Button */}
          <button className="btn btn-primary create-task-btn" onClick={openCreateModal}>
            <FiPlus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
}
