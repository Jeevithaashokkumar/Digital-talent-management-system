const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, editMessage, deleteMessage, togglePin, reactToMessage, markAsRead } = require('../controllers/messageController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getMessages);
router.post('/', verifyToken, sendMessage);
router.post('/read', verifyToken, markAsRead);
router.put('/:id', verifyToken, editMessage);
router.delete('/:id', verifyToken, deleteMessage);
router.patch('/:id/pin', verifyToken, togglePin);
router.post('/:id/react', verifyToken, reactToMessage);

module.exports = router;
