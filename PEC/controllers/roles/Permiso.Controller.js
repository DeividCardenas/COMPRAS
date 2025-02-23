/**
 * @author Deivid Cardenas
 * @version 1.1.0
 * 
 * Controlador de permisos
 * Este archivo define los controladores de permisos, incluyendo fechas de creación y actualización.
 */

const { response, request } = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mostrar todos los permisos con paginación y búsqueda
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

// Crear un permiso sin asignarlo a un rol
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

// Mostrar un solo permiso por id
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

// Editar un permiso
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

// Eliminar un permiso
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
