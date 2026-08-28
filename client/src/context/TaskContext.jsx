import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { taskApi } from '../services/api';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    urgent: 0,
    high: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isDbReady, setIsDbReady] = useState(true);
  const [serverOnline, setServerOnline] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Calculate stats locally from tasks if backend stats fail
  const calculateLocalStats = useCallback((taskList) => {
    const total = taskList.length;
    const completed = taskList.filter((t) => t.is_completed || t.status === 'completed').length;
    const inProgress = taskList.filter((t) => t.status === 'in_progress').length;
    const pending = taskList.filter((t) => t.status === 'pending' && !t.is_completed).length;
    const urgent = taskList.filter((t) => t.priority === 'urgent' && !t.is_completed).length;
    const high = taskList.filter((t) => t.priority === 'high' && !t.is_completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    setStats({
      total,
      completed,
      inProgress,
      pending,
      urgent,
      high,
      completionRate,
    });
  }, []);

  // Fetch stats from backend API
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      const response = await taskApi.getStats();
      if (response && response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.warn('Backend stats fetch failed, will use local calculation if needed:', error.message);
    }
  }, [isAuthenticated, user]);

  // Fetch tasks with current filters for the authenticated user
  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setTasks([]);
      setStats({
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        urgent: 0,
        high: 0,
        completionRate: 0,
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = {
        search: searchQuery || undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        priority: selectedPriority !== 'all' ? selectedPriority : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sortBy,
        order: sortOrder,
      };

      const response = await taskApi.getTasks(params);

      if (response && response.success) {
        setTasks(response.data || []);
        setIsDbReady(true);
        setServerOnline(true);
        calculateLocalStats(response.data || []);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Fetch tasks error:', error);
      const errorMsg = error.response?.data?.message || error.message;

      if (errorMsg && (errorMsg.includes('schema cache') || errorMsg.includes('does not exist') || errorMsg.includes('PGRST205'))) {
        setIsDbReady(false);
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        setServerOnline(false);
        // Direct Supabase fallback scoped to user_id
        try {
          let query = supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id);

          if (selectedStatus !== 'all') query = query.eq('status', selectedStatus);
          if (selectedPriority !== 'all') query = query.eq('priority', selectedPriority);
          if (selectedCategory !== 'all') query = query.eq('category', selectedCategory);
          if (searchQuery) query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
          
          query = query.order(sortBy, { ascending: sortOrder === 'asc' });

          const { data, error: sbErr } = await query;
          if (sbErr) {
            if (sbErr.code === 'PGRST205' || sbErr.message?.includes('schema cache')) {
              setIsDbReady(false);
            }
          } else if (data) {
            setTasks(data);
            setIsDbReady(true);
            calculateLocalStats(data);
          }
        } catch (e) {
          console.warn('Supabase fallback error:', e);
        }
      }
    } finally {
      setLoading(false);
      fetchStats();
    }
  }, [
    isAuthenticated,
    user,
    searchQuery,
    selectedStatus,
    selectedPriority,
    selectedCategory,
    sortBy,
    sortOrder,
    calculateLocalStats,
    fetchStats,
  ]);

  // Initial load when user changes or filters change
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create Task
  const addTask = async (taskData) => {
    try {
      const payload = {
        ...taskData,
        user_id: user?.id,
      };

      const response = await taskApi.createTask(payload);
      if (response && response.success) {
        toast.success('Task created successfully! 🎉');
        await fetchTasks();
        return true;
      }
      return false;
    } catch (error) {
      // Fallback directly to Supabase if API offline or timeout
      const isOfflineOrTimeout = !serverOnline || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.message?.includes('timeout');
      if (isOfflineOrTimeout && user) {
        try {
          const { data, error: sbErr } = await supabase
            .from('tasks')
            .insert([{ ...taskData, user_id: user.id }])
            .select();

          if (!sbErr && data) {
            toast.success('Task created successfully! 🎉');
            await fetchTasks();
            return true;
          }
        } catch (err) {
          console.error(err);
        }
      }

      const msg = error.response?.data?.message || (error.code === 'ECONNABORTED' ? 'Server is waking up. Please retry in a moment.' : 'Failed to create task');
      toast.error(`Error: ${msg}`);
      return false;
    }
  };

  // Update Task
  const editTask = async (id, taskData) => {
    try {
      const response = await taskApi.updateTask(id, taskData);
      if (response && response.success) {
        toast.success('Task updated successfully! ✏️');
        await fetchTasks();
        return true;
      }
      return false;
    } catch (error) {
      // Fallback directly to Supabase if API offline or timeout
      const isOfflineOrTimeout = !serverOnline || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.message?.includes('timeout');
      if (isOfflineOrTimeout && user) {
        try {
          const { data, error: sbErr } = await supabase
            .from('tasks')
            .update({ ...taskData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', user.id)
            .select();

          if (!sbErr && data) {
            toast.success('Task updated successfully! ✏️');
            await fetchTasks();
            return true;
          }
        } catch (err) {
          console.error(err);
        }
      }

      const msg = error.response?.data?.message || 'Failed to update task';
      toast.error(`Error: ${msg}`);
      return false;
    }
  };

  // Quick toggle status
  const toggleTask = async (id) => {
    const currentTask = tasks.find((t) => t.id === id);
    const nextCompleted = !currentTask?.is_completed;
    const nextStatus = nextCompleted ? 'completed' : 'pending';

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            is_completed: nextCompleted,
            status: nextStatus,
          };
        }
        return t;
      })
    );

    try {
      const response = await taskApi.toggleTaskStatus(id);
      if (response && response.success) {
        const statusText = response.data?.is_completed ? 'completed' : 'pending';
        toast.info(`Task marked as ${statusText}!`);
        fetchStats();
        return;
      }
    } catch (error) {
      // Fallback directly to Supabase
      if (user) {
        try {
          const { error: sbErr } = await supabase
            .from('tasks')
            .update({
              is_completed: nextCompleted,
              status: nextStatus,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', user.id);

          if (!sbErr) {
            toast.info(`Task marked as ${nextStatus}!`);
            calculateLocalStats(
              tasks.map((t) => (t.id === id ? { ...t, is_completed: nextCompleted, status: nextStatus } : t))
            );
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
      toast.error('Failed to update task status');
      fetchTasks(); // Revert on failure
    }
  };

  // Delete Task
  const removeTask = async (id) => {
    try {
      const response = await taskApi.deleteTask(id);
      if (response && response.success) {
        toast.success('Task deleted successfully! 🗑️');
        setTasks((prev) => prev.filter((t) => t.id !== id));
        fetchStats();
        return true;
      }
      return false;
    } catch (error) {
      // Fallback directly to Supabase
      if (user) {
        try {
          const { error: sbErr } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (!sbErr) {
            toast.success('Task deleted successfully! 🗑️');
            setTasks((prev) => prev.filter((t) => t.id !== id));
            calculateLocalStats(tasks.filter((t) => t.id !== id));
            return true;
          }
        } catch (e) {
          console.error(e);
        }
      }

      const msg = error.response?.data?.message || 'Failed to delete task';
      toast.error(`Error: ${msg}`);
      return false;
    }
  };

  // Modal Handlers
  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const confirmDelete = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setTaskToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSelectedCategory('all');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        stats,
        loading,
        isDbReady,
        serverOnline,
        searchQuery,
        setSearchQuery,
        selectedStatus,
        setSelectedStatus,
        selectedPriority,
        setSelectedPriority,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        viewMode,
        setViewMode,
        isModalOpen,
        editingTask,
        taskToDelete,
        isDeleteModalOpen,
        openCreateModal,
        openEditModal,
        closeModal,
        confirmDelete,
        closeDeleteModal,
        fetchTasks,
        fetchStats,
        addTask,
        editTask,
        toggleTask,
        removeTask,
        resetFilters,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
