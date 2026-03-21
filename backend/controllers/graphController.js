const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getGraphs = async (req, res) => {
    try {
        const graphs = await prisma.neuralGraph.findMany({
            where: { createdBy: req.user.id },
            include: { _count: { select: { nodes: true } } }
        });
        res.json(graphs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createGraph = async (req, res) => {
    try {
        const { title, description } = req.body;
        const graph = await prisma.neuralGraph.create({
            data: {
                title,
                description,
                createdBy: req.user.id
            }
        });
        res.status(201).json(graph);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getGraph = async (req, res) => {
    try {
        const { id } = req.params;
        const graph = await prisma.neuralGraph.findUnique({
            where: { id },
            include: { nodes: true }
        });
        if (!graph) return res.status(404).json({ error: 'Graph not found' });
        res.json(graph);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteGraph = async (req, res) => {
    try {
        const { id } = req.params;
        // Delete all nodes in graph first or prisma cascade if configured
        await prisma.neuralNode.deleteMany({ where: { graphId: id } });
        await prisma.neuralGraph.delete({ where: { id } });
        res.json({ message: 'Graph deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { getGraphs, createGraph, getGraph, deleteGraph };
