const prisma = require('../utils/prisma');

const createWhiteboard = async (req, res) => {
    try {
        const { title, data, folderId } = req.body;
        const whiteboard = await prisma.whiteboard.create({
            data: { title, data, folderId, createdBy: req.user.id }
        });
        res.status(201).json(whiteboard);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getWhiteboards = async (req, res) => {
    try {
        const whiteboards = await prisma.whiteboard.findMany({
            where: { createdBy: req.user.id }
        });
        res.json(whiteboards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getWhiteboardById = async (req, res) => {
    try {
        const { id } = req.params;
        const whiteboard = await prisma.whiteboard.findUnique({ where: { id } });
        if (!whiteboard) return res.status(404).json({ error: 'Whiteboard not found' });
        res.json(whiteboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateWhiteboard = async (req, res) => {
    try {
        const { id } = req.params;
        const whiteboard = await prisma.whiteboard.update({
            where: { id },
            data: req.body
        });
        res.json(whiteboard);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { createWhiteboard, getWhiteboards, getWhiteboardById, updateWhiteboard };
