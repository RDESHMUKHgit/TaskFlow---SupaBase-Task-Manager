import { supabase } from '../config/supabase.js';

/**
 * Get all tasks with optional search and filters
 * GET /api/tasks
 */
export const getAllTasks = async (req, res, next) => {
  try {
    const { search, status, priority, category, sortBy = 'created_at', order = 'desc' } = req.query;

    let query = supabase.from('tasks').select('*');

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

    // Check for Supabase errors
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        hint: error.hint || 'Make sure tasks table exists in Supabase.'
      });
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single task by ID
 * GET /api/tasks/:id
 */
export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: `Task with id ${id} not found`,
        error: error.message,
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
 * Create a new task
 * POST /api/tasks
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status = 'pending', priority = 'medium', category = 'General', due_date } = req.body;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    const newTask = {
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'pending',
      priority: priority || 'medium',
      category: category || 'General',
      due_date: due_date || null,
      is_completed: status === 'completed',
    };

    const { data, error } = await supabase
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
 * Update an existing task
 * PUT /api/tasks/:id
 */
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, category, due_date, is_completed } = req.body;

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

    const { data, error } = await supabase
      .from('tasks')
      .update(updatePayload)
      .eq('id', id)
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
        message: `Task with id ${id} not found`,
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
 * Toggle task completion status
 * PATCH /api/tasks/:id/toggle
 */
export const toggleTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    // First fetch current status
    const { data: currentTask, error: fetchError } = await supabase
      .from('tasks')
      .select('status, is_completed')
      .eq('id', id)
      .single();

    if (fetchError || !currentTask) {
      return res.status(404).json({
        success: false,
        message: `Task with id ${id} not found`,
      });
    }

    const newCompleted = !currentTask.is_completed;
    const newStatus = newCompleted ? 'completed' : 'pending';

    const { data, error: updateError } = await supabase
      .from('tasks')
      .update({
        is_completed: newCompleted,
        status: newStatus,
      })
      .eq('id', id)
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
 * Delete a task
 * DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
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
        message: `Task with id ${id} not found`,
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
 * Get task analytics and statistics
 * GET /api/tasks/stats
 */
export const getTaskStats = async (req, res, next) => {
  try {
    const { data: tasks, error } = await supabase.from('tasks').select('*');

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const total = tasks.length;
    const completed = tasks.filter((t) => t.is_completed || t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const pending = tasks.filter((t) => t.status === 'pending' && !t.is_completed).length;
    const urgent = tasks.filter((t) => t.priority === 'urgent' && !t.is_completed).length;
    const high = tasks.filter((t) => t.priority === 'high' && !t.is_completed).length;

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
