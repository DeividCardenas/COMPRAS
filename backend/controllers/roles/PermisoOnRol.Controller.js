/**
 * Controlador de Roles
 * Este archivo define los controladores para asignar y remover permisos de los roles.
 */

const { response, request } = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Asigna uno o varios permisos a un rol específico.
 * 
 * Requiere en el cuerpo de la solicitud:
 * - `rolId`: ID del rol
 * - `permisos`: Array de IDs de permisos a asignar
 * 
 * Validaciones:
 * - El rol debe existir.
 * - Todos los permisos deben existir.
 * - Evita duplicados (no vuelve a asignar permisos ya vinculados).
 * 
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns {JSON} - Mensaje de éxito, rol y permisos asignados o mensaje de error.
 */
const AsignarPermisosARol = async (req = request, res = response) => {
    const { rolId, permisos } = req.body;

    if (!rolId || !Array.isArray(permisos) || permisos.length === 0) {
        return res.status(400).json({ error: "id_rol y un array de permisos son requeridos" });
    }

    try {
        // Verificar si el rol existe
        const rol = await prisma.rol.findUnique({ 
            where: { id_rol: Number(rolId) },
            select: { id_rol: true, nombre: true }
        });

        if (!rol) return res.status(404).json({ error: "El rol no existe" });

        // Verificar existencia de permisos
        const permisosExistentes = await prisma.permiso.findMany({
            where: { id_permiso: { in: permisos.map(Number) } },
            select: { id_permiso: true, nombre: true }
        });

        if (permisosExistentes.length !== permisos.length) {
            return res.status(404).json({ error: "Uno o más permisos no existen" });
        }

        // Obtener permisos ya asignados
        const permisosAsignados = await prisma.permisoOnRol.findMany({
            where: {
                id_rol: Number(rolId),
                id_permiso: { in: permisos.map(Number) }
            },
            select: { id_permiso: true }
        });

        const permisosYaAsignados = permisosAsignados.map(p => p.id_permiso);
        const nuevosPermisos = permisosExistentes.filter(p => !permisosYaAsignados.includes(p.id_permiso));

        if (nuevosPermisos.length === 0) {
            return res.status(400).json({ error: "Todos los permisos ya están asignados al rol" });
        }

        // Asignar permisos nuevos
        await prisma.permisoOnRol.createMany({
            data: nuevosPermisos.map(p => ({
                id_rol: Number(rolId),
                id_permiso: p.id_permiso
            })),
            skipDuplicates: true
        });

        res.json({ 
            msg: "Permisos asignados correctamente",
            rol,
            permisos_asignados: nuevosPermisos
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al asignar permisos" });
    }
};

/**
 * Remueve un permiso asignado a un rol.
 * 
 * Requiere en el cuerpo de la solicitud:
 * - `rolId`: ID del rol
 * - `permisoId`: ID del permiso a remover
 * 
 * Validaciones:
 * - Verifica que la relación entre el rol y el permiso exista.
 * 
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns {JSON} - Mensaje de éxito o error.
 */
const RemoverPermisoDeRol = async (req = request, res = response) => {
    const { rolId, permisoId } = req.body;

    if (!rolId || !permisoId) {
        return res.status(400).json({ error: "rolId y permisoId son requeridos" });
    }

    try {
        const permisoRol = await prisma.permisoOnRol.findUnique({
            where: {
                id_rol_id_permiso: {
                    id_rol: Number(rolId),
                    id_permiso: Number(permisoId)
                }
            }
        });

        if (!permisoRol) {
            return res.status(404).json({ error: "El permiso no está asignado a este rol" });
        }

        await prisma.permisoOnRol.delete({
            where: {
                id_rol_id_permiso: {
                    id_rol: Number(rolId),
                    id_permiso: Number(permisoId)
                }
            }
        });

        res.json({ msg: "Permiso eliminado del rol correctamente" });
    } catch (err) {
        console.error("Error al remover permiso del rol:", err); 
        res.status(500).json({ error: "Error al remover permiso del rol", details: err.message });
    }
};

module.exports = {
    AsignarPermisosARol,
    RemoverPermisoDeRol
};
