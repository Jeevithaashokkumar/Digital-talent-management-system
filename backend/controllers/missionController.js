const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getMissions = async (req, res) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        let whereStatus = { createdBy: userId };
        if (isAdmin) {
            whereStatus = {}; // Admin sees everything
        } else {
            whereStatus = {
                OR: [
                    { createdBy: userId },
                    { assignedUsers: { contains: userId } }
                ]
            };
        }

        const missions = await prisma.mission.findMany({ where: whereStatus });
        res.json(missions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createMission = async (req, res) => {
    try {
        const { title, description, status, priority, dueDate, relatedTasks, assignedUsers } = req.body;
        const mission = await prisma.mission.create({
            data: {
                title,
                description,
                status,
                priority,
                dueDate: dueDate ? new Date(dueDate) : null,
                relatedTasks: relatedTasks ? JSON.stringify(relatedTasks) : "[]",
                assignedUsers: assignedUsers ? JSON.stringify(assignedUsers) : "[]",
                createdBy: req.user.id
            }
        });
        res.status(201).json(mission);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateMission = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        if (updateData.dueDate) updateData.dueDate = new Date(updateData.dueDate);
        if (updateData.relatedTasks) updateData.relatedTasks = JSON.stringify(updateData.relatedTasks);
        if (updateData.assignedUsers) updateData.assignedUsers = JSON.stringify(updateData.assignedUsers);

        const mission = await prisma.mission.update({
            where: { id },
            data: updateData
        });
        res.json(mission);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteMission = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.mission.delete({ where: { id } });
        res.json({ message: 'Mission deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { getMissions, createMission, updateMission, deleteMission };
