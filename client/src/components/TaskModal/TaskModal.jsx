import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  FiX,
  FiCheck,
  FiCalendar,
  FiTag,
  FiFlag,
  FiLayers,
  FiUploadCloud,
  FiFileText,
  FiImage,
  FiTrash2,
  FiPaperclip,
  FiExternalLink,
  FiLoader,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useTaskContext } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import {
  validateAttachment,
  uploadTaskAttachment,
  formatFileSize,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_PDF_TYPES,
} from '../../services/storageService';
import './TaskModal.css';

export default function TaskModal() {
  const { isModalOpen, editingTask, closeModal, addTask, editTask } = useTaskContext();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    category: 'General',
    due_date: '',
  });

  // Attachment states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState(null); // 'image' | 'pdf'
  const [existingAttachment, setExistingAttachment] = useState(null);
  const [attachmentRemoved, setAttachmentRemoved] = useState(false);

  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Sync form data & attachments when editingTask changes
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

      if (editingTask.attachment_url) {
        setExistingAttachment({
          url: editingTask.attachment_url,
          name: editingTask.attachment_name || 'Attached File',
          type: editingTask.attachment_type || 'image',
          size: editingTask.attachment_size || 0,
        });
      } else {
        setExistingAttachment(null);
      }
    } else {
      // Default reset for new task
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        category: 'General',
        due_date: '',
      });
      setExistingAttachment(null);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setFileType(null);
    setAttachmentRemoved(false);
    setValidationError('');
    setUploadStatus('');
  }, [editingTask, isModalOpen]);

  // Clean up object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // React Dropzone file drop handler
  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections && fileRejections.length > 0) {
      const rejection = fileRejections[0];
      const errorMsg = rejection.errors?.[0]?.message || 'File upload rejected.';
      toast.error(`File rejected: ${errorMsg}`);
      return;
    }

    if (!acceptedFiles || acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const validation = validateAttachment(file);

    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Set valid file
    setSelectedFile(file);
    setFileType(validation.type);
    setAttachmentRemoved(false);

    if (validation.type === 'image') {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }

    toast.success(`Attached ${file.name} (${formatFileSize(file.size)})`);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB total dropzone ceiling
  });

  const handleRemoveSelectedFile = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileType(null);
  };

  const handleRemoveExistingAttachment = () => {
    setExistingAttachment(null);
    setAttachmentRemoved(true);
  };

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

    if (!formData.title.trim()) {
      setValidationError('Please enter a task title');
      return;
    }

    setSubmitting(true);
    let payload = {
      ...formData,
      due_date: formData.due_date ? formData.due_date : null,
    };

    // Handle File Upload to Supabase Storage if a new file is staged
    if (selectedFile && user?.id) {
      setUploadStatus('Uploading file to Supabase Storage...');
      const uploadResult = await uploadTaskAttachment(selectedFile, user.id);

      if (!uploadResult.success) {
        toast.error(uploadResult.error || 'Failed to upload attachment.');
        setSubmitting(false);
        setUploadStatus('');
        return;
      }

      payload.attachment_url = uploadResult.data.attachment_url;
      payload.attachment_name = uploadResult.data.attachment_name;
      payload.attachment_type = uploadResult.data.attachment_type;
      payload.attachment_size = uploadResult.data.attachment_size;
    } else if (attachmentRemoved) {
      payload.attachment_url = null;
      payload.attachment_name = null;
      payload.attachment_type = null;
      payload.attachment_size = null;
    }

    setUploadStatus('Saving task details...');
    let success = false;

    if (editingTask) {
      success = await editTask(editingTask.id, payload);
    } else {
      success = await addTask(payload);
    }

    setSubmitting(false);
    setUploadStatus('');

    if (success) {
      closeModal();
    }
  };

  const activeAttachment = selectedFile
    ? {
        name: selectedFile.name,
        size: selectedFile.size,
        type: fileType,
        preview: previewUrl,
        isNew: true,
      }
    : existingAttachment && !attachmentRemoved
    ? {
        name: existingAttachment.name,
        size: existingAttachment.size,
        type: existingAttachment.type,
        preview: existingAttachment.type === 'image' ? existingAttachment.url : null,
        url: existingAttachment.url,
        isNew: false,
      }
    : null;

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

          {/* Attachments Section using React Dropzone */}
          <div className="form-group attachment-section">
            <div className="label-with-badge">
              <label className="form-label">
                <FiPaperclip size={13} /> Attachment (Photo / PDF)
              </label>
              <div className="size-limits-pills">
                <span className="limit-pill photo">Max 2MB Photo</span>
                <span className="limit-pill pdf">Max 5MB PDF</span>
              </div>
            </div>

            {/* If there's an active attachment (New or Existing), show live preview */}
            {activeAttachment ? (
              <div className="attachment-preview-card glass-card">
                {activeAttachment.type === 'image' && (
                  <div className="image-preview-wrapper">
                    <img
                      src={activeAttachment.preview || activeAttachment.url}
                      alt={activeAttachment.name}
                      className="image-preview-thumbnail"
                    />
                    <div className="attachment-info">
                      <div className="file-type-tag image">
                        <FiImage size={12} /> Photo
                      </div>
                      <span className="attachment-filename" title={activeAttachment.name}>
                        {activeAttachment.name}
                      </span>
                      <span className="attachment-size">
                        {formatFileSize(activeAttachment.size)}
                        {activeAttachment.isNew && ' • Ready to upload'}
                      </span>
                    </div>
                  </div>
                )}

                {activeAttachment.type === 'pdf' && (
                  <div className="pdf-preview-wrapper">
                    <div className="pdf-icon-badge">
                      <FiFileText size={24} />
                    </div>
                    <div className="attachment-info">
                      <div className="file-type-tag pdf">
                        <FiFileText size={12} /> PDF Document
                      </div>
                      <span className="attachment-filename" title={activeAttachment.name}>
                        {activeAttachment.name}
                      </span>
                      <span className="attachment-size">
                        {formatFileSize(activeAttachment.size)}
                        {activeAttachment.isNew && ' • Ready to upload'}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="btn-remove-attachment"
                  onClick={
                    activeAttachment.isNew
                      ? handleRemoveSelectedFile
                      : handleRemoveExistingAttachment
                  }
                  title="Remove attachment"
                >
                  <FiTrash2 size={16} />
                  <span>Remove</span>
                </button>
              </div>
            ) : (
              /* React Dropzone Area */
              <div
                {...getRootProps()}
                className={`dropzone-box ${isDragActive ? 'drag-active' : ''} ${
                  isDragReject ? 'drag-reject' : ''
                }`}
              >
                <input {...getInputProps()} />
                <div className="dropzone-icon">
                  <FiUploadCloud size={28} />
                </div>
                <div className="dropzone-text">
                  {isDragActive ? (
                    <p className="dropzone-primary-text">Drop your Photo or PDF here...</p>
                  ) : (
                    <>
                      <p className="dropzone-primary-text">
                        <span>Drag & drop</span> a file here, or <span>browse</span>
                      </p>
                      <p className="dropzone-sub-text">
                        Supports JPG, PNG, WebP (≤ 2MB) and PDF documents (≤ 5MB)
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            {uploadStatus && (
              <div className="upload-status-indicator">
                <FiLoader className="spin" size={14} />
                <span>{uploadStatus}</span>
              </div>
            )}
            <div className="modal-footer-buttons">
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
                {submitting ? (
                  <>
                    <FiLoader className="spin" size={16} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiCheck size={16} />
                    <span>{editingTask ? 'Save Changes' : 'Create Task'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
