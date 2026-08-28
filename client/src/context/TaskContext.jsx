import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { taskApi } from '../services/api';
import { supabase } from '../utils/supabase';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
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

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await taskApi.getStats();
      if (response && response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.warn('Backend stats fetch failed, calculating locally if possible:', error.message);
    }
  }, []);

  // Fetch tasks with current filters
  const fetchTasks = useCallback(async () => {
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
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Fetch tasks error:', error);
      const errorMsg = error.response?.data?.message || error.message;

      if (errorMsg && (errorMsg.includes('schema cache') || errorMsg.includes('does not exist') || errorMsg.includes('PGRST205'))) {
        setIsDbReady(false);
      } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        setServerOnline(false);
        // Direct Supabase fallback
        try {
          const { data, error: sbErr } = await supabase.from('tasks').select('*');
          if (sbErr) {
            if (sbErr.code === 'PGRST205' || sbErr.message?.includes('schema cache')) {
              setIsDbReady(false);
            }
          } else if (data) {
            setTasks(data);
            setIsDbReady(true);
          }
        } catch (e) {
          console.warn('Supabase fallback error:', e);
        }
      }
    } finally {
      setLoading(false);
      fetchStats();
    }
  }, [searchQuery, selectedStatus, selectedPriority, selectedCategory, sortBy, sortOrder, fetchStats]);

  // Initial load
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create Task
  const addTask = async (taskData) => {
    try {
      const response = await taskApi.createTask(taskData);
      if (response && response.success) {
        toast.success('Task created successfully! 🎉');
        await fetchTasks();
        return true;
      }
      return false;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create task';
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
      const msg = error.response?.data?.message || 'Failed to update task';
      toast.error(`Error: ${msg}`);
      return false;
    }
  };

  // Quick toggle status
  const toggleTask = async (id) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const nextCompleted = !t.is_completed;
            return {
              ...t,
              is_completed: nextCompleted,
              status: nextCompleted ? 'completed' : 'pending',
            };
          }
          return t;
        })
      );

      const response = await taskApi.toggleTaskStatus(id);
      if (response && response.success) {
        const statusText = response.data?.is_completed ? 'completed' : 'pending';
        toast.info(`Task marked as ${statusText}!`);
        fetchStats();
      }
    } catch (error) {
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
