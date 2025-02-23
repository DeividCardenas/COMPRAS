/**
 * @author Deivid Cardenas
 * @version 1.0.0
 *
 * Controlador de roles
 * Este archivo define los controladores de roles
 */

const { response, request } = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Obtener todos los roles con paginación y búsqueda por nombre
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

// Crear un nuevo rol
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

// Obtener un solo rol por ID con sus permisos
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

// Editar un rol
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

// Eliminar un rol
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
