/**
 * @author Deivid Cardenas
 * @version 1.0.0
 *
 * Controlador de Permisos sobre Tarifarios
 * Este archivo define los controladores para la gestión de permisos sobre tarifarios
 */

const { response, request } = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Obtener todos los permisos asignados a tarifarios con paginación y búsqueda opcional por permiso o tarifario
const MostrarPermisosEnTarifarios = async (req = request, res = response) => {
    const { page = 1, limit = 10, permisoId, tarifarioId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where = {};
    if (permisoId) where.id_permiso = Number(permisoId);
    if (tarifarioId) where.id_tarifario = Number(tarifarioId);

    try {
        const permisos = await prisma.permisoOnTarifario.findMany({
            where,
            skip,
            take: Number(limit),
            include: {
                permiso: true,
                tarifario: true
            },
            orderBy: { createdAt: "desc" }
        });

        const total = await prisma.permisoOnTarifario.count({ where });

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

const AsignarPermisoATarifario = async (req = request, res = response) => {
    const { permisoId, tarifarioId, descripcion } = req.body;

    if (!permisoId || !tarifarioId || !descripcion) {
        return res.status(400).json({ error: "permisoId, tarifarioId y descripcion son requeridos" });
    }

    try {
        // Verificar si el permiso y el tarifario existen
        const permiso = await prisma.permiso.findUnique({ where: { id_permiso: Number(permisoId) } });
        const tarifario = await prisma.tarifario.findUnique({ where: { id_tarifario: Number(tarifarioId) } });

        if (!permiso) return res.status(404).json({ error: "El permiso no existe" });
        if (!tarifario) return res.status(404).json({ error: "El tarifario no existe" });

        // Verificar si la asignación ya existe
        const asignacionExistente = await prisma.permisoOnTarifario.findFirst({
            where: {
                id_permiso: Number(permisoId),
                id_tarifario: Number(tarifarioId)
            }
        });

        if (asignacionExistente) {
            return res.status(400).json({ error: "El permiso ya está asignado a este tarifario" });
        }

        // Asignar el permiso al tarifario
        const nuevaAsignacion = await prisma.permisoOnTarifario.create({
            data: {
                id_permiso: Number(permisoId),
                id_tarifario: Number(tarifarioId),
                descripcion
            }
        });

        res.json({ mensaje: "Permiso asignado correctamente", asignacion: nuevaAsignacion });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener un permiso específico asignado a un tarifario
const MostrarPermisoEnTarifario = async (req = request, res = response) => {
    const { permisoId, tarifarioId } = req.params;

    try {
        const permisoTarifario = await prisma.permisoOnTarifario.findUnique({
            where: {
                id_permiso_id_tarifario: {
                    id_permiso: Number(permisoId),
                    id_tarifario: Number(tarifarioId)
                }
            },
            include: {
                permiso: true,
                tarifario: true
            }
        });

        if (permisoTarifario) {
            res.json({ permisoTarifario });
        } else {
            res.status(404).json({ msg: "Permiso en tarifario no encontrado" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Editar la descripción de un permiso asignado a un tarifario
const EditarPermisoEnTarifario = async (req = request, res = response) => {
    const { permisoId, tarifarioId } = req.params;
    const { descripcion } = req.body;

    try {
        const permisoTarifario = await prisma.permisoOnTarifario.update({
            where: {
                id_permiso_id_tarifario: {
                    id_permiso: Number(permisoId),
                    id_tarifario: Number(tarifarioId)
                }
            },
            data: { descripcion }
        });

        res.json({ mensaje: "Descripción actualizada correctamente", permisoTarifario });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar un permiso de un tarifario
const EliminarPermisoDeTarifario = async (req = request, res = response) => {
    const { permisoId, tarifarioId } = req.params;

    try {
        await prisma.permisoOnTarifario.delete({
            where: {
                id_permiso_id_tarifario: {
                    id_permiso: Number(permisoId),
                    id_tarifario: Number(tarifarioId)
                }
            }
        });

        res.json({ msg: "Permiso eliminado del tarifario correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    MostrarPermisosEnTarifarios,
    AsignarPermisoATarifario,
    MostrarPermisoEnTarifario,
    EditarPermisoEnTarifario,
    EliminarPermisoDeTarifario
};
