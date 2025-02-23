const { PrismaClient } = require("@prisma/client");
const { body, param, query, validationResult } = require("express-validator");
const prisma = new PrismaClient();

/**
 * @author Deivid Cardenas
 * @version 1.0.1
 * 
 * Controlador de EPS
 * Maneja la lógica de negocio para la gestión de EPS.
 */

// Middleware para validar datos antes de procesar la solicitud
const validarEps = [
    body("nombre")
        .trim()
        .notEmpty().withMessage("El nombre es obligatorio")
        .isLength({ min: 3, max: 100 }).withMessage("El nombre debe tener entre 3 y 100 caracteres"),
];

const validarIdEps = [
    param("id_eps")
        .isInt().withMessage("El ID de la EPS debe ser un número entero válido"),
];

// Mostrar todas las EPS con paginación y filtro por nombre
const MostrarEps = async (req, res) => {
    try {
        await query("page").optional().isInt({ min: 1 }).toInt().run(req);
        await query("limit").optional().isInt({ min: 1, max: 100 }).toInt().run(req);
        await query("nombre").optional().trim().run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() });
        }

        const { page = 1, limit = 10, nombre = "" } = req.query;
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);
        const skip = (pageNumber - 1) * pageSize;

        const epsList = await prisma.ePS.findMany({
            where: {
                nombre: {
                    contains: nombre,
                },
            },
            include: { tarifarios: { select: { nombre: true } } },
            skip,
            take: pageSize,
        });

        const totalEps = await prisma.ePS.count({
            where: {
                nombre: {
                    contains: nombre,
                },
            },
        });

        res.json({
            total: totalEps,
            page: pageNumber,
            limit: pageSize,
            data: epsList,
        });
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener las EPS", error });
    }
};

// Mostrar una EPS por ID
const MostrarEpsPorId = async (req, res) => {
    await Promise.all(validarIdEps.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }

    const { id_eps } = req.params;
    try {
        const eps = await prisma.ePS.findUnique({
            where: { id_eps: Number(id_eps) },
            include: { tarifarios: true },
        });
        if (!eps) return res.status(404).json({ msg: "EPS no encontrada" });
        res.json(eps);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener la EPS", error });
    }
};

// Crear una nueva EPS
const CrearEps = async (req, res) => {
    await Promise.all(validarEps.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }

    const { nombre } = req.body;

    try {
        const epsExistente = await prisma.ePS.findUnique({
            where: { nombre },
        });

        if (epsExistente) {
            return res.status(400).json({ msg: "La EPS ya existe" });
        }

        const nuevaEps = await prisma.ePS.create({ data: { nombre } });
        res.status(201).json(nuevaEps);
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(400).json({ msg: "El nombre de la EPS ya está en uso" });
        }
        res.status(500).json({ msg: "Error al crear la EPS", error });
    }
};

// Editar una EPS
const EditarEps = async (req, res) => {
    await Promise.all([...validarEps, ...validarIdEps].map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }

    const { id_eps } = req.params;
    const { nombre } = req.body;

    try {
        const epsActualizada = await prisma.ePS.update({
            where: { id_eps: Number(id_eps) },
            data: { nombre },
        });
        res.json(epsActualizada);
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ msg: "EPS no encontrada" });
        }
        res.status(500).json({ msg: "Error al actualizar la EPS", error });
    }
};

// Eliminar una EPS
const EliminarEps = async (req, res) => {
    await Promise.all(validarIdEps.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }

    const { id_eps } = req.params;
    try {
        await prisma.ePS.delete({
            where: { id_eps: Number(id_eps) },
        });
        res.json({ msg: "EPS eliminada correctamente" });
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ msg: "EPS no encontrada" });
        }
        res.status(500).json({ msg: "Error al eliminar la EPS", error });
    }
};

module.exports = {
    MostrarEps,
    MostrarEpsPorId,
    CrearEps,
    EditarEps,
    EliminarEps,
};
