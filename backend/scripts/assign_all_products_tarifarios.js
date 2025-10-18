const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function parseArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1];
}

function parseListArg(arg) {
  if (!arg) return null;
  return arg.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
}

function randBetween(min, max) {
  return min + Math.random() * (max - min);
}

async function ensureTarifarioForEmpresa(empresaId) {
  // Prefer tarifario linked to the empresa
  let existing = await prisma.tarifario.findFirst({ where: { id_empresa: empresaId } });
  if (existing) return existing.id_tarifario;
  const empresa = await prisma.empresa.findUnique({ where: { id_empresa: empresaId } });
  const nombre = `Tarifario ${empresa?.nombre || empresaId}`;
  // Fallback: if a tarifario with the same name exists, reuse it
  existing = await prisma.tarifario.findFirst({ where: { nombre } });
  if (existing) return existing.id_tarifario;
  try {
    const created = await prisma.tarifario.create({ data: { nombre, id_empresa: empresaId } });
    return created.id_tarifario;
  } catch (err) {
    // If unique constraint failed due to race / name collision, try to find by name again
    const found = await prisma.tarifario.findFirst({ where: { nombre } });
    if (found) return found.id_tarifario;
    throw err;
  }
}

async function ensureTarifarioForEPS(epsId) {
  // Prefer tarifario linked to the eps
  let existing = await prisma.tarifario.findFirst({ where: { id_eps: epsId } });
  if (existing) return existing.id_tarifario;
  const eps = await prisma.ePS.findUnique({ where: { id_eps: epsId } });
  const nombre = `Tarifario ${eps?.nombre || `EPS-${epsId}`}`;
  // Fallback: if a tarifario with the same name exists, reuse it
  existing = await prisma.tarifario.findFirst({ where: { nombre } });
  if (existing) return existing.id_tarifario;
  try {
    const created = await prisma.tarifario.create({ data: { nombre, id_eps: epsId } });
    return created.id_tarifario;
  } catch (err) {
    const found = await prisma.tarifario.findFirst({ where: { nombre } });
    if (found) return found.id_tarifario;
    throw err;
  }
}

async function main() {
  const companiesArg = parseArg('--companies'); // e.g. 1,2,3
  const includeEps = process.argv.includes('--include-eps');
  const dry = process.argv.includes('--dry');
  const factorMin = Number(parseArg('--factorMin')) || 0.9;
  const factorMax = Number(parseArg('--factorMax')) || 1.2;

  const empresaIds = parseListArg(companiesArg) || null;

  console.log('Options:', { empresaIds, includeEps, dry, factorMin, factorMax });

  // collect target tarifarios
  const tarifarioIds = [];

  if (empresaIds && empresaIds.length > 0) {
    for (const eid of empresaIds) {
      const id = await ensureTarifarioForEmpresa(eid);
      tarifarioIds.push(id);
    }
  } else {
    // all empresas
    const empresas = await prisma.empresa.findMany({ select: { id_empresa: true } });
    for (const e of empresas) {
      const id = await ensureTarifarioForEmpresa(e.id_empresa);
      tarifarioIds.push(id);
    }
  }

  if (includeEps) {
    const epsList = await prisma.ePS.findMany({ select: { id_eps: true } });
    for (const ep of epsList) {
      const id = await ensureTarifarioForEPS(ep.id_eps);
      tarifarioIds.push(id);
    }
  }

  // dedupe
  const uniqueTarifarioIds = Array.from(new Set(tarifarioIds));
  console.log('Target tarifario ids:', uniqueTarifarioIds.slice(0, 20), uniqueTarifarioIds.length > 20 ? '...' : '');

  const products = await prisma.producto.findMany({ select: { id_producto: true, precio_presentacion: true, precio_unidad: true } });

  let created = 0;
  let skipped = 0;

  for (const p of products) {
    const basePresentacion = Number(p.precio_presentacion) || 0;
    const baseUnidad = Number(p.precio_unidad) || 0;

    for (const tid of uniqueTarifarioIds) {
      // check exists
      const exists = await prisma.tarifarioOnProducto.findFirst({ where: { id_tarifario: tid, id_producto: p.id_producto } });
      if (exists) {
        skipped++;
        continue;
      }

      const factor = randBetween(factorMin, factorMax);
      const precio = Math.round(basePresentacion * factor) || Math.round((baseUnidad || 1) * factor * 10);
      const precio_unidad = Math.round((baseUnidad || (precio / 10)) * factor);
      const precio_empaque = precio;

      if (dry) {
        console.log(`[dry] Would create: tarifario ${tid} -> producto ${p.id_producto} (precio ${precio})`);
        created++;
        continue;
      }

      await prisma.tarifarioOnProducto.create({ data: { id_tarifario: tid, id_producto: p.id_producto, precio, precio_unidad, precio_empaque } }).catch(err => {
        console.error('create error', err.message || err);
      });
      created++;
    }
  }

  console.log(`Done. Created: ${created}, Skipped (already existed): ${skipped}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
