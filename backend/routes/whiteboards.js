const express = require('express');
const router = express.Router();
const { createWhiteboard, getWhiteboards, getWhiteboardById, updateWhiteboard, deleteWhiteboard } = require('../controllers/whiteboardController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, createWhiteboard);
router.get('/', verifyToken, getWhiteboards);
router.get('/:id', verifyToken, getWhiteboardById);
router.put('/:id', verifyToken, updateWhiteboard);
router.delete('/:id', verifyToken, deleteWhiteboard);

module.exports = router;
