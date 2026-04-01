const prisma = require('../utils/prisma');

const logCall = async (req, res) => {
    try {
        const { callerId, receiverId, type, status, duration } = req.body;
        const callLog = await prisma.callLog.create({
            data: {
                callerId,
                receiverId,
                type,
                status,
                duration: duration || 0
            }
        });
        res.status(201).json(callLog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCallHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await prisma.callLog.findMany({
            where: {
                OR: [
                    { callerId: userId },
                    { receiverId: userId }
                ]
            },
            include: {
                caller: { select: { id: true, name: true, email: true } },
                receiver: { select: { id: true, name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { logCall, getCallHistory };
