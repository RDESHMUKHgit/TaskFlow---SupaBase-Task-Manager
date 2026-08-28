import React, { useState } from 'react';
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';
import { useTaskContext } from '../../context/TaskContext';
import './ConfirmModal.css';

export default function ConfirmModal() {
  const { isDeleteModalOpen, taskToDelete, closeDeleteModal, removeTask } = useTaskContext();
  const [deleting, setDeleting] = useState(false);

  if (!isDeleteModalOpen || !taskToDelete) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    await removeTask(taskToDelete.id);
    setDeleting(false);
    closeDeleteModal();
  };

  return (
    <div className="modal-backdrop" onClick={closeDeleteModal}>
      <div
        className="delete-modal-content glass-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="delete-icon-wrapper">
          <FiAlertTriangle size={28} />
        </div>

        <h3 className="delete-title">Delete Task?</h3>
        <p className="delete-message">
          Are you sure you want to permanently delete <strong>"{taskToDelete.title}"</strong>? This action cannot be undone.
        </p>

        <div className="delete-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={closeDeleteModal}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirm}
            disabled={deleting}
          >
            <FiTrash2 size={16} />
            <span>{deleting ? 'Deleting...' : 'Yes, Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
