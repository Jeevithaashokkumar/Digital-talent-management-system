const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const userCount = await prisma.user.count();
    const boardCount = await prisma.board.count();
    console.log(`Users in DB: ${userCount}`);
    console.log(`Boards in DB: ${boardCount}`);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({ take: 5 });
      console.log('Sample Users:', users.map(u => ({ id: u.id, email: u.email, name: u.name })));
    }
  } catch (e) {
    console.error('Database check failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
