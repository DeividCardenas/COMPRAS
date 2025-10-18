const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function upsertRole(nombre) {
  let rol = await prisma.rol.findFirst({ where: { nombre } });
  if (!rol) {
    rol = await prisma.rol.create({ data: { nombre } });
    console.log('Rol creado:', nombre, rol.id_rol);
  } else {
    console.log('Rol existente:', nombre, rol.id_rol);
  }
  return rol;
}

async function upsertUser({ username, email, password, rolId }) {
  // Buscar por email o por username para evitar violaciones de unique constraint
  const existingByEmail = await prisma.usuario.findUnique({ where: { email } });
  const existingByUsername = await prisma.usuario.findFirst({ where: { username } });
  const hashed = await bcrypt.hash(password, 10);

  if (existingByEmail) {
    const updated = await prisma.usuario.update({ where: { email }, data: { nombre_usuario: username, password: hashed, id_rol: rolId } });
    console.log('Usuario actualizado por email:', updated.email);
    return updated;
  }

  if (existingByUsername) {
    // Si existe el username con otro email, actualizamos ese registro para usar el email suministrado
  const updated = await prisma.usuario.update({ where: { id_usuario: existingByUsername.id_usuario }, data: { email, password: hashed, id_rol: rolId } });
    console.log('Usuario actualizado por username:', updated.email);
    return updated;
  }

  const created = await prisma.usuario.create({ data: { nombre_usuario: username, email, password: hashed, id_rol: rolId } });
  console.log('Usuario creado:', created.email);
  return created;
}

async function main() {
  try {
    const adminRole = await upsertRole('admin');
    const userRole = await upsertRole('user');

  // Crear usuario admin (email cambiado según petición)
  await upsertUser({ username: 'admin', email: 'admin@admin.com', password: 'Admin123!', rolId: adminRole.id_rol });

  // Crear usuario normal (email y contraseña cambiada según petición)
  await upsertUser({ username: 'user', email: 'user@mail.com', password: 'user123', rolId: userRole.id_rol });

    console.log('Usuarios de prueba creados/actualizados.');
  } catch (err) {
    console.error('Error en create_admin_users:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
