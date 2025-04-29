/**
 * Rutas de Permisos en Tarifarios
 * Define las rutas para la gestión de permisos en tarifarios dentro del sistema.
 * Incluye operaciones para asignar, editar y eliminar permisos en tarifarios.
 */

const { Router } = require("express");
const router = Router();

const { 
    MostrarPermisosEnTarifarios,
    AsignarPermisoATarifario,
    MostrarPermisoEnTarifario,
    EditarPermisoEnTarifario,
    EliminarPermisoDeTarifario 
} = require("../../controllers/roles/PermisoOnTarifario.Controller");

/* ========================== Permisos en Tarifarios ========================== */

router.get("/", MostrarPermisosEnTarifarios);                      // Obtener todos los permisos asignados a tarifarios
router.post("/", AsignarPermisoATarifario);                         // Asignar un permiso a un tarifario
router.get("/:permisoId/:tarifarioId", MostrarPermisoEnTarifario);  // Obtener un permiso específico en un tarifario
router.put("/:permisoId/:tarifarioId", EditarPermisoEnTarifario);   // Editar la descripción de un permiso en un tarifario
router.delete("/:permisoId/:tarifarioId", EliminarPermisoDeTarifario); // Eliminar un permiso de un tarifario

module.exports = router;
