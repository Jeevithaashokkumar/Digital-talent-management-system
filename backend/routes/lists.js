const express = require('express');
const router = express.Router();
const { createList, updateList, deleteList } = require('../controllers/listController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, createList);
router.put('/:id', verifyToken, updateList);
router.delete('/:id', verifyToken, deleteList);

module.exports = router;
