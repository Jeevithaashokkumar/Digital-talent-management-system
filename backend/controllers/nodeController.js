const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getNodes = async (req, res) => {
    try {
        const { graphId } = req.query;
        if (!graphId) return res.status(400).json({ error: 'graphId required' });
        const nodes = await prisma.neuralNode.findMany({
            where: { 
                createdBy: req.user.id,
                graphId: graphId
            }
        });
        res.json(nodes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createNode = async (req, res) => {
    try {
        const { title, description, type, priority, position, linkedNodes, graphId } = req.body;
        if (!graphId) return res.status(400).json({ error: 'graphId required' });
        const node = await prisma.neuralNode.create({
            data: {
                title,
                description,
                type,
                priority,
                position: position ? JSON.stringify(position) : null,
                linkedNodes: linkedNodes ? JSON.stringify(linkedNodes) : "[]",
                createdBy: req.user.id,
                graphId
            }
        });
        res.status(201).json(node);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateNode = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, type, status, priority, position, linkedNodes } = req.body;
        
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (type !== undefined) updateData.type = type;
        if (status !== undefined) updateData.status = status;
        if (priority !== undefined) updateData.priority = priority;
        if (position !== undefined) updateData.position = JSON.stringify(position);
        if (linkedNodes !== undefined) updateData.linkedNodes = JSON.stringify(linkedNodes);

        const node = await prisma.neuralNode.update({
            where: { id },
            data: updateData
        });
        res.json(node);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteNode = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.neuralNode.delete({ where: { id } });
        res.json({ message: 'Node deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { getNodes, createNode, updateNode, deleteNode };
