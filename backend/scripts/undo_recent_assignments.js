const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function parseArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1];
}

function parseIntArg(name) {
  const v = parseArg(name);
  if (!v) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

async function main() {
  const since = parseArg('--since'); // ISO timestamp
  const minutes = parseIntArg('--minutes'); // last N minutes

  let cutoff;
  if (since) {
    cutoff = new Date(since);
    if (isNaN(cutoff)) {
      console.error('--since value is not a valid date');
      process.exit(1);
    }
  } else if (minutes) {
    cutoff = new Date(Date.now() - minutes * 60 * 1000);
  } else {
    console.error('Usage: node undo_recent_assignments.js --since "2025-10-17T03:00:00Z" OR --minutes 60');
    process.exit(1);
  }

  console.log('Deleting TarifarioOnProducto rows created after:', cutoff.toISOString());

  const rows = await prisma.tarifarioOnProducto.findMany({ where: { createdAt: { gt: cutoff } } });
  console.log('Found', rows.length, 'rows to delete. Example:', rows.slice(0,5));

  if (rows.length === 0) {
    console.log('Nothing to delete.');
    await prisma.$disconnect();
    return;
  }

  // Confirm prompt
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Are you sure you want to DELETE these rows? Type YES to confirm: ', async (answer) => {
    rl.close();
    if (answer !== 'YES') {
      console.log('Aborted by user.');
      await prisma.$disconnect();
      return;
    }

    // Delete in batches by composite key
    let deleted = 0;
    for (const r of rows) {
      try {
        await prisma.tarifarioOnProducto.delete({ where: { id_tarifario_id_producto: { id_tarifario: r.id_tarifario, id_producto: r.id_producto } } });
        deleted++;
      } catch (err) {
        console.error('Failed to delete', r, err.message || err);
      }
    }

    console.log(`Deleted ${deleted} rows.`);
    await prisma.$disconnect();
  });
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
