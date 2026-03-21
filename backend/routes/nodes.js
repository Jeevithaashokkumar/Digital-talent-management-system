const express = require('express');
const router = express.Router();
const { getNodes, createNode, updateNode, deleteNode } = require('../controllers/nodeController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getNodes);
router.post('/', verifyToken, createNode);
router.put('/:id', verifyToken, updateNode);
router.delete('/:id', verifyToken, deleteNode);

module.exports = router;
