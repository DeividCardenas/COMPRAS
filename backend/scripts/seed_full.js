const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function upsert(model, where, data) {
  const found = await prisma[model].findFirst({ where });
  if (found) return found;
  return prisma[model].create({ data });
}

async function main() {
  console.log('Seeding full dataset...');

  // Laboratorios
  const labA = await upsert('laboratorio', { nombre: 'Laboratorio Seed A' }, { nombre: 'Laboratorio Seed A' });
  const labB = await upsert('laboratorio', { nombre: 'Laboratorio Seed B' }, { nombre: 'Laboratorio Seed B' });

  // Empresas
  const emp1 = await upsert('empresa', { nombre: 'Compañía Alpha' }, { nombre: 'Compañía Alpha' });
  const emp2 = await upsert('empresa', { nombre: 'Compañía Beta' }, { nombre: 'Compañía Beta' });
  const emp3 = await upsert('empresa', { nombre: 'Compañía Gamma' }, { nombre: 'Compañía Gamma' });

  // EPS
  const eps1 = await upsert('ePS', { nombre: 'EPS Salud' }, { nombre: 'EPS Salud' });
  const eps2 = await upsert('ePS', { nombre: 'EPS Bienestar' }, { nombre: 'EPS Bienestar' });

  // Tarifarios (asociados a empresas o eps)
  const tarifEmpA = await upsert('tarifario', { nombre: 'Tarifario Alpha' }, { nombre: 'Tarifario Alpha', id_empresa: emp1.id_empresa });
  const tarifEmpB = await upsert('tarifario', { nombre: 'Tarifario Beta' }, { nombre: 'Tarifario Beta', id_empresa: emp2.id_empresa });
  const tarifEps1 = await upsert('tarifario', { nombre: 'Tarifario EPS Salud' }, { nombre: 'Tarifario EPS Salud', id_eps: eps1.id_eps });
  const tarifEps2 = await upsert('tarifario', { nombre: 'Tarifario EPS Bienestar' }, { nombre: 'Tarifario EPS Bienestar', id_eps: eps2.id_eps });

  // Productos
  const productsData = [
    { cum: 'CUM-SEED-001', descripcion: 'Paracetamol 500mg', presentacion: 'Tabletas 20', concentracion: '500mg', registro_sanitario: 'RS-001', id_laboratorio: labA.id_laboratorio, precio_unidad: 500, precio_presentacion: 8000, iva: 0.19, codigo_barras: 'CB001' },
    { cum: 'CUM-SEED-002', descripcion: 'Ibuprofeno 400mg', presentacion: 'Tabletas 10', concentracion: '400mg', registro_sanitario: 'RS-002', id_laboratorio: labA.id_laboratorio, precio_unidad: 700, precio_presentacion: 6000, iva: 0.19, codigo_barras: 'CB002' },
    { cum: 'CUM-SEED-003', descripcion: 'Amoxicilina 500mg', presentacion: 'Cápsulas 12', concentracion: '500mg', registro_sanitario: 'RS-003', id_laboratorio: labB.id_laboratorio, precio_unidad: 1200, precio_presentacion: 14000, iva: 0.19, codigo_barras: 'CB003' },
    { cum: 'CUM-SEED-004', descripcion: 'Omeprazol 20mg', presentacion: 'Tabletas 14', concentracion: '20mg', registro_sanitario: 'RS-004', id_laboratorio: labB.id_laboratorio, precio_unidad: 900, precio_presentacion: 9000, iva: 0.19, codigo_barras: 'CB004' },
    { cum: 'CUM-SEED-005', descripcion: 'Loratadina 10mg', presentacion: 'Tabletas 10', concentracion: '10mg', registro_sanitario: 'RS-005', id_laboratorio: labA.id_laboratorio, precio_unidad: 600, precio_presentacion: 5500, iva: 0.19, codigo_barras: 'CB005' },
    { cum: 'CUM-SEED-006', descripcion: 'Metformina 850mg', presentacion: 'Tabletas 30', concentracion: '850mg', registro_sanitario: 'RS-006', id_laboratorio: labB.id_laboratorio, precio_unidad: 1500, precio_presentacion: 20000, iva: 0.19, codigo_barras: 'CB006' }
  ];

  const createdProducts = [];
  for (const p of productsData) {
    let prod = await prisma.producto.findUnique({ where: { cum: p.cum } });
    if (!prod) {
      prod = await prisma.producto.create({ data: p });
      console.log('Producto creado:', prod.id_producto, prod.cum);
    } else {
      console.log('Producto ya existe:', prod.id_producto, prod.cum);
    }
    createdProducts.push(prod);
  }

  // Asociar tarifas con productos (TarifarioOnProducto) con distintos precios por empresa/eps
  const assignments = [];
  for (const prod of createdProducts) {
    // for each product, create an assignment for tarifEmpA and tarifEmpB and an EPS tarifario
    const aExists = await prisma.tarifarioOnProducto.findUnique({ where: { id_tarifario_id_producto: { id_tarifario: tarifEmpA.id_tarifario, id_producto: prod.id_producto } } });
    if (!aExists) {
      await prisma.tarifarioOnProducto.create({ data: { id_tarifario: tarifEmpA.id_tarifario, id_producto: prod.id_producto, precio: Math.round(Number(prod.precio_presentacion) * 1.05), precio_unidad: Math.round(Number(prod.precio_unidad) * 1.05), precio_empaque: Math.round(Number(prod.precio_presentacion) * 1.05) } });
    }

    const bExists = await prisma.tarifarioOnProducto.findUnique({ where: { id_tarifario_id_producto: { id_tarifario: tarifEmpB.id_tarifario, id_producto: prod.id_producto } } });
    if (!bExists) {
      await prisma.tarifarioOnProducto.create({ data: { id_tarifario: tarifEmpB.id_tarifario, id_producto: prod.id_producto, precio: Math.round(Number(prod.precio_presentacion) * 0.95), precio_unidad: Math.round(Number(prod.precio_unidad) * 0.95), precio_empaque: Math.round(Number(prod.precio_presentacion) * 0.95) } });
    }

    const eps1Exists = await prisma.tarifarioOnProducto.findUnique({ where: { id_tarifario_id_producto: { id_tarifario: tarifEps1.id_tarifario, id_producto: prod.id_producto } } });
    if (!eps1Exists) {
      await prisma.tarifarioOnProducto.create({ data: { id_tarifario: tarifEps1.id_tarifario, id_producto: prod.id_producto, precio: Math.round(Number(prod.precio_presentacion) * 0.9), precio_unidad: Math.round(Number(prod.precio_unidad) * 0.9), precio_empaque: Math.round(Number(prod.precio_presentacion) * 0.9) } });
    }

    // Optionally assign second EPS
    const eps2Exists = await prisma.tarifarioOnProducto.findUnique({ where: { id_tarifario_id_producto: { id_tarifario: tarifEps2.id_tarifario, id_producto: prod.id_producto } } });
    if (!eps2Exists) {
      await prisma.tarifarioOnProducto.create({ data: { id_tarifario: tarifEps2.id_tarifario, id_producto: prod.id_producto, precio: Math.round(Number(prod.precio_presentacion) * 1.1), precio_unidad: Math.round(Number(prod.precio_unidad) * 1.1), precio_empaque: Math.round(Number(prod.precio_presentacion) * 1.1) } });
    }
  }

  console.log('Seeding completo.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
