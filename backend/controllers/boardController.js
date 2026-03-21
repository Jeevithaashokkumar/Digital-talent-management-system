const prisma = require('../utils/prisma');

const createBoard = async (req, res) => {
    try {
        const { title, description } = req.body;
        const board = await prisma.board.create({
            data: { title, description, createdBy: req.user.id }
        });
        res.status(201).json(board);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getBoards = async (req, res) => {
    try {
        const boards = await prisma.board.findMany({
            where: { createdBy: req.user.id },
            include: { lists: true }
        });
        res.json(boards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getBoardById = async (req, res) => {
    try {
        const { id } = req.params;
        let board;

        if (id === 'default') {
            board = await prisma.board.findFirst({
                where: { createdBy: req.user.id },
                include: { lists: { include: { tasks: { include: { subTasks: true, assignee: true } } } } }
            });

            if (!board) {
                // Auto-create a default board if user has none
                board = await prisma.board.create({
                    data: {
                        title: 'Digital Talent Matrix',
                        description: 'Your primary workspace for strategic operations.',
                        createdBy: req.user.id,
                        lists: {
                            create: [
                                { title: 'To Do', order: 0 },
                                { title: 'Active Execution', order: 1 },
                                { title: 'Review Matrix', order: 2 },
                                { title: 'Objective Success', order: 3 }
                            ]
                        }
                    },
                    include: { lists: { include: { tasks: { include: { subTasks: true, assignee: true } } } } }
                });
            }
        } else {
            board = await prisma.board.findUnique({
                where: { id },
                include: { lists: { include: { tasks: { include: { subTasks: true, assignee: true } } } } }
            });
        }

        if (!board) return res.status(404).json({ error: 'Board not found' });
        res.json(board);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteBoard = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.board.delete({ where: { id } });
        res.json({ message: 'Board deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { createBoard, getBoards, getBoardById, deleteBoard };
