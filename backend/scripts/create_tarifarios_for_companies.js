const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function parseArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1];
}

async function main() {
  const companiesArg = parseArg('--companies');
  if (!companiesArg) {
    console.log('Uso: node scripts/create_tarifarios_for_companies.js --companies 1,2');
    process.exit(1);
  }
  const empresaIds = companiesArg.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
  if (empresaIds.length === 0) {
    console.log('No hay empresas válidas en --companies');
    process.exit(1);
  }

  for (const id of empresaIds) {
    const empresa = await prisma.empresa.findUnique({ where: { id_empresa: id } });
    if (!empresa) {
      console.log(`Empresa id=${id} no encontrada, saltando.`);
      continue;
    }
    const existing = await prisma.tarifario.findFirst({ where: { id_empresa: id } });
    if (existing) {
      console.log(`Tarifario ya existe para empresa id=${id}: ${existing.id_tarifario} - ${existing.nombre}`);
      continue;
    }
    const nombre = `Tarifario ${empresa.nombre}`;
    const newT = await prisma.tarifario.create({ data: { nombre, id_empresa: id } });
    console.log(`Creado tarifario id=${newT.id_tarifario} para empresa id=${id} (${empresa.nombre})`);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
