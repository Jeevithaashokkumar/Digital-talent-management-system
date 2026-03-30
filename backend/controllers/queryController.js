const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createQuery = async (req, res) => {
    try {
        const { title, message } = req.body;
        if (!title || !message) return res.status(400).json({ error: 'Title and Message are required' });

        const query = await prisma.query.create({
            data: {
                title,
                message,
                userId: req.user.id,
                status: 'pending'
            }
        });

        // Automatically forward query as a message to Admin
        const adminUser = await prisma.user.findFirst({
            where: { role: 'admin' },
            orderBy: { createdAt: 'asc' }
        });

        if (adminUser) {
            await prisma.message.create({
                data: {
                    content: `[ALERT: TACTICAL QUERY]\n**Subject:** ${title}\n**Detail:** ${message}`,
                    senderId: req.user.id,
                    receiverId: adminUser.id
                }
            });
        }

        res.status(201).json(query);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to deploy query' });
    }
};

const getUserQueries = async (req, res) => {
    try {
        const queries = await prisma.query.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(queries);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch your queries' });
    }
};

const getAllQueries = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
        
        const queries = await prisma.query.findMany({
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(queries);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch global queries' });
    }
};

const replyQuery = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
        
        const { id } = req.params;
        const { adminReply } = req.body;
        if (!adminReply) return res.status(400).json({ error: 'Reply content is required' });

        const query = await prisma.query.update({
            where: { id },
            data: {
                adminReply,
                status: 'replied'
            }
        });
        res.json(query);
    } catch (err) {
        res.status(500).json({ error: 'Failed to deploy reply' });
    }
};

module.exports = { createQuery, getUserQueries, getAllQueries, replyQuery };
