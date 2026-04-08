const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

// Admin only: Get all users
const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, status: true, isOnline: true, lastSeen: true, createdAt: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin only: Create user
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role: role || 'user' }
        });
        res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Admin only: Update user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, status } = req.body;
        const user = await prisma.user.update({
            where: { id },
            data: { name, email, role, status }
        });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Admin only: Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'User eliminated from matrix' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
