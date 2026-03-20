const express = require('express');
const router = express.Router();
const { createDoc, getDocs, getDocById, updateDoc } = require('../controllers/docController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, createDoc);
router.get('/', verifyToken, getDocs);
router.get('/:id', verifyToken, getDocById);
router.put('/:id', verifyToken, updateDoc);

module.exports = router;
