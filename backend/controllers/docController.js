const prisma = require('../utils/prisma');

const createDoc = async (req, res) => {
    try {
        const { title, content, folderId } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required' });
        const doc = await prisma.doc.create({
            data: { title, content: content || '', folderId, createdBy: req.user.id }
        });
        res.status(201).json(doc);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getDocs = async (req, res) => {
    try {
        const docs = await prisma.doc.findMany({
            orderBy: { updatedAt: 'desc' }
        });
        res.json(docs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getDocById = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await prisma.doc.findUnique({ where: { id } });
        if (!doc) return res.status(404).json({ error: 'Document not found' });
        res.json(doc);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateDoc = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await prisma.doc.update({
            where: { id },
            data: { ...req.body, lastEditedBy: req.user.id }
        });
        res.json(doc);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteDoc = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.doc.delete({ where: { id } });
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { createDoc, getDocs, getDocById, updateDoc, deleteDoc };
