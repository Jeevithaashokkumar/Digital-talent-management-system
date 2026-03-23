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

        // Upcoming Deadlines (Due within next 48 hours)
        const in48Hours = new Date();
        in48Hours.setHours(in48Hours.getHours() + 48);
        
        const deadlines = await prisma.task.findMany({
            where: {
                assignedTo: userId,
                status: { notIn: ['completed', 'done'] },
                dueDate: { lte: in48Hours, gte: new Date() }
            },
            take: 5,
            orderBy: { dueDate: 'asc' }
        });

        // Recent Personal Activity
        const personalActivity = await prisma.task.findMany({
            where: { assignedTo: userId },
            take: 8,
            orderBy: { updatedAt: 'desc' },
            select: { title: true, status: true, updatedAt: true }
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
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            deadlines: deadlines.map(d => ({ id: d.id, title: d.title, dueDate: d.dueDate })),
            activity: personalActivity.map(a => ({ title: a.title, status: a.status, time: a.updatedAt }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getUserStats };
