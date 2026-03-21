const express = require('express');
const router = express.Router();
const { createFolder, getFolders, getFolderById, getFolderContent, updateFolder, deleteFolder } = require('../controllers/folderController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, createFolder);
router.get('/', verifyToken, getFolders);
router.get('/:id', verifyToken, getFolderById);
router.get('/:id/content', verifyToken, getFolderContent);
router.put('/:id', verifyToken, updateFolder);
router.delete('/:id', verifyToken, deleteFolder);

module.exports = router;
