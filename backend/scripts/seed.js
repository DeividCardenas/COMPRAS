const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Crear o conseguir laboratorio
  let laboratorio = await prisma.laboratorio.findFirst();
  if (!laboratorio) {
    laboratorio = await prisma.laboratorio.create({ data: { nombre: 'Laboratorio Seed' } });
    console.log('Laboratorio creado:', laboratorio.id_laboratorio);
  } else {
    console.log('Laboratorio existente:', laboratorio.id_laboratorio);
  }

  // Crear o conseguir tarifario
  let tarifario = await prisma.tarifario.findFirst();
  if (!tarifario) {
    tarifario = await prisma.tarifario.create({ data: { nombre: 'Tarifario Seed' } });
    console.log('Tarifario creado:', tarifario.id_tarifario);
  } else {
    console.log('Tarifario existente:', tarifario.id_tarifario);
  }

  // Crear producto
  let producto = await prisma.producto.findFirst({ where: { cum: 'CUM-SEED-001' } });
  if (!producto) {
    producto = await prisma.producto.create({
      data: {
        cum: 'CUM-SEED-001',
        descripcion: 'Producto Seed',
        concentracion: '10mg',
        presentacion: 'Tabletas',
        registro_sanitario: 'RS-SEED-001',
        id_laboratorio: laboratorio.id_laboratorio,
        precio_unidad: 1000,
        precio_presentacion: 10000,
        iva: 0.19,
        regulacion: 'No',
        codigo_barras: 'CB-SEED-001'
      }
    });
    console.log('Producto creado:', producto.id_producto);
  } else {
    console.log('Producto existente:', producto.id_producto);
  }

  // Crear asignacion tarifarioOnProducto si no existe
  const exists = await prisma.tarifarioOnProducto.findUnique({
    where: { id_tarifario_id_producto: { id_tarifario: tarifario.id_tarifario, id_producto: producto.id_producto } }
  });
  if (!exists) {
    const asign = await prisma.tarifarioOnProducto.create({
      data: {
        id_tarifario: tarifario.id_tarifario,
        id_producto: producto.id_producto,
        precio: 15000,
        precio_unidad: 1500,
        precio_empaque: 15000
      }
    });
    console.log('Asignacion creada');
  } else {
    console.log('Asignacion ya existente');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
