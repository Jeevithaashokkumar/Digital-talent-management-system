const prisma = require('../utils/prisma');
const path = require('path');
const fs = require('fs');

const uploadFiles = async (req, res) => {
    try {
        const { folderId } = req.body;
        const files = req.files;
        if (!files || files.length === 0) return res.status(400).json({ error: 'No files uploaded' });

        const savedFiles = await Promise.all(files.map(async (file) => {
            const url = `/uploads/${file.filename}`;
            return prisma.file.create({
                data: {
                    name: file.filename,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    path: file.path,
                    url,
                    folderId: folderId || null,
                    uploadedBy: req.user.id
                }
            });
        }));
        res.status(201).json(savedFiles);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getFilesByFolder = async (req, res) => {
    try {
        const { folderId } = req.params;
        const files = await prisma.file.findMany({
            where: { folderId: folderId === 'root' ? null : folderId },
            include: { uploader: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await prisma.file.findUnique({ where: { id } });
        if (!file) return res.status(404).json({ error: 'File not found' });

        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        await prisma.file.delete({ where: { id } });
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const downloadFile = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await prisma.file.findUnique({ where: { id } });
        if (!file) return res.status(404).json({ error: 'File not found' });

        if (!fs.existsSync(file.path)) {
            return res.status(404).json({ error: 'File data not found on disk' });
        }

        res.download(file.path, file.originalName);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { uploadFiles, getFilesByFolder, deleteFile, downloadFile };
