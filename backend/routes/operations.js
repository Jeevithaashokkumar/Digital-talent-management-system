const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { createOperation, getOperations, updateOperation, deleteOperation } = require('../controllers/operationController');

// All operations require authentication.
router.get('/', verifyToken, getOperations);
router.post('/', verifyToken, createOperation);
router.put('/:id', verifyToken, updateOperation);
router.delete('/:id', verifyToken, deleteOperation);

module.exports = router;
