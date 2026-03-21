const express = require('express');
const router = express.Router();
const { getGraphs, createGraph, getGraph, deleteGraph } = require('../controllers/graphController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getGraphs);
router.post('/', verifyToken, createGraph);
router.get('/:id', verifyToken, getGraph);
router.delete('/:id', verifyToken, deleteGraph);

module.exports = router;
