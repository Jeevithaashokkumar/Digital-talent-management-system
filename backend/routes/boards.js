const express = require('express');
const router = express.Router();
const { createBoard, getBoards, getBoardById, deleteBoard } = require('../controllers/boardController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, createBoard);
router.get('/', verifyToken, getBoards);
router.get('/:id', verifyToken, getBoardById);
router.delete('/:id', verifyToken, deleteBoard);

module.exports = router;
