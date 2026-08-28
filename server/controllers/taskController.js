import { supabase as defaultSupabase } from '../config/supabase.js';

/**
 * Helper to get the active Supabase client (user-scoped if authenticated)
 */
const getClient = (req) => req.supabase || defaultSupabase;

/**
 * Get all tasks for authenticated user with optional search and filters
 * GET /api/tasks
 */
export const getAllTasks = async (req, res, next) => {
  try {
    const client = getClient(req);
    const userId = req.user.id;
    const { search, status, priority, category, sortBy = 'created_at', order = 'desc' } = req.query;

    let query = client
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply priority filter
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    // Apply category filter
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Apply search filter on title or description
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    const isAscending = order.toLowerCase() === 'asc';
    query = query.order(sortBy, { ascending: isAscending });

    const { data: tasks, error } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        hint: error.hint || 'Make sure tasks table exists and RLS policies are applied.',
      });
    }

    res.status(200).json({
      success: true,
      count: tasks?.length || 0,
      data: tasks || [],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single task by ID (only if owned by authenticated user)
 * GET /api/tasks/:id
 */
export const getTaskById = async (req, res, next) => {
  try {
    const client = getClient(req);
    const userId = req.user.id;
    const { id } = req.params;

    const { data: task, error } = await client
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !task) {
      return res.status(404).json({
        success: false,
        message: `Task with id ${id} not found or you do not have permission to view it`,
        error: error?.message,
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new task for the authenticated user (with optional attachment)
 * POST /api/tasks
 */
export const createTask = async (req, res, next) => {
  try {
    const client = getClient(req);
    const userId = req.user.id;
    const {
      title,
      description,
      status = 'pending',
      priority = 'medium',
      category = 'General',
      due_date,
      attachment_url,
      attachment_name,
      attachment_type,
      attachment_size,
    } = req.body;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    const newTask = {
      user_id: userId,
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'pending',
      priority: priority || 'medium',
      category: category || 'General',
      due_date: due_date || null,
      is_completed: status === 'completed',
      attachment_url: attachment_url || null,
      attachment_name: attachment_name || null,
      attachment_type: attachment_type || null,
      attachment_size: attachment_size || null,
    };

    const { data, error } = await client
      .from('tasks')
      .insert([newTask])
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: data[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing task belonging to the authenticated user
 * PUT /api/tasks/:id
 */
export const updateTask = async (req, res, next) => {
  try {
    const client = getClient(req);
    const userId = req.user.id;
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      category,
      due_date,
      is_completed,
      attachment_url,
      attachment_name,
      attachment_type,
      attachment_size,
    } = req.body;

    const updatePayload = {};

    if (title !== undefined) updatePayload.title = title.trim();
    if (description !== undefined) updatePayload.description = description ? description.trim() : '';
    if (status !== undefined) {
      updatePayload.status = status;
      updatePayload.is_completed = status === 'completed';
    }
    if (priority !== undefined) updatePayload.priority = priority;
    if (category !== undefined) updatePayload.category = category;
    if (due_date !== undefined) updatePayload.due_date = due_date || null;
    if (is_completed !== undefined) {
      updatePayload.is_completed = is_completed;
      if (is_completed && status === undefined) {
        updatePayload.status = 'completed';
      } else if (!is_completed && status === 'completed') {
        updatePayload.status = 'pending';
      }
    }
    if (attachment_url !== undefined) updatePayload.attachment_url = attachment_url;
    if (attachment_name !== undefined) updatePayload.attachment_name = attachment_name;
    if (attachment_type !== undefined) updatePayload.attachment_type = attachment_type;
    if (attachment_size !== undefined) updatePayload.attachment_size = attachment_size;

    const { data, error } = await client
      .from('tasks')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Task with id ${id} not found or you do not have permission to edit it`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: data[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Toggle task completion status for user's task
 * PATCH /api/tasks/:id/toggle
 */
export const toggleTaskStatus = async (req, res, next) => {
  try {
    const client = getClient(req);
    const userId = req.user.id;
    const { id } = req.params;

    // Fetch current status ensuring task belongs to current user
    const { data: currentTask, error: fetchError } = await client
      .from('tasks')
      .select('status, is_completed')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !currentTask) {
      return res.status(404).json({
        success: false,
        message: `Task with id ${id} not found or permission denied`,
      });
    }

    const newCompleted = !currentTask.is_completed;
    const newStatus = newCompleted ? 'completed' : 'pending';

    const { data, error: updateError } = await client
      .from('tasks')
      .update({
        is_completed: newCompleted,
        status: newStatus,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (updateError) {
      return res.status(400).json({
        success: false,
        message: updateError.message,
      });
    }

    res.status(200).json({
      success: true,
      message: `Task marked as ${newStatus}`,
      data: data[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a task belonging to user
 * DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res, next) => {
  try {
    const client = getClient(req);
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await client
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Task with id ${id} not found or permission denied`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: data[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get task analytics and statistics for user
 * GET /api/tasks/stats
 */
export const getTaskStats = async (req, res, next) => {
  try {
    const client = getClient(req);
    const userId = req.user.id;
    const { data: tasks, error } = await client
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const total = tasks?.length || 0;
    const completed = tasks?.filter((t) => t.is_completed || t.status === 'completed').length || 0;
    const inProgress = tasks?.filter((t) => t.status === 'in_progress').length || 0;
    const pending = tasks?.filter((t) => t.status === 'pending' && !t.is_completed).length || 0;
    const urgent = tasks?.filter((t) => t.priority === 'urgent' && !t.is_completed).length || 0;
    const high = tasks?.filter((t) => t.priority === 'high' && !t.is_completed).length || 0;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        total,
        completed,
        inProgress,
        pending,
        urgent,
        high,
        completionRate,
      },
    });
  } catch (err) {
    next(err);
  }
};
