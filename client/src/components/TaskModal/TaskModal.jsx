import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiCalendar, FiTag, FiFlag, FiLayers } from 'react-icons/fi';
import { useTaskContext } from '../../context/TaskContext';
import './TaskModal.css';

export default function TaskModal() {
  const { isModalOpen, editingTask, closeModal, addTask, editTask } = useTaskContext();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    category: 'General',
    due_date: '',
  });

  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync form data when editingTask changes
  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        status: editingTask.status || 'pending',
        priority: editingTask.priority || 'medium',
        category: editingTask.category || 'General',
        due_date: editingTask.due_date ? editingTask.due_date.split('T')[0] : '',
      });
    } else {
      // Default reset for new task
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        category: 'General',
        due_date: new Date().toISOString().split('T')[0],
      });
    }
    setValidationError('');
  }, [editingTask, isModalOpen]);

  if (!isModalOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'title' && value.trim()) {
      setValidationError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      setValidationError('Please enter a task title');
      return;
    }

    setSubmitting(true);
    let success = false;

    if (editingTask) {
      success = await editTask(editingTask.id, formData);
    } else {
      success = await addTask(formData);
    }

    setSubmitting(false);
    if (success) {
      closeModal();
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div
        className="modal-content glass-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button className="btn-icon" onClick={closeModal} title="Close modal">
            <FiX size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Title Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Task Title <span className="required-star">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Design Landing Page wireframe"
              className={`form-input ${validationError ? 'input-error' : ''}`}
              autoFocus
            />
            {validationError && (
              <span className="error-message">{validationError}</span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-description">
              Description
            </label>
            <textarea
              id="task-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add key notes, links, or specifications..."
              className="form-textarea"
              rows={3}
            />
          </div>

          {/* Row: Status & Priority */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="task-status">
                <FiLayers size={13} /> Status
              </label>
              <select
                id="task-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">
                <FiFlag size={13} /> Priority
              </label>
              <select
                id="task-priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Row: Category & Due Date */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="task-category">
                <FiTag size={13} /> Category
              </label>
              <select
                id="task-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
              >
                <option value="General">General</option>
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Feature">Feature</option>
                <option value="Analytics">Analytics</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-due-date">
                <FiCalendar size={13} /> Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeModal}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              <FiCheck size={16} />
              <span>{submitting ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
