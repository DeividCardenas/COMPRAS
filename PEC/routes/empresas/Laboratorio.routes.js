/**
 * @author Deivid Cardenas
 * @version 1.0.0
 * 
 * Rutas de Laboratorio
 * Define las rutas para la gestión de laboratorios en el sistema.
 */

const { Router } = require("express");
const router = Router();

const { 
    MostrarLaboratorios, 
    MostrarLaboratorio, 
    CrearLaboratorio, 
    EditarLaboratorio, 
    EliminarLaboratorio 
} = require("../../controllers/empresas/Laboratorio.Controller");

/* ========================== Laboratorios ========================== */

router.get("/", MostrarLaboratorios);                     // Obtener todos los laboratorios
router.get("/:id_laboratorio", MostrarLaboratorio);       // Obtener un laboratorio por ID
router.post("/", CrearLaboratorio);                       // Crear un nuevo laboratorio
router.put("/:id_laboratorio", EditarLaboratorio);        // Editar un laboratorio por ID
router.delete("/:id_laboratorio", EliminarLaboratorio);   // Eliminar un laboratorio por ID

module.exports = router;
