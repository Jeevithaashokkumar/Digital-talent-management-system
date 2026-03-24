const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const totalTasks = await prisma.task.count({ where: { assignedTo: userId } });
        const completedTasks = await prisma.task.count({ where: { assignedTo: userId, status: 'completed' } });
        const inProgressTasks = await prisma.task.count({ where: { assignedTo: userId, status: 'in_progress' } });
        const pendingTasks = totalTasks - completedTasks - inProgressTasks;
        
        const activeMissions = await prisma.mission.count({
            where: {
                OR: [
                    { createdBy: userId },
                    { assignedUsers: { contains: userId } }
                ],
                status: 'in_progress'
            }
        });

        // Weekly completion trend (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const tasksLastWeek = await prisma.task.findMany({
            where: {
                assignedTo: userId,
                updatedAt: { gte: sevenDaysAgo },
                status: 'completed'
            },
            select: { updatedAt: true }
        });

        // Group by day
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const trend = days.map(day => ({ day, count: 0 }));
        tasksLastWeek.forEach(t => {
            const dayName = days[new Date(t.updatedAt).getDay()];
            const dayObj = trend.find(d => d.day === dayName);
            if (dayObj) dayObj.count++;
        });

        res.json({
            cards: {
                totalTasks,
                completedTasks,
                inProgressTasks,
                pendingTasks,
                activeMissions
            },
            trend,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getUserStats };
