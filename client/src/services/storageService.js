import { supabase } from '../utils/supabase';

// Size limits in bytes
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
export const MAX_PDF_SIZE = 5 * 1024 * 1024;   // 5 MB

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_PDF_TYPES = ['application/pdf'];

/**
 * Validates file type and size constraints (Max 2MB for Photos, Max 5MB for PDFs)
 * @param {File} file
 * @returns {{ valid: boolean, error?: string, type?: 'image' | 'pdf' }}
 */
export const validateAttachment = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isPdf = ALLOWED_PDF_TYPES.includes(file.type) || file.name?.toLowerCase().endsWith('.pdf');

  if (!isImage && !isPdf) {
    return {
      valid: false,
      error: 'Invalid file format. Only Photos (JPG, PNG, WebP, GIF) and PDF documents are allowed.',
    };
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `Photo exceeds the 2 MB limit (Selected: ${sizeInMb} MB). Please choose a smaller image.`,
    };
  }

  if (isPdf && file.size > MAX_PDF_SIZE) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `PDF document exceeds the 5 MB limit (Selected: ${sizeInMb} MB). Please choose a smaller PDF.`,
    };
  }

  return {
    valid: true,
    type: isPdf ? 'pdf' : 'image',
  };
};

/**
 * Uploads task attachment to Supabase Storage bucket ('task-attachments')
 * @param {File} file
 * @param {string} userId
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export const uploadTaskAttachment = async (file, userId) => {
  try {
    const validation = validateAttachment(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    if (!userId) {
      return { success: false, error: 'User must be authenticated to upload attachments.' };
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${userId}/${Date.now()}_${sanitizedName}`;

    const { data, error } = await supabase.storage
      .from('task-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      if (error.message?.includes('bucket not found') || error.error === 'Bucket not found') {
        return {
          success: false,
          error: 'Storage bucket "task-attachments" does not exist in Supabase. Please create it in your Supabase Dashboard.',
        };
      }
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('task-attachments')
      .getPublicUrl(filePath);

    return {
      success: true,
      data: {
        attachment_url: urlData?.publicUrl || '',
        attachment_name: file.name,
        attachment_type: validation.type,
        attachment_size: file.size,
        storage_path: filePath,
      },
    };
  } catch (err) {
    console.error('Storage upload error:', err);
    return {
      success: false,
      error: err.message || 'Failed to upload attachment to Supabase Storage.',
    };
  }
};

/**
 * Uploads a user profile picture (avatar) to Supabase Storage (Max 2MB)
 * @param {File} file
 * @param {string} userId
 * @returns {Promise<{ success: boolean, url?: string, error?: string }>}
 */
export const uploadAvatar = async (file, userId) => {
  try {
    if (!file) return { success: false, error: 'No image selected.' };
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { success: false, error: 'Only images (JPG, PNG, WebP, GIF) can be used as profile pictures.' };
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return { success: false, error: 'Profile picture must be smaller than 2 MB.' };
    }

    const ext = file.name.split('.').pop() || 'png';
    const filePath = `${userId}/avatar_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('task-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('task-attachments')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData?.publicUrl || '',
    };
  } catch (err) {
    console.error('Avatar upload error:', err);
    return {
      success: false,
      error: err.message || 'Failed to upload profile picture.',
    };
  }
};

/**
 * Format bytes to readable string (e.g. 1.25 MB or 340 KB)
 * @param {number} bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
