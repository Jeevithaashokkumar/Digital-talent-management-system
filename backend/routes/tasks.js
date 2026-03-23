const express = require('express');
const router = express.Router();
const { 
  createTask, 
  getAllTasks,
  getTaskById,
  getMyTasks, 
  updateTask,
  updateTaskStatus,
  deleteTask, 
  getAnalytics,
  createSubTask, 
  toggleSubTask, 
  deleteSubTask 
} = require('../controllers/taskController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Task CRUD
router.post('/', verifyToken, isAdmin, createTask);
router.get('/', verifyToken, getAllTasks);
router.get('/all', verifyToken, getAllTasks);
router.get('/my', verifyToken, getMyTasks);
router.get('/analytics', verifyToken, getAnalytics);
router.get('/:id', verifyToken, getTaskById);
router.put('/:id', verifyToken, isAdmin, updateTask);
router.patch('/:id/status', verifyToken, updateTaskStatus);
router.delete('/:id', verifyToken, isAdmin, deleteTask);

// Subtask Routes
router.post('/:taskId/subtasks', verifyToken, createSubTask);
router.put('/subtasks/:subTaskId', verifyToken, toggleSubTask);
router.delete('/subtasks/:subTaskId', verifyToken, deleteSubTask);

module.exports = router;
