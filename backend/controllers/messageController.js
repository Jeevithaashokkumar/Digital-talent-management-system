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
        const { content, receiverId, replyToId } = req.body;
        const message = await prisma.message.create({
            data: {
                content,
                receiverId: receiverId || null,
                senderId: req.user.id,
                replyToId: replyToId || null
            },
            include: { 
               sender: { select: { id: true, name: true } },
               replyTo: { include: { sender: { select: { id: true, name: true } } } }
            }
        });
        res.status(201).json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const editMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const message = await prisma.message.update({
            where: { id },
            data: { content },
            include: { sender: { select: { id: true, name: true } } }
        });
        res.json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        // First delete reactions
        await prisma.reaction.deleteMany({ where: { messageId: id } });
        await prisma.message.delete({ where: { id } });
        res.json({ message: 'Signal terminated' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const togglePin = async (req, res) => {
    try {
        const { id } = req.params;
        const current = await prisma.message.findUnique({ where: { id } });
        const message = await prisma.message.update({
            where: { id },
            data: { isPinned: !current.isPinned }
        });
        res.json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const reactToMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { emoji } = req.body;
        const userId = req.user.id;

        const existing = await prisma.reaction.findFirst({
            where: { messageId: id, userId, emoji }
        });

        if (existing) {
            await prisma.reaction.delete({ where: { id: existing.id } });
            return res.json({ action: 'removed', reaction: existing });
        }

        const reaction = await prisma.reaction.create({
            data: { emoji, userId, messageId: id }
        });
        res.json({ action: 'added', reaction });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { getMessages, sendMessage, editMessage, deleteMessage, togglePin, reactToMessage };
