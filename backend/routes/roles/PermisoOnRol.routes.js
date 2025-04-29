/**
 * Rutas de Permisos en Roles
 * Define las rutas para la gestión de asignación de permisos a roles en el sistema.
 * Incluye operaciones para asignar y eliminar permisos de roles.
 */

const { Router } = require("express");
const router = Router();

const { 
    AsignarPermisosARol,
    RemoverPermisoDeRol
} = require("../../controllers/roles/PermisoOnRol.Controller");

/* ========================== Permisos en Roles ========================== */

router.post("/", AsignarPermisosARol);                         // Asignar un permiso a un rol
router.delete("/:permisoId/:rolId", RemoverPermisoDeRol);    // Eliminar un permiso de un rol

module.exports = router;
