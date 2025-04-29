/**
 * Controlador de Roles
 * Este archivo define los controladores para la gestión de roles dentro del sistema.
 * Incluye funciones para mostrar, crear, editar y eliminar roles,
 */

const { response, request } = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Obtiene todos los roles del sistema con soporte de paginación y búsqueda opcional por nombre.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns {JSON} Lista de roles con información de paginación.
 */
const MostrarRoles = async (req = request, res = response) => {
    const { page = 1, limit = 10, nombre } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = nombre ? { nombre: { contains: nombre } } : {};

    try {
        const roles = await prisma.rol.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                permisos: {
                    include: { permiso: true }
                }
            }
        });

        const total = await prisma.rol.count({ where });

        res.json({
            total,
            page: Number(page),
            limit: Number(limit),
            roles
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Crea un nuevo rol en el sistema.
 * @param {Request} req - Objeto de solicitud HTTP con el nombre del rol en el cuerpo.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns {JSON} Objeto del rol creado.
 */
const CrearRol = async (req = request, res = response) => {
    const { nombre } = req.body;

    try {
        const rol = await prisma.rol.create({
            data: { nombre }
        });

        res.json({ rol });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Obtiene un rol específico por su ID, incluyendo sus permisos asignados.
 * @param {Request} req - Objeto de solicitud HTTP con el ID del rol como parámetro.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns {JSON} Detalle del rol encontrado o mensaje de error.
 */
const MostrarRol = async (req = request, res = response) => {
    const { id_rol } = req.params;

    try {
        const rol = await prisma.rol.findUnique({
            where: { id_rol: Number(id_rol) },
            include: {
                permisos: {
                    include: { permiso: true }
                }
            }
        });

        if (rol) {
            res.json({ rol });
        } else {
            res.status(404).json({ msg: "Rol no encontrado" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Actualiza el nombre de un rol existente.
 * @param {Request} req - Objeto de solicitud HTTP con el ID del rol como parámetro y el nuevo nombre en el cuerpo.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns {JSON} Objeto del rol actualizado.
 */
const EditarRol = async (req = request, res = response) => {
    const { id_rol } = req.params;
    const { nombre } = req.body;

    try {
        const rol = await prisma.rol.update({
            where: { id_rol: Number(id_rol) },
            data: { nombre }
        });

        res.json({ rol });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Elimina un rol del sistema por su ID.
 * @param {Request} req - Objeto de solicitud HTTP con el ID del rol como parámetro.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns {JSON} Mensaje de confirmación de eliminación.
 */
const EliminarRol = async (req = request, res = response) => {
    const { id_rol } = req.params;

    try {
        await prisma.rol.delete({
            where: { id_rol: Number(id_rol) }
        });

        res.json({ msg: "Rol eliminado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    MostrarRoles,
    CrearRol,
    MostrarRol,
    EditarRol,
    EliminarRol,
};
