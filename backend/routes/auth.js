const express = require('express');
const router = express.Router();
const { register, login, requestOTP, verifyOTP, getMe, getUsers } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.get('/users', verifyToken, getUsers);
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);

module.exports = router;
