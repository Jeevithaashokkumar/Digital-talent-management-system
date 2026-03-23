const prisma = require('../utils/prisma');

const createTask = async (req, res) => {
    try {
        const { title, description, priority, status, boardId, listId, assignedTo, folderId, labels, dueDate } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required' });

        const task = await prisma.task.create({
            data: {
                title,
                description,
                priority: priority || 'medium',
                status: status || 'todo',
                boardId,
                listId,
                assignedTo: assignedTo || null,
                folderId,
                labels: Array.isArray(labels) ? labels.join(',') : (labels || ''),
                dueDate: dueDate ? new Date(dueDate) : null,
                createdBy: req.user.id
            },
            include: { subTasks: true, assignee: { select: { id: true, name: true, email: true } } }
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllTasks = async (req, res) => {
    try {
        const { status, priority, assignedTo, boardId } = req.query;
        const where = {};
        
        // Strict role-based isolation for non-admins
        if (req.user.role !== 'admin') {
            where.OR = [
                { assignedTo: req.user.id },
                { createdBy: req.user.id }
            ];
        } else if (assignedTo) {
            where.assignedTo = assignedTo;
        }

        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (boardId) where.boardId = boardId;

        const tasks = await prisma.task.findMany({
            where,
            include: { 
                creator: { select: { id: true, name: true, email: true } },
                assignee: { select: { id: true, name: true, email: true } },
                subTasks: true 
            },
            orderBy: { createdAt: 'desc' }
        });

        // Parse labels back to array
        const tasksWithLabels = tasks.map(t => ({
            ...t,
            labels: t.labels ? t.labels.split(',').filter(Boolean) : []
        }));

        res.json(tasksWithLabels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await prisma.task.findUnique({ 
            where: { id },
            include: { 
                creator: { select: { id: true, name: true, email: true } },
                assignee: { select: { id: true, name: true, email: true } },
                subTasks: true 
            }
        });
        if (!task) return res.status(404).json({ error: 'Task not found' });
        task.labels = task.labels ? task.labels.split(',').filter(Boolean) : [];
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMyTasks = async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            where: { assignedTo: req.user.id },
            include: { subTasks: true, assignee: { select: { id: true, name: true, email: true } } }
        });
        const tasksWithLabels = tasks.map(t => ({
            ...t,
            labels: t.labels ? t.labels.split(',').filter(Boolean) : []
        }));
        res.json(tasksWithLabels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        
        // Handle labels
        if (updateData.labels) {
            updateData.labels = Array.isArray(updateData.labels) 
                ? updateData.labels.join(',') 
                : updateData.labels;
        }
        // Handle dueDate
        if (updateData.dueDate) {
            updateData.dueDate = new Date(updateData.dueDate);
        }

        const task = await prisma.task.update({
            where: { id },
            data: updateData,
            include: { subTasks: true, assignee: { select: { id: true, name: true, email: true } } }
        });
        task.labels = task.labels ? task.labels.split(',').filter(Boolean) : [];
        res.json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ['todo', 'in-progress', 'done'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be: todo, in-progress, done' });
        }

        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) return res.status(404).json({ error: 'Task not found' });

        if (req.user.role !== 'admin' && task.assignedTo !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. You can only update tasks assigned to you.' });
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: { status },
            include: { assignee: { select: { id: true, name: true, email: true } } }
        });
        updatedTask.labels = updatedTask.labels ? updatedTask.labels.split(',').filter(Boolean) : [];
        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.task.delete({ where: { id } });
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAnalytics = async (req, res) => {
    try {
        const counts = await prisma.task.groupBy({ by: ['status'], _count: true });
        const priorityCounts = await prisma.task.groupBy({ by: ['priority'], _count: true });
        res.json({ counts, priorityCounts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createSubTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title } = req.body;
        const subTask = await prisma.subTask.create({ data: { title, taskId } });
        res.status(201).json(subTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const toggleSubTask = async (req, res) => {
    try {
        const { subTaskId } = req.params;
        const subTask = await prisma.subTask.findUnique({ where: { id: subTaskId } });
        const updated = await prisma.subTask.update({
            where: { id: subTaskId },
            data: { completed: !subTask.completed }
        });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteSubTask = async (req, res) => {
    try {
        const { subTaskId } = req.params;
        await prisma.subTask.delete({ where: { id: subTaskId } });
        res.json({ message: 'Subtask deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { 
    createTask, getAllTasks, getTaskById, getMyTasks, updateTask, updateTaskStatus,
    deleteTask, getAnalytics, createSubTask, toggleSubTask, deleteSubTask 
};
