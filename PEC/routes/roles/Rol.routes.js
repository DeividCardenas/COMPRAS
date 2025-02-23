/**
 * @author Deivid Cardenas
 * @version 1.0.0
 * 
 * Rutas de Roles
 * Define las rutas para la gestión de roles en el sistema.
 */

const { Router } = require("express");
const router = Router();

const { 
    MostrarRoles, 
    CrearRol, 
    MostrarRol, 
    EditarRol, 
    EliminarRol 
} = require("../../controllers/roles/Rol.Controller");

/* ========================== Roles ========================== */

router.get("/", MostrarRoles);                   // Obtener todos los roles con paginación y búsqueda
router.get("/:id_rol", MostrarRol);              // Obtener un rol por ID
router.post("/", CrearRol);                      // Crear un nuevo rol
router.put("/:id_rol", EditarRol);               // Editar un rol por ID
router.delete("/:id_rol", EliminarRol);          // Eliminar un rol por ID

module.exports = router;
