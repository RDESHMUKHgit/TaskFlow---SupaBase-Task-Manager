import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCheckCircle,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiCalendar,
  FiTag,
  FiCheck,
} from 'react-icons/fi';
import TaskCard from '../TaskCard/TaskCard';
import { useTaskContext } from '../../context/TaskContext';
import { formatDate } from '../../utils/dateFormatter';
import './TaskList.css';

export default function TaskList() {
  const {
    tasks,
    loading,
    viewMode,
    openCreateModal,
    toggleTask,
    openEditModal,
    confirmDelete,
  } = useTaskContext();
  const navigate = useNavigate();

  // Skeleton loading state
  if (loading) {
    return (
      <div className="task-grid-container">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="skeleton-card glass-card">
            <div className="skeleton skeleton-tag"></div>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-desc"></div>
            <div className="skeleton skeleton-footer"></div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!tasks || tasks.length === 0) {
    return (
      <div className="empty-state glass-card">
        <div className="empty-icon">
          <FiCheckCircle />
        </div>
        <h3 className="empty-title">No tasks found</h3>
        <p className="empty-description">
          You don't have any tasks matching the current criteria. Start by adding a new one!
        </p>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <FiPlus size={16} />
          <span>Create Task</span>
        </button>
      </div>
    );
  }

  // Table / List View
  if (viewMode === 'table') {
    return (
      <div className="table-responsive glass-card">
        <table className="task-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>Done</th>
              <th>Task</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due Date</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const isCompleted = task.is_completed || task.status === 'completed';
              return (
                <tr key={task.id} className={isCompleted ? 'row-completed' : ''}>
                  <td>
                    <button
                      className={`task-checkbox ${isCompleted ? 'checked' : ''}`}
                      onClick={() => toggleTask(task.id)}
                    >
                      {isCompleted && <FiCheck size={12} />}
                    </button>
                  </td>
                  <td>
                    <div
                      className="table-task-title"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="table-task-desc">{task.description}</div>
                    )}
                  </td>
                  <td>
                    <span className="category-badge">
                      <FiTag size={11} />
                      {task.category || 'General'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge priority-${task.priority || 'medium'}`}>
                      {task.priority || 'medium'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${task.status || 'pending'}`}>
                      {task.status?.replace('_', ' ') || 'pending'}
                    </span>
                  </td>
                  <td className="table-due-date">
                    <FiCalendar size={12} />
                    <span>{formatDate(task.due_date)}</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-icon"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        title="View Details"
                      >
                        <FiExternalLink size={14} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => openEditModal(task)}
                        title="Edit Task"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        className="btn-icon danger"
                        onClick={() => confirmDelete(task)}
                        title="Delete Task"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div className="task-grid-container animate-fade-in">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
