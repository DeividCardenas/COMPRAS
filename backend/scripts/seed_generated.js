const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function readJSON(name) {
  const file = path.join(__dirname, '..', 'data', `${name}.json`);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

async function run() {
  console.log('Loading JSON data from backend/data');
  const labs = readJSON('laboratorios');
  const empresas = readJSON('empresas');
  const eps = readJSON('eps');
  const productos = readJSON('productos');
  const tarifarios = readJSON('tarifarios');
  const eOnL = readJSON('empresaOnLaboratorio');
  const tOnP = readJSON('tarifarioOnProducto');

  try {
    // Insert laboratorios
    if (labs.length) {
      const mapped = labs.map(l => ({ id_laboratorio: l.id_laboratorio, nombre: l.nombre }));
      console.log('Creating laboratorios:', mapped.length);
      await prisma.laboratorio.createMany({ data: mapped, skipDuplicates: true });
    }

    // Insert empresas
    if (empresas.length) {
      const mapped = empresas.map(e => ({ id_empresa: e.id_empresa, nombre: e.nombre }));
      console.log('Creating empresas:', mapped.length);
      await prisma.empresa.createMany({ data: mapped, skipDuplicates: true });
    }

    // Insert EPS
    if (eps.length) {
      const mapped = eps.map(e => ({ id_eps: e.id_eps, nombre: e.nombre }));
      console.log('Creating eps:', mapped.length);
      await prisma.ePS.createMany({ data: mapped, skipDuplicates: true });
    }

    // Insert productos
    if (productos.length) {
      const mapped = productos.map(p => ({
        id_producto: p.id_producto,
        cum: p.cum,
        descripcion: p.descripcion || null,
        concentracion: p.concentracion || null,
        presentacion: p.presentacion || null,
        registro_sanitario: p.registro_sanitario || null,
        id_laboratorio: p.id_laboratorio || null,
        precio_unidad: p.precio_unidad != null ? String(p.precio_unidad) : null,
        precio_presentacion: p.precio_presentacion != null ? String(p.precio_presentacion) : null,
        iva: p.iva != null ? String(p.iva) : null,
        regulacion: p.regulacion || null,
        codigo_barras: p.codigo_barras || null,
      }));
      console.log('Creating productos:', mapped.length);
      // createMany may fail if decimals are not accepted; Prisma accepts strings for Decimal
      await prisma.producto.createMany({ data: mapped, skipDuplicates: true });
    }

    // Insert tarifarios
    if (tarifarios.length) {
      const mapped = tarifarios.map(t => ({
        id_tarifario: t.id_tarifario,
        nombre: t.nombre,
        id_eps: t.id_eps || null,
        id_empresa: t.id_empresa || null,
      }));
      console.log('Creating tarifarios:', mapped.length);
      await prisma.tarifario.createMany({ data: mapped, skipDuplicates: true });
    }

    // EmpresaOnLaboratorio
    if (eOnL.length) {
      const mapped = eOnL.map(r => ({ id_empresa: r.id_empresa, id_laboratorio: r.id_laboratorio }));
      console.log('Creating empresaOnLaboratorio rows:', mapped.length);
      await prisma.empresaOnLaboratorio.createMany({ data: mapped, skipDuplicates: true });
    }

    // TarifarioOnProducto
    if (tOnP.length) {
      const mapped = tOnP.map(r => ({
        id_tarifario: r.id_tarifario,
        id_producto: r.id_producto,
        precio: r.precio != null ? r.precio : 0,
        precio_unidad: r.precio_unidad != null ? r.precio_unidad : null,
        precio_empaque: r.precio_empaque != null ? r.precio_empaque : null,
      }));
      console.log('Creating tarifarioOnProducto rows:', mapped.length);
      await prisma.tarifarioOnProducto.createMany({ data: mapped, skipDuplicates: true });
    }

    console.log('Seed generated complete.');
  } catch (err) {
    console.error('Seed failed:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
