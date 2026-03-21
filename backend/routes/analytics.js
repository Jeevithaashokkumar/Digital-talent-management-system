const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/analyticsController');
const { getUserStats } = require('../controllers/userAnalyticsController');
const { verifyToken } = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/role');

router.get('/admin', verifyToken, verifyAdmin, getAdminStats);
router.get('/user', verifyToken, getUserStats);

module.exports = router;
