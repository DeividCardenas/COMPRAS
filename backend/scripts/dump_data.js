const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function dump() {
  const outDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log('Dumping data to', outDir);

  const models = {
    empresas: () => prisma.empresa.findMany(),
    eps: () => prisma.ePS.findMany(),
    laboratorios: () => prisma.laboratorio.findMany(),
    tarifarios: () => prisma.tarifario.findMany(),
    productos: () => prisma.producto.findMany(),
    tarifarioOnProducto: () => prisma.tarifarioOnProducto.findMany(),
    empresaOnLaboratorio: () => prisma.empresaOnLaboratorio.findMany(),
  };

  for (const [name, fn] of Object.entries(models)) {
    try {
      console.log('Reading', name);
      const data = await fn();
      const file = path.join(outDir, `${name}.json`);
      fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Wrote ${data.length} rows to ${file}`);
    } catch (err) {
      console.error(`Failed to dump ${name}:`, err.message || err);
    }
  }

  await prisma.$disconnect();
  console.log('Dump complete.');
}

dump().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
