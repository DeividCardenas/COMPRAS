/**
 * @author Deivid Cardenas
 * @version 1.0.0
 * 
 * Rutas de Tarifario
 * Define las rutas para la gestión de tarifarios en el sistema.
 */

const { Router } = require("express");
const { 
    MostrarTarifarios, 
    MostrarTarifarioPorId, 
    CrearTarifario, 
    EditarTarifario, 
    EliminarTarifario, 
    validarTarifario, 
    validarIdTarifario
} = require("../../controllers/eps/Tarifario.Controller");
const { check } = require("express-validator");

const router = Router();

/* ========================== Tarifarios ========================== */

router.get(
    "/", 
    [check("page").optional().isInt({ min: 1 }).withMessage("La página debe ser un número entero mayor a 0"),
     check("limit").optional().isInt({ min: 1 }).withMessage("El límite debe ser un número entero mayor a 0")],
    MostrarTarifarios
); // Obtener todos los tarifarios con paginación y búsqueda

router.get(
    "/:id_tarifario", 
    validarIdTarifario, 
    MostrarTarifarioPorId
); // Obtener un tarifario por ID

router.post(
    "/", 
    validarTarifario, 
    CrearTarifario
); // Crear un nuevo tarifario

router.put(
    "/:id_tarifario", 
    [...validarIdTarifario, ...validarTarifario], 
    EditarTarifario
); // Editar un tarifario por ID

router.delete(
    "/:id_tarifario", 
    validarIdTarifario, 
    EliminarTarifario
); // Eliminar un tarifario por ID

module.exports = router;
