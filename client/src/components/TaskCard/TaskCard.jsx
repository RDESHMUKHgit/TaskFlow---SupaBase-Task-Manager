import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCheck,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiTag,
  FiClock,
  FiExternalLink,
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
        </div>
      </div>

      {/* Footer: Due date & Action buttons */}
      <div className="card-footer">
        <div className={`due-date ${overdue ? 'overdue' : ''} ${dueToday ? 'today' : ''}`}>
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
