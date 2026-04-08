const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');
const { verifyToken } = require('../middleware/auth');

router.post('/submit', verifyToken, queryController.createQuery);
router.get('/my', verifyToken, queryController.getUserQueries);
router.get('/all', verifyToken, queryController.getAllQueries);
router.put('/:id/reply', verifyToken, queryController.replyQuery);
router.put('/:id/read', verifyToken, queryController.markQueryAsRead);

module.exports = router;
