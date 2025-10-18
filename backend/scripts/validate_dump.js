const fs = require('fs');
const path = require('path');

function readJSON(name) {
  const file = path.join(__dirname, '..', 'data', `${name}.json`);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function validate() {
  const empresas = readJSON('empresas');
  const eps = readJSON('eps');
  const labs = readJSON('laboratorios');
  const productos = readJSON('productos');
  const tarifarios = readJSON('tarifarios');
  const tOnP = readJSON('tarifarioOnProducto');
  const eOnL = readJSON('empresaOnLaboratorio');

  const empresaIds = new Set(empresas.map(e => e.id_empresa));
  const epsIds = new Set(eps.map(e => e.id_eps));
  const labIds = new Set(labs.map(l => l.id_laboratorio));
  const productoIds = new Set(productos.map(p => p.id_producto));
  const tarifarioIds = new Set(tarifarios.map(t => t.id_tarifario));

  const errors = [];

  // Check tarifarios reference
  for (const t of tarifarios) {
    if (t.id_empresa && !empresaIds.has(t.id_empresa)) errors.push(`Tarifario ${t.id_tarifario} references missing empresa ${t.id_empresa}`);
    if (t.id_eps && !epsIds.has(t.id_eps)) errors.push(`Tarifario ${t.id_tarifario} references missing eps ${t.id_eps}`);
  }

  // productos laboratorio
  for (const p of productos) {
    if (p.id_laboratorio && !labIds.has(p.id_laboratorio)) errors.push(`Producto ${p.id_producto} references missing laboratorio ${p.id_laboratorio}`);
  }

  // tarifarioOnProducto
  for (const r of tOnP) {
    if (!tarifarioIds.has(r.id_tarifario)) errors.push(`TarifarioOnProducto references missing tarifario ${r.id_tarifario}`);
    if (!productoIds.has(r.id_producto)) errors.push(`TarifarioOnProducto references missing producto ${r.id_producto}`);
  }

  // empresaOnLaboratorio
  for (const r of eOnL) {
    if (!empresaIds.has(r.id_empresa)) errors.push(`EmpresaOnLaboratorio references missing empresa ${r.id_empresa}`);
    if (!labIds.has(r.id_laboratorio)) errors.push(`EmpresaOnLaboratorio references missing laboratorio ${r.id_laboratorio}`);
  }

  if (errors.length) {
    console.error('Validation failed:');
    for (const e of errors) console.error(' -', e);
    process.exitCode = 2;
  } else {
    console.log('Validation passed: all referenced ids present.');
  }
}

validate();
