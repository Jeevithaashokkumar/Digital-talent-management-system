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
        const where = req.user.role === 'admin' ? {} : { createdBy: req.user.id };
        const docs = await prisma.doc.findMany({
            where,
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
        const existing = await prisma.doc.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Document not found' });
        const doc = await prisma.doc.update({
            where: { id },
            data: { ...req.body, lastEditedBy: req.user.id, version: (existing.version || 1) + 1 }
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
