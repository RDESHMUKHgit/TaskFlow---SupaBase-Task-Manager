import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiList,
  FiPieChart,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiTag,
  FiFolder,
} from 'react-icons/fi';
import { useTaskContext } from '../../context/TaskContext';
import './Sidebar.css';

export default function Sidebar() {
  const { stats, selectedStatus, setSelectedStatus, selectedCategory, setSelectedCategory } = useTaskContext();
  const navigate = useNavigate();

  const handleStatusClick = (status) => {
    setSelectedStatus(status);
    navigate('/tasks');
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    navigate('/tasks');
  };

  const categories = ['General', 'Development', 'Design', 'Feature', 'Analytics', 'Personal'];

  return (
    <aside className="sidebar">
      {/* Primary Navigation */}
      <div className="sidebar-section">
        <span className="sidebar-heading">Navigation</span>
        <nav className="sidebar-nav">
          <NavLink
            to="/"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            end
          >
            <FiGrid className="link-icon" />
            <span className="link-label">Dashboard</span>
          </NavLink>

          <NavLink
            to="/tasks"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <FiList className="link-icon" />
            <span className="link-label">All Tasks</span>
            {stats.total > 0 && <span className="sidebar-counter">{stats.total}</span>}
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <FiPieChart className="link-icon" />
            <span className="link-label">Analytics</span>
          </NavLink>
        </nav>
      </div>

      {/* Status Filters */}
      <div className="sidebar-section">
        <span className="sidebar-heading">Task Status</span>
        <div className="sidebar-nav">
          <button
            className={`sidebar-link filter-btn ${selectedStatus === 'pending' ? 'active' : ''}`}
            onClick={() => handleStatusClick('pending')}
          >
            <FiClock className="link-icon status-icon pending" />
            <span className="link-label">Pending</span>
            <span className="sidebar-counter">{stats.pending || 0}</span>
          </button>

          <button
            className={`sidebar-link filter-btn ${selectedStatus === 'in_progress' ? 'active' : ''}`}
            onClick={() => handleStatusClick('in_progress')}
          >
            <FiAlertCircle className="link-icon status-icon in_progress" />
            <span className="link-label">In Progress</span>
            <span className="sidebar-counter">{stats.inProgress || 0}</span>
          </button>

          <button
            className={`sidebar-link filter-btn ${selectedStatus === 'completed' ? 'active' : ''}`}
            onClick={() => handleStatusClick('completed')}
          >
            <FiCheckCircle className="link-icon status-icon completed" />
            <span className="link-label">Completed</span>
            <span className="sidebar-counter">{stats.completed || 0}</span>
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="sidebar-section">
        <span className="sidebar-heading">Categories</span>
        <div className="category-tags">
          <button
            className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('all')}
          >
            <FiFolder size={13} />
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat)}
            >
              <FiTag size={12} />
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
