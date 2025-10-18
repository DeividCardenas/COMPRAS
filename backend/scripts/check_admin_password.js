const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

(async function(){
  const prisma = new PrismaClient();
  try {
    const u = await prisma.usuario.findUnique({ where: { email: 'admin@local' } });
    console.log('usuario encontrado:', !!u);
    if (u) {
      console.log('email:', u.email);
      console.log('hash:', u.password);
      const ok = await bcrypt.compare('Admin123!', u.password);
      console.log('password match:', ok);
    }
  } catch (err) {
    console.error('error:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
