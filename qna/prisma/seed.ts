import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user if not exists
  const adminEmail = 'admin@example.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin user created: admin@example.com / admin123');
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  // Create default channel if none exists
  const channelCount = await prisma.channel.count();
  if (channelCount === 0) {
    await prisma.channel.create({ data: { name: 'General' } });
    console.log('✅ Default channel "General" created');
  } else {
    console.log('ℹ️ Default channel already exists');
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
