const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/role');

router.get('/', verifyToken, getUsers);
router.post('/', verifyToken, verifyAdmin, createUser);
router.put('/:id', verifyToken, verifyAdmin, updateUser);
router.delete('/:id', verifyToken, verifyAdmin, deleteUser);

module.exports = router;
