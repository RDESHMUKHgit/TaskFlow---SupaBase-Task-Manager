import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiTag,
  FiFlag,
  FiLayers,
} from 'react-icons/fi';
import { taskApi } from '../../services/api';
import { useTaskContext } from '../../context/TaskContext';
import { formatDate } from '../../utils/dateFormatter';
import './TaskDetails.css';

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleTask, openEditModal, confirmDelete } = useTaskContext();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      const res = await taskApi.getTaskById(id);
      if (res && res.success) {
        setTask(res.data);
      } else {
        setError('Task not found');
      }
    } catch (err) {
      console.error('Failed to fetch task:', err);
      setError(err.response?.data?.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const handleToggle = async () => {
    if (!task) return;
    await toggleTask(task.id);
    fetchTaskDetails();
  };

  const handleDelete = () => {
    if (!task) return;
    confirmDelete(task);
  };

  if (loading) {
    return (
      <div className="task-details-loading glass-card">
        <p>Loading task details...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="task-details-error glass-card">
        <h2>Task Not Found</h2>
        <p>{error || 'The requested task does not exist or was deleted.'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/tasks')}>
          <FiArrowLeft size={16} />
          <span>Back to All Tasks</span>
        </button>
      </div>
    );
  }

  const isCompleted = task.is_completed || task.status === 'completed';

  return (
    <div className="task-details-page animate-fade-in">
      {/* Back Button */}
      <button className="back-link" onClick={() => navigate('/tasks')}>
        <FiArrowLeft size={16} />
        <span>Back to Tasks</span>
      </button>

      <div className="details-card glass-card">
        {/* Header Badges */}
        <div className="details-top">
          <div className="badge-group">
            <span className="category-badge">
              <FiTag size={12} />
              {task.category || 'General'}
            </span>
            <span className={`badge priority-${task.priority || 'medium'}`}>
              <FiFlag size={12} />
              {task.priority || 'medium'}
            </span>
            <span className={`badge badge-${task.status || 'pending'}`}>
              <FiLayers size={12} />
              {task.status?.replace('_', ' ') || 'pending'}
            </span>
          </div>

          <div className="details-actions">
            <button
              className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleToggle}
            >
              <FiCheckCircle size={16} />
              <span>{isCompleted ? 'Mark Pending' : 'Mark Complete'}</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => openEditModal(task)}
            >
              <FiEdit2 size={16} />
              <span>Edit</span>
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              <FiTrash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Task Title & Description */}
        <h1 className={`details-title ${isCompleted ? 'completed-text' : ''}`}>
          {task.title}
        </h1>

        <div className="details-section">
          <h3 className="section-subtitle">Description</h3>
          <p className="details-description">
            {task.description || 'No description provided for this task.'}
          </p>
        </div>

        {/* Metadata Grid */}
        <div className="metadata-grid">
          <div className="meta-item">
            <div className="meta-label">
              <FiCalendar size={14} /> Due Date
            </div>
            <div className="meta-value">{formatDate(task.due_date)}</div>
          </div>

          <div className="meta-item">
            <div className="meta-label">
              <FiClock size={14} /> Created At
            </div>
            <div className="meta-value">{formatDate(task.created_at)}</div>
          </div>

          <div className="meta-item">
            <div className="meta-label">
              <FiClock size={14} /> Last Updated
            </div>
            <div className="meta-value">{formatDate(task.updated_at)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
