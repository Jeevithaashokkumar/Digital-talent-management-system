const prisma = require('../utils/prisma');

const getMessages = async (req, res) => {
    try {
        const { receiverId } = req.query;
        const userId = req.user.id;
        
        const where = receiverId 
            ? {
                OR: [
                    { senderId: userId, receiverId },
                    { senderId: receiverId, receiverId: userId }
                ]
            }
            : { receiverId: null }; // Team Chat

        const messages = await prisma.message.findMany({
            where,
            include: { sender: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { content, receiverId } = req.body;
        const message = await prisma.message.create({
            data: {
                content,
                receiverId: receiverId || null,
                senderId: req.user.id
            },
            include: { sender: { select: { id: true, name: true } } }
        });
        res.status(201).json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { getMessages, sendMessage };
