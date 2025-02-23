/**
 * @author Deivid Cardenas
 * @version 1.0.0
 * 
 * Rutas de Permisos en Roles
 * Define las rutas para la gestión de asignación de permisos a roles en el sistema.
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
