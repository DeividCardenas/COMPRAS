const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const term = process.argv[2];
  if (!term) {
    console.log('Uso: node scripts/check_product_compare.js "texto de búsqueda"');
    process.exit(1);
  }

  console.log(`Buscando productos que contengan: "${term}"`);
  const prods = await prisma.producto.findMany({
    where: { descripcion: { contains: term } },
    select: { id_producto: true, cum: true, descripcion: true, presentacion: true, laboratorio: { select: { nombre: true } } }
  });

  if (!prods || prods.length === 0) {
    console.log('No se encontraron productos con ese texto.');
    await prisma.$disconnect();
    return;
  }

  for (const p of prods) {
    console.log('------------------------------------------------------');
    console.log(`Producto: ${p.descripcion}`);
    console.log(`id_producto: ${p.id_producto}  cum: ${p.cum}`);
    console.log(`presentacion: ${p.presentacion}  laboratorio: ${p.laboratorio?.nombre || '-'}\n`);

    const rows = await prisma.tarifarioOnProducto.findMany({
      where: { id_producto: p.id_producto },
      include: { tarifario: { include: { empresa: true, eps: true } } }
    });

    console.log(`TarifarioOnProducto encontrados: ${rows.length}`);
    if (rows.length === 0) {
      console.log('-> No hay asignaciones (TarifarioOnProducto) para este producto.');
    } else {
      const empresasSet = new Set();
      rows.forEach(r => {
        const emp = r.tarifario?.empresa;
        const eps = r.tarifario?.eps;
        console.log(`- tarifario: ${r.tarifario?.nombre || '-'} | empresa: ${emp ? `${emp.id_empresa} - ${emp.nombre}` : '-'} | eps: ${eps ? `${eps.id_eps} - ${eps.nombre}` : '-'} | precio: ${r.precio}`);
        if (emp) empresasSet.add(emp.id_empresa);
        if (eps) empresasSet.add(`eps:${eps.id_eps}`);
      });

      const empresas = Array.from(empresasSet).filter(x => !String(x).startsWith('eps:'));
      console.log('\nEmpresas detectadas en tarifas para este producto:', empresas.join(', ') || '(ninguna)');

      console.log('\nEjemplos de comandos curl para probar compare:');
      console.log(`curl "http://localhost:2000/pec/compare/producto/0?cum=${p.cum}&empresaIds=${empresas.join(',')}"`);
      console.log(`curl "http://localhost:2000/pec/debug/tarifario-producto/${p.id_producto}"`);
    }
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
