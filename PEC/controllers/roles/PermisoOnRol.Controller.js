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

// Asignar un permiso a un rol
const AsignarPermisosARol = async (req = request, res = response) => {
    const { rolId, permisos } = req.body; // permisos es un array de id_permiso

    if (!rolId || !Array.isArray(permisos) || permisos.length === 0) {
        return res.status(400).json({ error: "id_rol y un array de permisos son requeridos" });
    }

    try {
        // Verificar si el rol existe
        const rol = await prisma.rol.findUnique({ 
            where: { id_rol: Number(rolId) },
            select: { id_rol: true, nombre: true } // Seleccionamos solo los campos necesarios
        });
        if (!rol) return res.status(404).json({ error: "El rol no existe" });

        // Filtrar los permisos que realmente existen
        const permisosExistentes = await prisma.permiso.findMany({
            where: { id_permiso: { in: permisos.map(Number) } },
            select: { id_permiso: true, nombre: true }
        });

        if (permisosExistentes.length !== permisos.length) {
            return res.status(404).json({ error: "Uno o más permisos no existen" });
        }

        // Verificar qué permisos ya están asignados al rol
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

        // Asignar los nuevos permisos
        await prisma.permisoOnRol.createMany({
            data: nuevosPermisos.map(p => ({
                id_rol: Number(rolId),
                id_permiso: p.id_permiso
            })),
            skipDuplicates: true
        });

        res.json({ 
            msg: "Permisos asignados correctamente",
            rol: rol, // Incluye id_rol y nombre del rol
            permisos_asignados: nuevosPermisos // Incluye id_permiso y nombre de los permisos
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al asignar permisos" });
    }
};

// Remover un permiso de un rol
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
        res.status(500).json({ error: "Error al remover permiso del rol" });
    }
};

module.exports = {
    AsignarPermisosARol,
    RemoverPermisoDeRol
};
