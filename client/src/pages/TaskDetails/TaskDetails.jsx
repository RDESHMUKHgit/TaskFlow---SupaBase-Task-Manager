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
  FiPaperclip,
  FiExternalLink,
  FiDownload,
  FiFileText,
  FiImage,
} from 'react-icons/fi';
import { taskApi } from '../../services/api';
import { useTaskContext } from '../../context/TaskContext';
import { formatDate } from '../../utils/dateFormatter';
import { formatFileSize } from '../../services/storageService';
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
  const hasAttachment = Boolean(task.attachment_url);
  const isImage = task.attachment_type === 'image';
  const isPdf = task.attachment_type === 'pdf';

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

        {/* Dedicated Attachment Section */}
        {hasAttachment && (
          <div className="details-attachment-section">
            <div className="attachment-section-header">
              <h3 className="section-subtitle">
                <FiPaperclip size={14} /> Attachment
              </h3>
              {task.attachment_size && (
                <span className="attachment-size-badge">
                  {formatFileSize(task.attachment_size)}
                </span>
              )}
            </div>

            {isImage && (
              <div className="details-image-container glass-card">
                <div className="image-preview-large-wrapper">
                  <a
                    href={task.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Click to view full image"
                  >
                    <img
                      src={task.attachment_url}
                      alt={task.attachment_name || 'Task Attachment'}
                      className="details-image-preview"
                    />
                  </a>
                </div>

                <div className="details-attachment-footer">
                  <div className="attachment-meta">
                    <span className="attachment-file-name">
                      <FiImage size={14} /> {task.attachment_name || 'Attached Photo'}
                    </span>
                  </div>
                  <a
                    href={task.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <FiExternalLink size={14} />
                    <span>Open Full Image</span>
                  </a>
                </div>
              </div>
            )}

            {isPdf && (
              <div className="details-pdf-container glass-card">
                <div className="pdf-details-header">
                  <div className="pdf-big-icon">
                    <FiFileText size={32} />
                  </div>
                  <div className="pdf-details-info">
                    <h4 className="pdf-filename">{task.attachment_name || 'Document.pdf'}</h4>
                    <span className="pdf-type-label">
                      Adobe PDF Document • {formatFileSize(task.attachment_size)}
                    </span>
                  </div>
                </div>

                <div className="pdf-details-actions">
                  <a
                    href={task.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <FiExternalLink size={16} />
                    <span>Open / View PDF</span>
                  </a>
                  <a
                    href={task.attachment_url}
                    download={task.attachment_name || 'document.pdf'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    <FiDownload size={16} />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

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
