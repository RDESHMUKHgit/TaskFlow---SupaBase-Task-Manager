import React, { useState, useRef, useEffect } from 'react';
import {
  FiPlus,
  FiSearch,
  FiCheckSquare,
  FiDatabase,
  FiServer,
  FiX,
  FiLogOut,
  FiUser,
  FiChevronDown,
  FiShield,
  FiSun,
  FiMoon,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useTaskContext } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

export default function Navbar() {
  const {
    searchQuery,
    setSearchQuery,
    openCreateModal,
    isDbReady,
    serverOnline,
  } = useTaskContext();

  const { user, profile, signOut, openProfileModal } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    const res = await signOut();
    if (res.success) {
      toast.info('Logged out securely. See you soon! 👋');
    }
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();
  const hasAvatar = Boolean(profile?.avatar_url);

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
          {/* Theme Toggle Button */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {/* Status Indicators */}
          <div className="system-status">
            <div
              className={`status-pill ${serverOnline ? 'online' : 'offline'}`}
              title={serverOnline ? 'Express Server Online (Scoped by Auth)' : 'Express Server Offline'}
            >
              <FiServer />
              <span>{serverOnline ? 'API Active' : 'API Offline'}</span>
            </div>

            <div
              className={`status-pill ${isDbReady ? 'online' : 'warning'}`}
              title={isDbReady ? 'Supabase DB Connected with RLS' : 'Supabase Table Setup Required'}
            >
              <FiDatabase />
              <span>{isDbReady ? 'RLS Active' : 'Setup DB Table'}</span>
            </div>
          </div>

          {/* New Task Action Button */}
          <button className="btn btn-primary create-task-btn" onClick={openCreateModal}>
            <FiPlus size={18} />
            <span>New Task</span>
          </button>

          {/* User Profile & Dropdown */}
          <div className="user-profile-menu" ref={dropdownRef}>
            <button
              className="user-profile-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="User menu"
            >
              <div className="user-avatar">
                {hasAvatar ? (
                  <img src={profile.avatar_url} alt={displayName} className="user-avatar-img" />
                ) : (
                  initial
                )}
              </div>
              <div className="user-meta">
                <span className="user-name">{displayName}</span>
                <span className="user-email">{user?.email}</span>
              </div>
              <FiChevronDown className={`chevron-icon ${dropdownOpen ? 'rotated' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="user-dropdown-menu glass-card animate-fade-in">
                <div className="dropdown-user-header">
                  <div className="user-avatar-lg">
                    {hasAvatar ? (
                      <img src={profile.avatar_url} alt={displayName} className="user-avatar-img" />
                    ) : (
                      initial
                    )}
                  </div>
                  <div className="dropdown-user-info">
                    <p className="dropdown-name">{displayName}</p>
                    <p className="dropdown-email">{user?.email}</p>
                    <span className="dropdown-badge">
                      <FiShield size={11} /> Authenticated User
                    </span>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    openProfileModal();
                  }}
                >
                  <FiUser size={16} />
                  <span>Profile Dashboard</span>
                </button>

                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <FiLogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
