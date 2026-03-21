const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // 1. Setup Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dtms.com' },
    update: {},
    create: {
      name: 'Admin Stratus',
      email: 'admin@dtms.com',
      password: hashedPassword,
      role: 'admin'
    }
  });

  // 2. Setup Board
  const board = await prisma.board.create({
    data: {
      title: 'Acme Inc: Alpha Phase',
      description: 'Strategic deployment of core neural infrastructure.',
      createdBy: admin.id
    }
  });

  // 3. Setup Lists
  const listNames = ['To Do', 'Active Execution', 'Review Matrix', 'Objective Success'];
  const lists = await Promise.all(listNames.map((name, i) => 
    prisma.list.create({
      data: { title: name, order: i, boardId: board.id }
    })
  ));

  // 4. Setup Cards
  const cardData = [
    { title: 'Neural Core Integration', listId: lists[0].id, priority: 'high', tags: 'Backend,Security' },
    { title: '3D Matrix Dashboard UI', listId: lists[1].id, priority: 'medium', tags: 'Frontend,UI' },
    { title: 'SMTP Relay Protocol', listId: lists[1].id, priority: 'low', tags: 'Infrastructure' },
    { title: 'User Auth Matrix', listId: lists[3].id, priority: 'high', tags: 'Security' }
  ];

  await Promise.all(cardData.map((c, i) => 
    prisma.task.create({
      data: {
        ...c,
        order: i,
        boardId: board.id,
        assignedTo: admin.id,
        createdBy: admin.id
      }
    })
  ));

  console.log('Hyper-Suite Neural Seed Successful:');
  console.log('Board: Acme Inc: Alpha Phase');
  console.log('Admin: admin@dtms.com / password123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
