import React from 'react';
import { FiPlus, FiCheckCircle } from 'react-icons/fi';
import StatsCard from '../../components/StatsCard/StatsCard';
import TaskFilter from '../../components/TaskFilter/TaskFilter';
import TaskList from '../../components/TaskList/TaskList';
import SupabaseGuide from '../../components/SupabaseGuide/SupabaseGuide';
import { useTaskContext } from '../../context/TaskContext';
import './Dashboard.css';

export default function Dashboard() {
  const { stats, openCreateModal } = useTaskContext();

  // Get current formatted date
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="dashboard-page animate-fade-in">
      {/* Welcome Banner */}
      <div className="dashboard-hero glass-card">
        <div className="hero-content">
          <span className="hero-date">{todayFormatted}</span>
          <h1 className="hero-title">Welcome back! 👋</h1>
          <p className="hero-subtitle">
            Here is a snapshot of your tasks. You've completed <strong>{stats.completed || 0}</strong> of <strong>{stats.total || 0}</strong> tasks.
          </p>

          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-header">
              <span>Overall Completion</span>
              <span className="progress-percentage">{stats.completionRate || 0}%</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${stats.completionRate || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="hero-action">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <FiPlus size={18} />
            <span>Create New Task</span>
          </button>
        </div>
      </div>

      {/* Supabase schema helper if table missing */}
      <SupabaseGuide />

      {/* Metrics Stats Grid */}
      <StatsCard />

      {/* Main Task List Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Recent Tasks</h2>
        </div>

        <TaskFilter />
        <TaskList />
      </div>
    </div>
  );
}
