const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNodes() {
  const nodes = await prisma.knowledgeNode.findMany();
  const rels = await prisma.knowledgeRelationship.findMany();
  const tasks = await prisma.task.findMany();
  console.log('Nodes:', nodes.length);
  console.log('Relationships:', rels.length);
  console.log('Tasks:', tasks.length);
  process.exit(0);
}

checkNodes();
