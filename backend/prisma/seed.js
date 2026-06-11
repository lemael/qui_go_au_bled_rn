require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = (pwd) => bcrypt.hash(pwd, 10);

  const users = [
    {
      fullName: 'Karim Benali',
      email: 'karim@example.com',
      password: await hash('password123'),
      phone: '+33 6 11 22 33 44',
      address: 'Paris, France',
      role: 'both',
    },
    {
      fullName: 'Amina Messaoudi',
      email: 'amina@example.com',
      password: await hash('password123'),
      phone: '+33 6 55 66 77 88',
      address: 'Lyon, France',
      role: 'both',
    },
    {
      fullName: 'Admin',
      email: 'admin@quigoaubled.com',
      password: await hash('Admin@2024!'),
      phone: '+33 1 00 00 00 00',
      address: 'Paris, France',
      role: 'admin',
    },
  ];

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    console.log(`✅ ${user.role.padEnd(12)} ${user.email}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
