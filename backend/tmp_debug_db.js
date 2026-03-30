const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true }
  });
  console.log('--- Users ---');
  console.table(users);

  const tasks = await prisma.task.findMany({
    include: {
      creator: { select: { name: true } },
      assignee: { select: { name: true } }
    }
  });
  console.log('--- Tasks ---');
  console.table(tasks.map(t => ({
    id: t.id,
    title: t.title,
    status: t.status,
    startDate: t.startDate,
    dueDate: t.dueDate,
    creator: t.creator?.name,
    assignee: t.assignee?.name
  })));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
