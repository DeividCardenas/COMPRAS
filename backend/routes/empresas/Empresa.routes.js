/**
 * Rutas de Empresa
 * Define las rutas para la gestión de empresas en el sistema.
 * Incluye operaciones CRUD para empresas.
 */

const { Router } = require("express");
const router = Router();

const { 
    MostrarEmpresas, 
    MostrarEmpresa, 
    CrearEmpresa, 
    EditarEmpresa, 
    EliminarEmpresa 
} = require("../../controllers/empresas/Empresa.Controller");

/* ========================== Empresas ========================== */

router.get("/", MostrarEmpresas);                     // Obtener todas las empresas
router.get("/:id_empresa", MostrarEmpresa);           // Obtener una empresa por ID
router.post("/", CrearEmpresa);                       // Crear una nueva empresa
router.put("/:id_empresa", EditarEmpresa);            // Editar una empresa por ID
router.delete("/:id_empresa", EliminarEmpresa);       // Eliminar una empresa por ID

module.exports = router;
