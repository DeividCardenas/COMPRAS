const { validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Validadores sencillos como middleware
const validarProveedor = (req, res, next) => {
  const { laboratorio, tipo, titular } = req.body || {};
  const errores = [];
  if (!laboratorio || String(laboratorio).trim() === '') errores.push({ msg: 'laboratorio es obligatorio', param: 'laboratorio' });
  if (!tipo || String(tipo).trim() === '') errores.push({ msg: 'tipo es obligatorio', param: 'tipo' });
  if (!titular || String(titular).trim() === '') errores.push({ msg: 'titular es obligatorio', param: 'titular' });
  if (errores.length > 0) return res.status(400).json({ errores });
  next();
};

const validarEdicionProveedor = (req, res, next) => {
  const { id_proveedor } = req.params;
  if (!id_proveedor || isNaN(Number(id_proveedor))) return res.status(400).json({ errores: [{ msg: 'id_proveedor inválido', param: 'id_proveedor' }] });
  next();
};

// Mostrar proveedores (mock/paginado básico)
const MostrarProveedores = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const q = (req.query.search || '').toString().trim();

    const where = {};
    if (q) {
      where.OR = [
        { laboratorio: { contains: q, mode: 'insensitive' } },
        { tipo: { contains: q, mode: 'insensitive' } },
        { titular: { contains: q, mode: 'insensitive' } },
      ];
    }

    const totalProviders = await prisma.proveedor.count({ where });
    const providers = await prisma.proveedor.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { creado_en: 'desc' },
    });

    const totalPages = Math.ceil(totalProviders / limit) || 0;

    return res.status(200).json({ providers, totalProviders, currentPage: page, totalPages, pageSize: limit });
  } catch (error) {
    console.error('Error en MostrarProveedores:', error);
    return res.status(500).json({ msg: 'Error interno al obtener proveedores' });
  }
};

// Crear proveedor (mock)
const CrearProveedor = async (req, res) => {
  try {
    const { laboratorio, tipo, titular, direccion, telefono, email } = req.body;

    const created = await prisma.proveedor.create({
      data: {
        laboratorio: laboratorio || null,
        tipo: tipo || null,
        titular: titular || null,
        direccion: direccion || null,
        telefono: telefono || null,
        email: email || null,
      },
    });

    return res.status(201).json({ mensaje: 'Proveedor creado', proveedor: created });
  } catch (error) {
    console.error('Error en CrearProveedor:', error);
    return res.status(500).json({ msg: 'Error interno al crear proveedor' });
  }
};

const EditarProveedor = async (req, res) => {
  try {
    const { id_proveedor } = req.params;
    const payload = req.body;

    const updated = await prisma.proveedor.update({
      where: { id_proveedor: Number(id_proveedor) },
      data: {
        laboratorio: payload.laboratorio ?? undefined,
        tipo: payload.tipo ?? undefined,
        titular: payload.titular ?? undefined,
        direccion: payload.direccion ?? undefined,
        telefono: payload.telefono ?? undefined,
        email: payload.email ?? undefined,
      },
    });

    return res.status(200).json({ mensaje: 'Proveedor actualizado', proveedor: updated });
  } catch (error) {
    console.error('Error en EditarProveedor:', error);
    return res.status(500).json({ msg: 'Error interno al editar proveedor' });
  }
};

const EliminarProveedor = async (req, res) => {
  try {
    const { id_proveedor } = req.params;
    await prisma.proveedor.delete({ where: { id_proveedor: Number(id_proveedor) } });
    return res.status(200).json({ mensaje: `Proveedor ${id_proveedor} eliminado` });
  } catch (error) {
    console.error('Error en EliminarProveedor:', error);
    return res.status(500).json({ msg: 'Error interno al eliminar proveedor' });
  }
};

module.exports = {
  MostrarProveedores,
  CrearProveedor,
  EditarProveedor,
  EliminarProveedor,
  validarProveedor,
  validarEdicionProveedor,
};
