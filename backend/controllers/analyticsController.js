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

        // Mission distribution
        const missionDist = await prisma.mission.groupBy({
            by: ['status'],
            _count: true
        });

        // Recent System Activity
        const recentTasks = await prisma.task.findMany({
            take: 5,
            orderBy: { updatedAt: 'desc' },
            include: { assignee: { select: { name: true } } }
        });

        const recentMissions = await prisma.mission.findMany({
            take: 5,
            orderBy: { updatedAt: 'desc' },
            include: { creator: { select: { name: true } } }
        });

        res.json({
            cards: {
                totalUsers,
                totalTasks,
                completedTasks,
                pendingTasks,
                activeMissions
            },
            productivity: userProductivity.map(u => ({ name: u.name, completed: u._count.assignedTasks })),
            missionDistribution: missionDist.map(d => ({ status: d.status, count: d._count })),
            activity: [
                ...recentTasks.map(t => ({ type: 'task', title: t.title, user: t.assignee?.name || 'Unassigned', time: t.updatedAt })),
                ...recentMissions.map(m => ({ type: 'mission', title: m.title, user: m.creator?.name || 'Admin', time: m.updatedAt }))
            ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAdminStats };
