const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalTasks = await prisma.task.count();
        const completedTasks = await prisma.task.count({ where: { status: 'done' } });
        const pendingTasks = totalTasks - completedTasks;
        const activeMissions = await prisma.mission.count({ where: { status: 'in_progress' } });

        // Productivity logic (Tasks completed per user)
        const userProductivity = await prisma.user.findMany({
            select: {
                name: true,
                _count: {
                    select: { assignedTasks: { where: { status: 'done' } } }
                }
            },
            take: 5,
            orderBy: { assignedTasks: { _count: 'desc' } }
        });

        res.json({
            cards: {
                totalUsers,
                totalTasks,
                completedTasks,
                pendingTasks,
                activeMissions
            },
            productivity: userProductivity.map(u => ({ name: u.name, completed: u._count.assignedTasks }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAdminStats };
