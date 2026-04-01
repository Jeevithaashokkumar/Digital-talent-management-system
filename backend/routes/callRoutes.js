const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');
const { verifyToken } = require('../middleware/auth');

router.post('/log', verifyToken, callController.logCall);
router.get('/history', verifyToken, callController.getCallHistory);

module.exports = router;
