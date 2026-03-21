const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/messageController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getMessages);
router.post('/', verifyToken, sendMessage);

module.exports = router;
