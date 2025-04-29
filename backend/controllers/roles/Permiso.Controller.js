/**
 * Controlador de Permisos
 * Este archivo define las operaciones CRUD para los permisos del sistema.
 * Incluye paginación, búsqueda por nombre, y soporte para gestión individual.
 */

const { response, request } = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Obtener una lista de permisos con paginación y filtro opcional por nombre.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns {JSON} - Lista de permisos paginados y número total de registros.
 */
const MostrarPermisos = async (req = request, res = response) => {
    const { page = 1, limit = 10, nombre } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = nombre ? { nombre: { contains: nombre } } : {};

    try {
        const permisos = await prisma.permiso.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
        });

        const total = await prisma.permiso.count({ where });

        res.json({
            total,
            page: Number(page),
            limit: Number(limit),
            permisos
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Crear un nuevo permiso en la base de datos.
 * @param {Request} req - Objeto de solicitud HTTP con el campo 'nombre'.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns {JSON} - El permiso creado.
 */
const CrearPermiso = async (req = request, res = response) => {
    let { nombre } = req.body;

    try {
        const permiso = await prisma.permiso.create({
            data: { nombre }
        });

        res.json({ permiso });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Obtener un permiso específico por su ID.
 * @param {Request} req - Objeto de solicitud HTTP con el parámetro 'id_permiso'.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns {JSON} - El permiso encontrado o mensaje de error.
 */
const MostrarPermiso = async (req = request, res = response) => {
    const { id_permiso } = req.params;

    try {
        const permiso = await prisma.permiso.findUnique({
            where: { id_permiso: Number(id_permiso) }
        });

        if (permiso) {
            res.json({ permiso });
        } else {
            res.status(404).json({ msg: "Permiso no encontrado" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Actualizar los datos de un permiso existente.
 * @param {Request} req - Objeto de solicitud HTTP con el parámetro 'id_permiso' y el campo 'nombre'.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns {JSON} - El permiso actualizado.
 */
const EditarPermiso = async (req = request, res = response) => {
    const { id_permiso } = req.params;
    const { nombre } = req.body;

    try {
        const permiso = await prisma.permiso.update({
            where: { id_permiso: Number(id_permiso) },
            data: { nombre }
        });

        res.json({ permiso });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Eliminar un permiso por su ID.
 * @param {Request} req - Objeto de solicitud HTTP con el parámetro 'id_permiso'.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns {JSON} - Mensaje de éxito o error.
 */
const EliminarPermiso = async (req = request, res = response) => {
    const { id_permiso } = req.params;

    try {
        await prisma.permiso.delete({
            where: { id_permiso: Number(id_permiso) }
        });
        res.json({ msg: "Permiso eliminado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    MostrarPermisos,
    CrearPermiso,
    MostrarPermiso,
    EditarPermiso,
    EliminarPermiso
};
