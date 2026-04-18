const { PrismaClient } = require('./prisma/client');
const prisma = new PrismaClient();

async function reset() {
  try {
    await prisma.product.deleteMany({});
    console.log('✅ Successfully cleared all products from the database.');
    console.log('♻️  If your server is running (npm run dev:services), it will automatically re-seed the new data from server.js now.');
  } catch (error) {
    console.error('❌ Failed to clear products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

reset();
