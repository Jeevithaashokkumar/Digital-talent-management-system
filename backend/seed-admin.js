const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function seed() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = await prisma.user.upsert({
            where: { email: 'admin@dtms.com' },
            update: {},
            create: {
                name: 'System Admin',
                email: 'admin@dtms.com',
                password: hashedPassword,
                role: 'admin',
                status: 'active'
            }
        });
        console.log('Seed successful: Admin created/verified');
    } catch (e) {
        console.error('Seed failure:', e);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
