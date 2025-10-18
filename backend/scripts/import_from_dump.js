const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function readJSON(name) {
  const file = path.join(__dirname, '..', 'data', `${name}.json`);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

async function upsertEmpresas(empresas) {
  for (const e of empresas) {
    // Empresa.nombre es unique en schema, usamos ese campo para upsert
    const where = { nombre: e.nombre };
    const data = {
      nombre: e.nombre,
      direccion: e.direccion || null,
      telefono: e.telefono || null,
    };
    // nit no está en schema como campo obligatorio, lo guardamos si existe
    if (e.nit) data.nit = e.nit;
    await prisma.empresa.upsert({ where, update: data, create: data }).catch(err => console.error('empresa upsert:', err.message));
  }
}

async function upsertEPS(epsList) {
  for (const e of epsList) {
    // EPS.nombre es unique
    const where = { nombre: e.nombre };
    const data = { nombre: e.nombre };
    if (e.nit) data.nit = e.nit;
    await prisma.ePS.upsert({ where, update: data, create: data }).catch(err => console.error('eps upsert:', err.message));
  }
}

async function upsertLaboratorios(labs) {
  for (const l of labs) {
    // Laboratorio.nombre no es unique en schema, usamos findFirst/create para evitar upsert en campo no-unique
    const existing = await prisma.laboratorio.findFirst({ where: { nombre: l.nombre } });
    if (existing) continue;
    await prisma.laboratorio.create({ data: { nombre: l.nombre } }).catch(err => console.error('lab create:', err.message));
  }
}

async function upsertProductos(products) {
  for (const p of products) {
    // Producto.cum es unique
    if (!p.cum) {
      console.warn('Skipping producto sin cum:', p);
      continue;
    }
    const where = { cum: p.cum };
    const data = {
      descripcion: p.descripcion || null,
      cum: p.cum,
      concentracion: p.concentracion || null,
      presentacion: p.presentacion || null,
      registro_sanitario: p.registro_sanitario || null,
      precio_unidad: p.precio_unidad || null,
      precio_presentacion: p.precio_presentacion || null,
      iva: p.iva || null,
      regulacion: p.regulacion || null,
      codigo_barras: p.codigo_barras || null,
    };
    // link laboratorio if id_laboratorio present
    if (p.id_laboratorio) data.id_laboratorio = p.id_laboratorio;
    await prisma.producto.upsert({ where, update: data, create: data }).catch(err => console.error('producto upsert:', err.message));
  }
}

async function upsertTarifarios(tarifarios) {
  for (const t of tarifarios) {
    // Tarifario.nombre es unique en schema
    let empresaId = t.id_empresa || t.empresaId || null;
    if (!empresaId && t.empresaNombre) {
      const e = await prisma.empresa.findFirst({ where: { nombre: t.empresaNombre } });
      if (e) empresaId = e.id_empresa;
    }
    // eps
    let epsId = t.id_eps || t.epsId || null;
    if (!epsId && t.epsNombre) {
      const ep = await prisma.ePS.findFirst({ where: { nombre: t.epsNombre } });
      if (ep) epsId = ep.id_eps;
    }

    const where = { nombre: t.nombre };
    const data = {
      nombre: t.nombre,
      id_empresa: empresaId || null,
      id_eps: epsId || null,
      descripcion: t.descripcion || null,
    };
    await prisma.tarifario.upsert({ where, update: data, create: data }).catch(err => console.error('tarifario upsert:', err.message));
  }
}

async function upsertTarifarioOnProducto(rows) {
  for (const r of rows) {
    // find producto by cum or id
    let producto = null;
    if (r.id_producto) producto = await prisma.producto.findUnique({ where: { id_producto: r.id_producto } });
    if (!producto && r.productoId) producto = await prisma.producto.findUnique({ where: { id_producto: r.productoId } });
    if (!producto && r.cum) producto = await prisma.producto.findUnique({ where: { cum: r.cum } });
    if (!producto) {
      console.warn('Skipping tarifarioOnProducto (producto not found):', r);
      continue;
    }

    // ensure tarifario exists
    const tarifario = await prisma.tarifario.findUnique({ where: { id_tarifario: r.id_tarifario || r.tarifarioId } }).catch(() => null);
    if (!tarifario) {
      console.warn('Skipping tarifarioOnProducto (tarifario not found):', r.tarifarioId);
      continue;
    }

    // upsert by composite keys id_tarifario + id_producto
    const idTar = tarifario.id_tarifario;
    const idProd = producto.id_producto;
    const exists = await prisma.tarifarioOnProducto.findFirst({ where: { id_tarifario: idTar, id_producto: idProd } });
    const data = { id_tarifario: idTar, id_producto: idProd, precio: r.precio || 0, precio_unidad: r.precio_unidad || null, precio_empaque: r.precio_empaque || null };
    if (exists) {
      await prisma.tarifarioOnProducto.update({ where: { id_tarifario_id_producto: { id_tarifario: idTar, id_producto: idProd } }, data }).catch(err => console.error('tOnP update:', err.message));
    } else {
      await prisma.tarifarioOnProducto.create({ data }).catch(err => console.error('tOnP create:', err.message));
    }
  }
}

async function upsertEmpresaOnLaboratorio(rows) {
  for (const r of rows) {
    // try find empresa by id or nombre
    let empresaId = r.id_empresa || r.empresaId || null;
    if (!empresaId && r.empresaNombre) {
      const e = await prisma.empresa.findFirst({ where: { nombre: r.empresaNombre } });
      if (e) empresaId = e.id_empresa;
    }
    if (!empresaId) {
      console.warn('Skipping empresaOnLaboratorio (no empresa):', r);
      continue;
    }
    // find laboratorio
    let laboratorioId = r.id_laboratorio || r.laboratorioId || null;
    if (!laboratorioId && r.laboratorioNombre) {
      const l = await prisma.laboratorio.findFirst({ where: { nombre: r.laboratorioNombre } });
      if (l) laboratorioId = l.id_laboratorio;
    }
    if (!laboratorioId) {
      console.warn('Skipping empresaOnLaboratorio (no laboratorio):', r);
      continue;
    }

    const exists = await prisma.empresaOnLaboratorio.findFirst({ where: { id_empresa: empresaId, id_laboratorio: laboratorioId } });
    if (!exists) {
      await prisma.empresaOnLaboratorio.create({ data: { id_empresa: empresaId, id_laboratorio: laboratorioId } }).catch(err => console.error('eOnL create:', err.message));
    }
  }
}

async function main() {
  console.log('Reading data from backend/data');
  const empresas = readJSON('empresas');
  const eps = readJSON('eps');
  const laboratorios = readJSON('laboratorios');
  const tarifarios = readJSON('tarifarios');
  const productos = readJSON('productos');
  const tOnP = readJSON('tarifarioOnProducto');
  const eOnL = readJSON('empresaOnLaboratorio');

  await upsertEmpresas(empresas);
  await upsertEPS(eps);
  await upsertLaboratorios(laboratorios);
  await upsertProductos(productos);
  await upsertTarifarios(tarifarios);
  await upsertTarifarioOnProducto(tOnP);
  await upsertEmpresaOnLaboratorio(eOnL);

  console.log('Import complete.');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  prisma.$disconnect();
});
