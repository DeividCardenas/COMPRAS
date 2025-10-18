const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTable() {
  try {
    console.log('Verificando existencia de la tabla proveedores...');
    const exists = await prisma.$queryRaw`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'proveedores'`;
    const count = Array.isArray(exists) && exists[0] ? Number(Object.values(exists[0])[0]) : 0;
    if (count > 0) {
      console.log('La tabla proveedores ya existe. Nada que hacer.');
      return;
    }

    console.log('Creando la tabla proveedores...');
    // SQL compatible con MySQL
    const sql = `
      CREATE TABLE proveedores (
        id_proveedor INT NOT NULL AUTO_INCREMENT,
        laboratorio VARCHAR(191) NULL,
        tipo VARCHAR(191) NULL,
        titular VARCHAR(191) NULL,
        direccion VARCHAR(191) NULL,
        telefono VARCHAR(191) NULL,
        email VARCHAR(191) NULL,
        creado_en DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id_proveedor)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `;

    await prisma.$executeRawUnsafe(sql);
    console.log('Tabla proveedores creada correctamente.');
  } catch (err) {
    console.error('Error creando tabla proveedores:', err.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

createTable();
