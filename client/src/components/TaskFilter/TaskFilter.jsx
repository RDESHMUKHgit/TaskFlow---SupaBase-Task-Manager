import React from 'react';
import {
  FiFilter,
  FiGrid,
  FiList,
  FiRotateCcw,
  FiChevronDown,
} from 'react-icons/fi';
import { useTaskContext } from '../../context/TaskContext';
import './TaskFilter.css';

export default function TaskFilter() {
  const {
    selectedStatus,
    setSelectedStatus,
    selectedPriority,
    setSelectedPriority,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    viewMode,
    setViewMode,
    resetFilters,
    searchQuery,
  } = useTaskContext();

  const statuses = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
  ];

  const hasActiveFilters =
    selectedStatus !== 'all' ||
    selectedPriority !== 'all' ||
    selectedCategory !== 'all' ||
    searchQuery !== '';

  return (
    <div className="task-filter-container">
      {/* Left: Status Pills */}
      <div className="status-tabs">
        {statuses.map((s) => (
          <button
            key={s.value}
            className={`status-tab ${selectedStatus === s.value ? 'active' : ''}`}
            onClick={() => setSelectedStatus(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Right: Dropdown Controls & View Toggle */}
      <div className="filter-controls">
        {/* Priority Filter */}
        <div className="select-wrapper">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="filter-select"
            aria-label="Filter by priority"
          >
            <option value="all">Priority: All</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="medium">🔵 Medium</option>
            <option value="low">⚪ Low</option>
          </select>
          <FiChevronDown className="select-arrow" />
        </div>

        {/* Category Filter */}
        <div className="select-wrapper">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
            aria-label="Filter by category"
          >
            <option value="all">Category: All</option>
            <option value="General">📁 General</option>
            <option value="Development">💻 Development</option>
            <option value="Design">🎨 Design</option>
            <option value="Feature">⚡ Feature</option>
            <option value="Analytics">📊 Analytics</option>
            <option value="Personal">👤 Personal</option>
          </select>
          <FiChevronDown className="select-arrow" />
        </div>

        {/* Sort By */}
        <div className="select-wrapper">
          <select
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [newSort, newOrder] = e.target.value.split('_');
              setSortBy(newSort);
              setSortOrder(newOrder);
            }}
            className="filter-select"
            aria-label="Sort tasks"
          >
            <option value="created_at_desc">Newest First</option>
            <option value="created_at_asc">Oldest First</option>
            <option value="due_date_asc">Due Date (Earliest)</option>
            <option value="title_asc">Title (A-Z)</option>
          </select>
          <FiChevronDown className="select-arrow" />
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button className="reset-btn" onClick={resetFilters} title="Reset all filters">
            <FiRotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}

        {/* View Mode Toggle */}
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <FiGrid size={16} />
          </button>
          <button
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="List/Table View"
          >
            <FiList size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
