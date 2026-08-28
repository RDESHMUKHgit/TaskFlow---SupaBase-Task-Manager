import React from 'react';
import { FiPlus, FiList } from 'react-icons/fi';
import TaskFilter from '../../components/TaskFilter/TaskFilter';
import TaskList from '../../components/TaskList/TaskList';
import SupabaseGuide from '../../components/SupabaseGuide/SupabaseGuide';
import { useTaskContext } from '../../context/TaskContext';
import './AllTasks.css';

export default function AllTasks() {
  const { tasks, openCreateModal, selectedStatus, selectedCategory, selectedPriority } = useTaskContext();

  const getFilterDescription = () => {
    const parts = [];
    if (selectedStatus !== 'all') parts.push(`Status: ${selectedStatus.replace('_', ' ')}`);
    if (selectedPriority !== 'all') parts.push(`Priority: ${selectedPriority}`);
    if (selectedCategory !== 'all') parts.push(`Category: ${selectedCategory}`);
    return parts.length > 0 ? `Filtered by ${parts.join(', ')}` : 'Showing all tasks';
  };

  return (
    <div className="all-tasks-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FiList className="page-title-icon" />
            <span>Task Management</span>
          </h1>
          <p className="page-subtitle">
            {getFilterDescription()} ({tasks.length} total)
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal}>
          <FiPlus size={18} />
          <span>Add Task</span>
        </button>
      </div>

      <SupabaseGuide />

      <TaskFilter />

      <TaskList />
    </div>
  );
}
