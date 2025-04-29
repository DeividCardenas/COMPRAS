/**
 * Controlador de Permisos sobre Tarifarios
 * Incluye funciones para mostrar, asignar, editar y eliminar permisos en tarifarios.
 * 
 */

const { response, request } = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Obtiene una lista paginada de permisos asignados a tarifarios.
 * Se puede filtrar por `permisoId` o `tarifarioId`.
 * 
 * Query Params:
 * - `page`: número de página (por defecto 1)
 * - `limit`: cantidad de resultados por página (por defecto 10)
 * - `permisoId`: (opcional) ID del permiso
 * - `tarifarioId`: (opcional) ID del tarifario
 * 
 * @param {Request} req - Objeto de solicitud HTTP
 * @param {Response} res - Objeto de respuesta HTTP
 */
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

/**
 * Asigna un permiso a un tarifario específico.
 * 
 * Body Params:
 * - `permisoId`: ID del permiso
 * - `tarifarioId`: ID del tarifario
 * - `descripcion`: descripción del permiso en ese tarifario
 * 
 * Validaciones:
 * - El permiso y el tarifario deben existir
 * - La asignación no debe existir previamente
 * 
 * @param {Request} req - Objeto de solicitud HTTP
 * @param {Response} res - Objeto de respuesta HTTP
 */
const AsignarPermisoATarifario = async (req = request, res = response) => {
    const { permisoId, tarifarioId, descripcion } = req.body;

    if (!permisoId || !tarifarioId || !descripcion) {
        return res.status(400).json({ error: "permisoId, tarifarioId y descripcion son requeridos" });
    }

    try {
        const permiso = await prisma.permiso.findUnique({ where: { id_permiso: Number(permisoId) } });
        const tarifario = await prisma.tarifario.findUnique({ where: { id_tarifario: Number(tarifarioId) } });

        if (!permiso) return res.status(404).json({ error: "El permiso no existe" });
        if (!tarifario) return res.status(404).json({ error: "El tarifario no existe" });

        const asignacionExistente = await prisma.permisoOnTarifario.findFirst({
            where: {
                id_permiso: Number(permisoId),
                id_tarifario: Number(tarifarioId)
            }
        });

        if (asignacionExistente) {
            return res.status(400).json({ error: "El permiso ya está asignado a este tarifario" });
        }

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

/**
 * Muestra la información de un permiso específico asignado a un tarifario.
 * 
 * Params:
 * - `permisoId`: ID del permiso
 * - `tarifarioId`: ID del tarifario
 * 
 * @param {Request} req - Objeto de solicitud HTTP
 * @param {Response} res - Objeto de respuesta HTTP
 */
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

/**
 * Edita la descripción de un permiso previamente asignado a un tarifario.
 * 
 * Params:
 * - `permisoId`: ID del permiso
 * - `tarifarioId`: ID del tarifario
 * 
 * Body:
 * - `descripcion`: nueva descripción
 * 
 * @param {Request} req - Objeto de solicitud HTTP
 * @param {Response} res - Objeto de respuesta HTTP
 */
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

/**
 * Elimina un permiso previamente asignado a un tarifario.
 * 
 * Params:
 * - `permisoId`: ID del permiso
 * - `tarifarioId`: ID del tarifario
 * 
 * @param {Request} req - Objeto de solicitud HTTP
 * @param {Response} res - Objeto de respuesta HTTP
 */
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
