const prisma = require('../utils/prisma');

const createList = async (req, res) => {
    try {
        const { title, boardId, order } = req.body;
        const list = await prisma.list.create({
            data: { title, boardId, order: order || 0 }
        });
        res.status(201).json(list);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateList = async (req, res) => {
    try {
        const { id } = req.params;
        const list = await prisma.list.update({
            where: { id },
            data: req.body
        });
        res.json(list);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteList = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.list.delete({ where: { id } });
        res.json({ message: 'List deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { createList, updateList, deleteList };
