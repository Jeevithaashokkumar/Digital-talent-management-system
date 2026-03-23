const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new operation
const createOperation = async (req, res) => {
    try {
        const { operationName, department, priority, region, assignedManager } = req.body;
        const operation = await prisma.operation.create({
            data: {
                operationName,
                department,
                priority: priority || 'medium',
                region,
                assignedManager,
                createdBy: req.user.id
            }
        });
        res.status(201).json(operation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all operations
const getOperations = async (req, res) => {
    try {
        const operations = await prisma.operation.findMany({
            include: {
                creator: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(operations);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update an operation
const updateOperation = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        const operation = await prisma.operation.update({
            where: { id },
            data: updateData
        });
        res.json(operation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete an operation
const deleteOperation = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.operation.delete({ where: { id } });
        res.json({ message: 'Operation deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createOperation,
    getOperations,
    updateOperation,
    deleteOperation
};
