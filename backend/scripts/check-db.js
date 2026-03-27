const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Database Connection Diagnostic ---');
  console.log(`Targeting URL: ${process.env.DATABASE_URL || 'Not set in process.env (check .env file)'}`);

  try {
    console.log('Attempting to connect to the database...');
    // A simple query to test connection
    await prisma.$connect();
    const userCount = await prisma.user.count();
    console.log('✅ Connection Successful!');
    console.log(`✅ Database is reachable. Total users in system: ${userCount}`);
  } catch (error) {
    console.error('❌ Connection Failed!');
    console.error('--- Error Details ---');
    console.error(error.message);
    
    if (error.message.includes('Can\'t reach database server')) {
        console.log('\n💡 Tip: Your Docker Engine might be offline. Please start Docker Desktop.');
    } else if (error.message.includes('Authentication failed')) {
        console.log('\n💡 Tip: Check your username and password in the DATABASE_URL (.env file).');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
