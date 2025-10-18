const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function parseArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1];
}

async function main() {
  const idArg = parseArg('--id');
  const cumArg = parseArg('--cum');
  const companiesArg = parseArg('--companies'); // comma separated empresa ids
  const tarifariosArg = parseArg('--tarifarios'); // comma separated tarifario ids

  if (!idArg && !cumArg) {
    console.log('Uso: node scripts/assign_product_tarifarios.js --id <id_producto> | --cum <CUM> [--companies 1,2] [--tarifarios 10,11]');
    process.exit(1);
  }

  let product;
  if (idArg) {
    product = await prisma.producto.findUnique({ where: { id_producto: Number(idArg) } });
  } else {
    product = await prisma.producto.findUnique({ where: { cum: String(cumArg) } });
  }
  if (!product) {
    console.error('Producto no encontrado');
    await prisma.$disconnect();
    process.exit(1);
  }

  // Determine tarifario ids to assign
  const tarifarioIds = [];
  if (tarifariosArg) {
    tarifarioIds.push(...tarifariosArg.split(',').map(s => Number(s.trim())));
  }
  if (companiesArg) {
    const empresaIds = companiesArg.split(',').map(s => Number(s.trim()));
    for (const empId of empresaIds) {
      const t = await prisma.tarifario.findFirst({ where: { id_empresa: empId } });
      if (t) tarifarioIds.push(t.id_tarifario);
      else console.log(`No se encontró tarifario para empresa id=${empId}`);
    }
  }

  if (tarifarioIds.length === 0) {
    console.error('No se especificaron tarifarios ni se encontraron tarifarios para las empresas indicadas.');
    await prisma.$disconnect();
    process.exit(1);
  }

  // Use product prices as base
  const basePresentacion = Number(product.precio_presentacion || product.precio_presentacion || 0) || 0;
  const baseUnidad = Number(product.precio_unidad || product.precio_unidad || 0) || 0;

  for (const tid of tarifarioIds) {
    const exists = await prisma.tarifarioOnProducto.findUnique({ where: { id_tarifario_id_producto: { id_tarifario: tid, id_producto: product.id_producto } } });
    if (exists) {
      console.log(`Asignación ya existe para tarifario ${tid} y producto ${product.id_producto}`);
      continue;
    }

    // Simple price variant: add small random delta so companies show different prices
    const factor = 0.9 + Math.random() * 0.3; // 0.9 .. 1.2
    const precio = Math.round(basePresentacion * factor);
    const precio_unidad = Math.round(baseUnidad * factor || Math.round((precio) / 10));
    const precio_empaque = precio;

    await prisma.tarifarioOnProducto.create({ data: { id_tarifario: tid, id_producto: product.id_producto, precio, precio_unidad, precio_empaque } });
    console.log(`Creada asignación: tarifario ${tid} -> producto ${product.id_producto} (precio ${precio})`);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
