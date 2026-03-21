const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { uploadFiles, getFilesByFolder, deleteFile, downloadFile } = require('../controllers/fileController');
const { verifyToken } = require('../middleware/auth');

// Multer config — store in /uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        const fs = require('fs');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        // Allow all common file types
        cb(null, true);
    }
});

router.post('/upload', verifyToken, upload.array('files', 10), uploadFiles);
router.get('/folder/:folderId', verifyToken, getFilesByFolder);
router.get('/download/:id', verifyToken, downloadFile);
router.delete('/:id', verifyToken, deleteFile);

module.exports = router;
