import React from 'react';
import {
  FiPieChart,
  FiCheckCircle,
  FiClock,
  FiActivity,
  FiAlertTriangle,
  FiTrendingUp,
} from 'react-icons/fi';
import { useTaskContext } from '../../context/TaskContext';
import './Analytics.css';

export default function Analytics() {
  const { tasks, stats } = useTaskContext();

  // Compute breakdown by priority
  const urgentCount = tasks.filter((t) => t.priority === 'urgent').length;
  const highCount = tasks.filter((t) => t.priority === 'high').length;
  const mediumCount = tasks.filter((t) => t.priority === 'medium').length;
  const lowCount = tasks.filter((t) => t.priority === 'low').length;

  // Compute breakdown by category
  const categories = ['General', 'Development', 'Design', 'Feature', 'Analytics', 'Personal'];
  const categoryCounts = categories.map((cat) => ({
    name: cat,
    count: tasks.filter((t) => t.category === cat).length,
    completed: tasks.filter((t) => t.category === cat && (t.is_completed || t.status === 'completed')).length,
  }));

  const total = tasks.length || 1; // Avoid divide by zero

  return (
    <div className="analytics-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FiPieChart className="page-title-icon" />
            <span>Task Analytics & Insights</span>
          </h1>
          <p className="page-subtitle">
            Visual statistics, category distribution, and completion rates.
          </p>
        </div>
      </div>

      {/* Hero Overview */}
      <div className="analytics-hero glass-card">
        <div className="completion-ring-section">
          <div className="rate-number">{stats.completionRate || 0}%</div>
          <div className="rate-label">Completion Rate</div>
        </div>

        <div className="hero-stats-summary">
          <div className="summary-stat-item">
            <span className="summary-stat-num">{stats.total || 0}</span>
            <span className="summary-stat-text">Total Tasks</span>
          </div>
          <div className="summary-stat-item">
            <span className="summary-stat-num text-emerald">{stats.completed || 0}</span>
            <span className="summary-stat-text">Completed</span>
          </div>
          <div className="summary-stat-item">
            <span className="summary-stat-num text-blue">{stats.inProgress || 0}</span>
            <span className="summary-stat-text">In Progress</span>
          </div>
          <div className="summary-stat-item">
            <span className="summary-stat-num text-amber">{stats.pending || 0}</span>
            <span className="summary-stat-text">Pending</span>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Priority Breakdown Card */}
        <div className="analytics-card glass-card">
          <h3 className="card-heading">Tasks by Priority</h3>
          <div className="bar-group">
            <div className="bar-item">
              <div className="bar-label">
                <span>🔴 Urgent</span>
                <span>{urgentCount} ({Math.round((urgentCount / total) * 100)}%)</span>
              </div>
              <div className="meter-bg">
                <div
                  className="meter-fill meter-urgent"
                  style={{ width: `${(urgentCount / total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bar-item">
              <div className="bar-label">
                <span>🟠 High</span>
                <span>{highCount} ({Math.round((highCount / total) * 100)}%)</span>
              </div>
              <div className="meter-bg">
                <div
                  className="meter-fill meter-high"
                  style={{ width: `${(highCount / total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bar-item">
              <div className="bar-label">
                <span>🔵 Medium</span>
                <span>{mediumCount} ({Math.round((mediumCount / total) * 100)}%)</span>
              </div>
              <div className="meter-bg">
                <div
                  className="meter-fill meter-medium"
                  style={{ width: `${(mediumCount / total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bar-item">
              <div className="bar-label">
                <span>⚪ Low</span>
                <span>{lowCount} ({Math.round((lowCount / total) * 100)}%)</span>
              </div>
              <div className="meter-bg">
                <div
                  className="meter-fill meter-low"
                  style={{ width: `${(lowCount / total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown Card */}
        <div className="analytics-card glass-card">
          <h3 className="card-heading">Tasks by Category</h3>
          <div className="category-list">
            {categoryCounts.map((cat) => (
              <div key={cat.name} className="category-item">
                <div className="cat-header">
                  <span className="cat-name">{cat.name}</span>
                  <span className="cat-count">
                    {cat.completed}/{cat.count} done
                  </span>
                </div>
                <div className="meter-bg">
                  <div
                    className="meter-fill meter-category"
                    style={{
                      width: cat.count > 0 ? `${(cat.completed / cat.count) * 100}%` : '0%',
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
