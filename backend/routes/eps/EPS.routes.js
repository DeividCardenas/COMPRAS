/**
 * Rutas de EPS
 * Define las rutas para la gestión de EPS en el sistema.
 * Incluye operaciones CRUD para EPS.
 */

const { Router } = require("express");
const router = Router();

const { 
    MostrarEps, 
    MostrarEpsPorId, 
    CrearEps, 
    EditarEps, 
    EliminarEps 
} = require("../../controllers/eps/EPS.Controller");

/* ========================== EPS ========================== */

router.get("/", MostrarEps);                     // Obtener todas las EPS
router.get("/:id_eps", MostrarEpsPorId);         // Obtener una EPS por ID
router.post("/", CrearEps);                      // Crear una nueva EPS
router.put("/:id_eps", EditarEps);               // Editar una EPS por ID
router.delete("/:id_eps", EliminarEps);          // Eliminar una EPS por ID

module.exports = router;
