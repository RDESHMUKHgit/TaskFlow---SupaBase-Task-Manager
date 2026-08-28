import express from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  toggleTaskStatus,
  deleteTask,
  getTaskStats,
} from '../controllers/taskController.js';

const router = express.Router();

// Stats route (must come before /:id)
router.get('/stats', getTaskStats);

// Base CRUD routes
router.get('/', getAllTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.patch('/:id/toggle', toggleTaskStatus);
router.delete('/:id', deleteTask);

export default router;
