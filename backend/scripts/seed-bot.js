const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  const botId = 'neural-bot-id-001';
  const botEmail = 'neural.bot@dtms.system';
  const password = await bcrypt.hash('neural-bot-secret-2026', 10);

  const existingBot = await prisma.user.findUnique({
    where: { id: botId }
  });

  if (!existingBot) {
    await prisma.user.create({
      data: {
        id: botId,
        name: 'Neural Bot',
        email: botEmail,
        password: password,
        role: 'ai_assistant',
        status: 'active',
        isOnline: true,
      }
    });
    console.log('Neural Bot initialized in the Matrix.');
  } else {
    console.log('Neural Bot is already operational.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
