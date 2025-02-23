const { PrismaClient } = require("@prisma/client");
const { body, param, validationResult } = require("express-validator");
const prisma = new PrismaClient();

/**
 * @author Deivid Cardenas
 * @version 1.1.0
 * 
 * Controlador de EmpresaOnLaboratorio
 * Maneja la asociación entre empresas y laboratorios.
 */

const validarAsociacion = [
    body("id_empresa").isInt({ min: 1 }).withMessage("El id_empresa debe ser un número entero positivo."),
    body("id_laboratorio")
        .isArray({ min: 1 }).withMessage("El id_laboratorio debe ser un array con al menos un elemento.")
        .custom((value) => value.every(id => Number.isInteger(id) && id > 0))
        .withMessage("Todos los elementos en id_laboratorio deben ser números enteros positivos."),
];

const validarDesasociacion = [
    param("id_empresa").isInt({ min: 1 }).withMessage("El id_empresa debe ser un número entero positivo."),
    body("id_laboratorio")
        .isArray({ min: 1 }).withMessage("El id_laboratorio debe ser un array con al menos un elemento.")
        .custom((value) => value.every(id => Number.isInteger(id) && id > 0))
        .withMessage("Todos los elementos en id_laboratorio deben ser números enteros positivos."),
];

const AsociarEmpresaLaboratorio = async (req, res) => {
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

        // Asociar empresa con los laboratorios
        const asociaciones = await prisma.empresaOnLaboratorio.createMany({
            data: id_laboratorio.map(id_laboratorio => ({
                id_empresa,
                id_laboratorio
            })),
            skipDuplicates: true // Evita insertar duplicados
        });

        res.status(201).json({ msg: "Asociaciones creadas con éxito", asociaciones });
    } catch (error) {
        res.status(500).json({ msg: "Error al asociar la empresa con los laboratorios", error: error.message });
    }
};

const DesasociarEmpresaLaboratorio = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const id_empresa = Number(req.params.id_empresa);
    const id_laboratorio = req.body.id_laboratorio.map(Number); // Convertir a números

    try {
        // Eliminar asociaciones
        await prisma.empresaOnLaboratorio.deleteMany({
            where: {
                id_empresa,
                id_laboratorio: { in: id_laboratorio }
            }
        });

        res.json({ msg: "Asociaciones eliminadas correctamente" });
    } catch (error) {
        res.status(500).json({ msg: "Error al eliminar la asociación", error: error.message });
    }
};

module.exports = {
    AsociarEmpresaLaboratorio,
    DesasociarEmpresaLaboratorio,
    validarAsociacion,
    validarDesasociacion
};
