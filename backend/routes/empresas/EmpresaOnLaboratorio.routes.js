/**
 * Rutas de EmpresaOnLaboratorio
 * Define las rutas para la asociación entre empresas y laboratorios en el sistema.
 * Incluye operaciones para asociar y desasociar empresas y laboratorios.
 */

const { Router } = require("express");
const router = Router();

const { 
    AsociarEmpresaLaboratorio, 
    DesasociarEmpresaLaboratorio, 
    validarAsociacion, 
    validarDesasociacion 
} = require("../../controllers/empresas/EmpresaOnLaboratorio.Controller");

/* ========================== Empresa - Laboratorio ========================== */

router.post("/", validarAsociacion, AsociarEmpresaLaboratorio);  // Asociar una empresa con un laboratorio
router.delete("/:id_empresa/:id_laboratorio", validarDesasociacion, DesasociarEmpresaLaboratorio);  // Eliminar asociación entre empresa y laboratorio

module.exports = router;
