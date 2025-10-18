const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function updatePassword(email, newPassword) {
  try {
    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) {
      console.log('Usuario no encontrado:', email);
      return;
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    const updated = await prisma.usuario.update({ where: { email }, data: { password: hashed } });
    console.log('Contraseña actualizada para', email);
    return updated;
  } catch (err) {
    console.error('Error actualizando contraseña:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar con valores por defecto para admin (email por defecto actualizado)
const email = process.argv[2] || 'admin@admin.com';
const newPassword = process.argv[3] || 'admin123';
updatePassword(email, newPassword).then(() => process.exit());
