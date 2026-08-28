import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCheck,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiTag,
  FiExternalLink,
  FiPaperclip,
  FiFileText,
  FiImage,
} from 'react-icons/fi';
import { useTaskContext } from '../../context/TaskContext';
import { formatDate, isOverdue, isToday } from '../../utils/dateFormatter';
import './TaskCard.css';

export default function TaskCard({ task }) {
  const { toggleTask, openEditModal, confirmDelete } = useTaskContext();
  const navigate = useNavigate();

  const isCompleted = task.is_completed || task.status === 'completed';
  const overdue = !isCompleted && isOverdue(task.due_date);
  const dueToday = !isCompleted && isToday(task.due_date);

  const hasAttachment = Boolean(task.attachment_url);
  const isImage = task.attachment_type === 'image';
  const isPdf = task.attachment_type === 'pdf';

  return (
    <div className={`task-card glass-card ${isCompleted ? 'completed' : ''} priority-border-${task.priority}`}>
      {/* Top Header: Category & Priority */}
      <div className="card-top">
        <div className="category-badge">
          <FiTag size={12} />
          <span>{task.category || 'General'}</span>
        </div>
        <span className={`badge priority-${task.priority || 'medium'}`}>
          {task.priority || 'medium'}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="card-main">
        {/* Custom Toggle Checkbox */}
        <button
          className={`task-checkbox ${isCompleted ? 'checked' : ''}`}
          onClick={() => toggleTask(task.id)}
          title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
        >
          {isCompleted && <FiCheck size={14} />}
        </button>

        <div className="task-info">
          <h3
            className="task-title"
            onClick={() => navigate(`/tasks/${task.id}`)}
            title="Click to view details"
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          {/* Attachment Preview Chip */}
          {hasAttachment && (
            <div
              className="card-attachment-chip"
              onClick={(e) => {
                e.stopPropagation();
                window.open(task.attachment_url, '_blank', 'noopener,noreferrer');
              }}
              title={`View ${isPdf ? 'PDF' : 'Photo'}: ${task.attachment_name || 'Attachment'}`}
            >
              {isImage ? (
                <>
                  <img
                    src={task.attachment_url}
                    alt={task.attachment_name || 'Attachment'}
                    className="card-attachment-thumb"
                  />
                  <span className="card-attachment-label">
                    <FiImage size={11} /> {task.attachment_name || 'Photo'}
                  </span>
                </>
              ) : (
                <>
                  <div className="card-pdf-icon">
                    <FiFileText size={13} />
                  </div>
                  <span className="card-attachment-label">
                    {task.attachment_name || 'PDF Document'}
                  </span>
                </>
              )}
              <FiExternalLink size={11} className="chip-external-icon" />
            </div>
          )}
        </div>
      </div>

      {/* Footer: Due date & Action buttons */}
      <div className="card-footer">
        <div className={`due-date ${!task.due_date ? 'no-date' : ''} ${overdue ? 'overdue' : ''} ${dueToday ? 'today' : ''}`}>
          <FiCalendar size={13} />
          <span>
            {overdue && '⚠️ '}
            {dueToday && '⚡ '}
            {formatDate(task.due_date)}
          </span>
        </div>

        <div className="card-actions">
          <button
            className="btn-icon"
            onClick={() => navigate(`/tasks/${task.id}`)}
            title="View Details"
          >
            <FiExternalLink size={15} />
          </button>
          <button
            className="btn-icon"
            onClick={() => openEditModal(task)}
            title="Edit Task"
          >
            <FiEdit2 size={15} />
          </button>
          <button
            className="btn-icon danger"
            onClick={() => confirmDelete(task)}
            title="Delete Task"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
