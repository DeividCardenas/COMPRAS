/**
 * Rutas de Tarifario
 * Define las rutas para la gestión de tarifarios en el sistema.
 * Incluye operaciones CRUD y exportación de tarifarios.
 */

const { Router } = require("express");
const { check } = require("express-validator");

const { 
    MostrarTarifarios, 
    MostrarTarifarioPorId, 
    CrearTarifario, 
    EditarTarifario, 
    EliminarTarifario,
    exportarTarifario,
    exportarTarifarioSimplificado
} = require("../../controllers/eps/Tarifario.Controller");

const { 
    validarTarifario, 
    validarIdTarifario 
} = require("../../middlewares/validaciones");

const { VerificarAcceso } = require("../../middlewares/authMiddleware");

const router = Router();

/* ========================== Tarifarios ========================== */

// Obtener todos los tarifarios con paginación y búsqueda
router.get(
    "/", 
    [
        check("page").optional().isInt({ min: 1 }).withMessage("La página debe ser un número entero mayor a 0"),
        check("limit").optional().isInt({ min: 1 }).withMessage("El límite debe ser un número entero mayor a 0")
    ],
    MostrarTarifarios
);

// Obtener un tarifario por ID
router.get(
    "/:id_tarifario",
    MostrarTarifarioPorId
);

router.post(
    "/", 
    VerificarAcceso({ rolesPermitidos: ["Administrador"], permisosRequeridos: ["crear_tarifario"] }), 
    validarTarifario, 
    CrearTarifario
);

router.put(
    "/:id_tarifario", 
    VerificarAcceso({ 
        rolesPermitidos: ["Administrador", "editor"], 
        permisosRequeridos: ["editar_tarifario"],
        verificarTarifario: true // Verifica que pueda editar ese tarifario específico
    }), 
    [...validarIdTarifario, ...validarTarifario], 
    EditarTarifario
);

router.delete(
    "/:id_tarifario", 
    VerificarAcceso({ 
        rolesPermitidos: ["admin"], 
        permisosRequeridos: ["eliminar_tarifario"],
        verificarTarifario: true // Verifica que pueda eliminar ese tarifario específico
    }), 
    validarIdTarifario, 
    EliminarTarifario
);

router.post('/:id_tarifario/exportar', exportarTarifario);


module.exports = router;
