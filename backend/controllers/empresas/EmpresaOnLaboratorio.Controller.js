/** 
 * Controlador de EmpresaOnLaboratorio
 * Este controlador maneja la asociación y desasociación entre empresas y laboratorios.
 * Proporciona dos rutas:
 * 1. Asociar una empresa a uno o más laboratorios.
 * 2. Desasociar una empresa de uno o más laboratorios.
 */

const { PrismaClient } = require("@prisma/client");
const { body, param, validationResult } = require("express-validator");
const prisma = new PrismaClient();

/**
 * Middleware de validación para asociar una empresa con laboratorios.
 * Valida los parámetros recibidos en la solicitud:
 * - El campo 'id_empresa' debe ser un número entero positivo.
 * - El campo 'id_laboratorio' debe ser un array con al menos un elemento,
 *   y todos los elementos deben ser números enteros positivos.
 */
const validarAsociacion = [
    body("id_empresa").isInt({ min: 1 }).withMessage("El id_empresa debe ser un número entero positivo."),
    body("id_laboratorio")
        .isArray({ min: 1 }).withMessage("El id_laboratorio debe ser un array con al menos un elemento.")
        .custom((value) => value.every(id => Number.isInteger(id) && id > 0))
        .withMessage("Todos los elementos en id_laboratorio deben ser números enteros positivos."),
];

/**
 * Middleware de validación para desasociar una empresa de laboratorios.
 * Valida los parámetros recibidos en la solicitud:
 * - El campo 'id_empresa' debe ser un número entero positivo.
 * - El campo 'id_laboratorio' debe ser un array con al menos un elemento,
 *   y todos los elementos deben ser números enteros positivos.
 */
const validarDesasociacion = [
    param("id_empresa").isInt({ min: 1 }).withMessage("El id_empresa debe ser un número entero positivo."),
    body("id_laboratorio")
        .isArray({ min: 1 }).withMessage("El id_laboratorio debe ser un array con al menos un elemento.")
        .custom((value) => value.every(id => Number.isInteger(id) && id > 0))
        .withMessage("Todos los elementos en id_laboratorio deben ser números enteros positivos."),
];

/**
 * Controlador para asociar una empresa a uno o más laboratorios.
 * 
 * Este controlador realiza las siguientes acciones:
 * 1. Valida los datos de la solicitud.
 * 2. Verifica si la empresa existe en la base de datos.
 * 3. Verifica si los laboratorios existen en la base de datos.
 * 4. Crea las asociaciones entre la empresa y los laboratorios.
 * 
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * 
 * @returns {Object} Respuesta con el resultado de la operación.
 */
const AsociarEmpresaLaboratorio = async (req, res) => {
    // Validar los datos de la solicitud
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const id_empresa = Number(req.body.id_empresa);
    const id_laboratorio = req.body.id_laboratorio.map(Number); // Convertir a números

    try {
        // Verificar que la empresa existe
        const empresa = await prisma.empresa.findUnique({ where: { id_empresa } });
        if (!empresa) {
            return res.status(404).json({ msg: "Empresa no encontrada." });
        }

        // Verificar que los laboratorios existen
        const laboratorios = await prisma.laboratorio.findMany({
            where: { id_laboratorio: { in: id_laboratorio } }
        });

        if (laboratorios.length !== id_laboratorio.length) {
            return res.status(404).json({ msg: "Uno o más laboratorios no existen." });
        }

        // Crear las asociaciones entre empresa y laboratorios
        const asociaciones = await prisma.empresaOnLaboratorio.createMany({
            data: id_laboratorio.map(id_laboratorio => ({
                id_empresa,
                id_laboratorio
            })),
            skipDuplicates: true // Evita insertar duplicados
        });

        // Respuesta exitosa con las asociaciones creadas
        res.status(201).json({ msg: "Asociaciones creadas con éxito", asociaciones });
    } catch (error) {
        // Manejo de errores
        res.status(500).json({ msg: "Error al asociar la empresa con los laboratorios", error: error.message });
    }
};

/**
 * Controlador para desasociar una empresa de uno o más laboratorios.
 * 
 * Este controlador realiza las siguientes acciones:
 * 1. Valida los datos de la solicitud.
 * 2. Elimina las asociaciones entre la empresa y los laboratorios.
 * 
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * 
 * @returns {Object} Respuesta con el resultado de la operación.
 */
const DesasociarEmpresaLaboratorio = async (req, res) => {
    // Validar los datos de la solicitud
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const id_empresa = Number(req.params.id_empresa);
    const id_laboratorio = req.body.id_laboratorio.map(Number); // Convertir a números

    try {
        // Eliminar las asociaciones entre empresa y laboratorios
        await prisma.empresaOnLaboratorio.deleteMany({
            where: {
                id_empresa,
                id_laboratorio: { in: id_laboratorio }
            }
        });

        // Respuesta exitosa con las asociaciones eliminadas
        res.json({ msg: "Asociaciones eliminadas correctamente" });
    } catch (error) {
        // Manejo de errores
        res.status(500).json({ msg: "Error al eliminar la asociación", error: error.message });
    }
};

module.exports = {
    AsociarEmpresaLaboratorio,
    DesasociarEmpresaLaboratorio,
    validarAsociacion,
    validarDesasociacion
};
