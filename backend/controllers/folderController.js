const prisma = require('../utils/prisma');

const createFolder = async (req, res) => {
    try {
        const { name, parentFolderId } = req.body;
        const folder = await prisma.folder.create({
            data: { name, parentFolderId, createdBy: req.user.id }
        });
        res.status(201).json(folder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getFolders = async (req, res) => {
    try {
        const folders = await prisma.folder.findMany({
            where: { createdBy: req.user.id, parentFolderId: null },
            include: { subFolders: true, docs: true, whiteboards: true }
        });
        res.json(folders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const folder = await prisma.folder.update({
            where: { id },
            data: req.body
        });
        res.json(folder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteFolder = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.folder.delete({ where: { id } });
        res.json({ message: 'Folder deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { createFolder, getFolders, updateFolder, deleteFolder };
