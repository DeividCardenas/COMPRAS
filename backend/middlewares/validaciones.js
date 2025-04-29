const { check, param } = require("express-validator");

const validarIdTarifario = [
    param("id_tarifario").isInt({ min: 1 }).withMessage("El ID del tarifario debe ser un número entero válido")
];

const validarTarifario = [
    check("nombre").notEmpty().withMessage("El nombre del tarifario es obligatorio"),
    check("id_eps").optional().isInt({ min: 1 }).withMessage("El ID de EPS debe ser un número entero válido"),
    check("id_empresa").optional().isInt({ min: 1 }).withMessage("El ID de empresa debe ser un número entero válido")
];

module.exports = {
    validarIdTarifario,
    validarTarifario
};
