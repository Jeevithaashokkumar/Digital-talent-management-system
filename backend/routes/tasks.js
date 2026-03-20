const express = require('express');
const router = express.Router();
const { 
  createTask, 
  getAllTasks, 
  getMyTasks, 
  updateTask, 
  deleteTask, 
  getAnalytics,
  createSubTask, 
  toggleSubTask, 
  deleteSubTask 
} = require('../controllers/taskController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Task Routes
router.post('/', verifyToken, isAdmin, createTask);
router.get('/all', verifyToken, getAllTasks);
router.get('/my', verifyToken, getMyTasks);
router.get('/analytics', verifyToken, getAnalytics);
router.put('/:id', verifyToken, updateTask);
router.delete('/:id', verifyToken, isAdmin, deleteTask);

// Subtask Routes
router.post('/:taskId/subtasks', verifyToken, createSubTask);
router.put('/subtasks/:subTaskId', verifyToken, toggleSubTask);
router.delete('/subtasks/:subTaskId', verifyToken, deleteSubTask);

module.exports = router;
