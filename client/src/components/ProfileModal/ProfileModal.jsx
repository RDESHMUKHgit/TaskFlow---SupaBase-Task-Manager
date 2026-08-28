import React, { useState, useEffect, useRef } from 'react';
import {
  FiX,
  FiCamera,
  FiUser,
  FiMail,
  FiCalendar,
  FiCheck,
  FiTrash2,
  FiShield,
  FiCopy,
  FiHardDrive,
  FiLoader,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useTaskContext } from '../../context/TaskContext';
import { uploadAvatar, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES, formatFileSize } from '../../services/storageService';
import { formatDate } from '../../utils/dateFormatter';
import './ProfileModal.css';

export default function ProfileModal() {
  const { user, profile, isProfileModalOpen, closeProfileModal, updateUserProfile } = useAuth();
  const { stats } = useTaskContext();

  const [fullName, setFullName] = useState('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarPreview(profile.avatar_url || null);
    }
    setSelectedAvatarFile(null);
    setRemoveAvatar(false);
  }, [profile, isProfileModalOpen]);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (!isProfileModalOpen || !user) return null;

  const displayName = fullName || profile?.full_name || user.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Only image formats (JPG, PNG, WebP, GIF) are allowed.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(`Photo exceeds 2 MB limit (Selected: ${formatFileSize(file.size)}).`);
      return;
    }

    setSelectedAvatarFile(file);
    setRemoveAvatar(false);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    toast.success('Photo ready to save! 📸');
  };

  const handleRemovePhoto = () => {
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setSelectedAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    toast.info('User ID copied to clipboard! 📋');
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }

    setSaving(true);
    let newAvatarUrl = profile?.avatar_url || '';

    // If new avatar file chosen, upload to storage
    if (selectedAvatarFile) {
      const uploadRes = await uploadAvatar(selectedAvatarFile, user.id);
      if (!uploadRes.success) {
        toast.error(uploadRes.error || 'Failed to upload profile picture.');
        setSaving(false);
        return;
      }
      newAvatarUrl = uploadRes.url;
    } else if (removeAvatar) {
      newAvatarUrl = '';
    }

    const updateRes = await updateUserProfile({
      fullName: fullName.trim(),
      avatarUrl: newAvatarUrl,
    });

    setSaving(false);

    if (updateRes.success) {
      toast.success('Profile updated successfully! ✨');
      closeProfileModal();
    } else {
      toast.error(updateRes.error || 'Failed to update profile.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeProfileModal}>
      <div
        className="modal-content profile-modal-content glass-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="modal-header">
          <div className="profile-modal-title-group">
            <h2 className="modal-title">User Profile Dashboard</h2>
            <span className="profile-badge-rls">
              <FiShield size={11} /> RLS Secured
            </span>
          </div>
          <button className="btn-icon" onClick={closeProfileModal} title="Close">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="profile-form">
          {/* Avatar Upload Section */}
          <div className="avatar-upload-container">
            <div
              className="avatar-large-wrapper"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload custom profile picture"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={displayName}
                  className="avatar-large-img"
                />
              ) : (
                <div className="avatar-large-placeholder">{initial}</div>
              )}
              <div className="avatar-hover-overlay">
                <FiCamera size={22} />
                <span>Change</span>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp, image/gif"
              style={{ display: 'none' }}
            />

            <div className="avatar-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <FiCamera size={14} />
                <span>{avatarPreview ? 'Upload New Photo' : 'Upload Photo'}</span>
              </button>

              {avatarPreview && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleRemovePhoto}
                  title="Remove custom photo"
                >
                  <FiTrash2 size={14} />
                  <span>Remove</span>
                </button>
              )}
            </div>
            <span className="avatar-hint">JPG, PNG, WebP or GIF (Max 2 MB)</span>
          </div>

          {/* Form Fields */}
          <div className="profile-fields-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="profile-fullname">
                <FiUser size={13} /> Full Name
              </label>
              <input
                id="profile-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiMail size={13} /> Email Address
              </label>
              <input
                type="email"
                value={user.email || ''}
                readOnly
                disabled
                className="form-input input-disabled"
              />
            </div>
          </div>

          {/* Account Metadata KPI Tiles */}
          <div className="profile-meta-section">
            <div className="profile-meta-card">
              <div className="meta-card-label">
                <FiCalendar size={12} /> Member Since
              </div>
              <div className="meta-card-value">
                {user.created_at ? formatDate(user.created_at) : 'Active'}
              </div>
            </div>

            <div className="profile-meta-card">
              <div className="meta-card-label">
                <FiHardDrive size={12} /> My Tasks
              </div>
              <div className="meta-card-value">{stats?.total || 0} Total</div>
            </div>

            <div className="profile-meta-card user-id-card">
              <div className="meta-card-label">
                <FiShield size={12} /> User UUID
              </div>
              <div className="user-id-row">
                <code className="user-id-code">{user.id.substring(0, 13)}...</code>
                <button
                  type="button"
                  className="btn-icon-xs"
                  onClick={handleCopyUserId}
                  title="Copy Full User ID"
                >
                  {copiedId ? <FiCheck size={13} color="#34d399" /> : <FiCopy size={13} />}
                </button>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeProfileModal}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <FiLoader className="spin" size={16} />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <FiCheck size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
