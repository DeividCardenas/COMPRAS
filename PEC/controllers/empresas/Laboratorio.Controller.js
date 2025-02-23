const { PrismaClient } = require("@prisma/client");
const { body, param, query, validationResult } = require("express-validator");
const prisma = new PrismaClient();

/**
 * @author Deivid Cardenas
 * @version 1.1.0
 * 
 * Controlador de Laboratorio
 * Maneja la lógica de negocio para la gestión de laboratorios.
 */

// Middleware de validaciones
const validarLaboratorio = [
    body("nombre")
        .trim()
        .notEmpty().withMessage("El nombre es obligatorio")
        .isLength({ min: 3, max: 100 }).withMessage("El nombre debe tener entre 3 y 100 caracteres"),
];

const validarIdLaboratorio = [
    param("id_laboratorio")
        .isInt().withMessage("El ID del laboratorio debe ser un número entero válido"),
];

// Obtener todos los laboratorios con paginación y filtro por nombre
const MostrarLaboratorios = async (req, res) => {
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

        const laboratorios = await prisma.laboratorio.findMany({
            where: {
                nombre: {
                    contains: nombre,
                },
            },
            include: {
                empresas: {
                    select: { empresa: { select: { nombre: true } } },
                },
                productos: {
                    select: { descripcion: true },
                },
            },
            skip,
            take: pageSize,
        });

        const totalLaboratorios = await prisma.laboratorio.count({
            where: { nombre: { contains: nombre } },
        });

        res.json({
            total: totalLaboratorios,
            page: pageNumber,
            limit: pageSize,
            data: laboratorios.map(lab => ({
                ...lab,
                empresas: lab.empresas.map(emp => emp.empresa.nombre),
                productos: lab.productos.map(prod => prod.descripcion),
            })),
        });
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener los laboratorios", error });
    }
};

// Obtener un laboratorio por ID
const MostrarLaboratorio = async (req, res) => {
    await Promise.all(validarIdLaboratorio.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }
    
    const { id_laboratorio } = req.params;
    try {
        const laboratorio = await prisma.laboratorio.findUnique({
            where: { id_laboratorio: Number(id_laboratorio) },
            include: { productos: true, empresas: true },
        });
        if (!laboratorio) return res.status(404).json({ msg: "Laboratorio no encontrado" });
        res.json(laboratorio);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener el laboratorio", error });
    }
};

// Crear un laboratorio
const CrearLaboratorio = async (req, res) => {
    await Promise.all(validarLaboratorio.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }

    const { nombre } = req.body;
    try {
        const nuevoLaboratorio = await prisma.laboratorio.create({
            data: { nombre },
        });
        res.status(201).json(nuevoLaboratorio);
    } catch (error) {
        res.status(500).json({ msg: "Error al crear el laboratorio", error });
    }
};

// Editar un laboratorio
const EditarLaboratorio = async (req, res) => {
    await Promise.all([...validarLaboratorio, ...validarIdLaboratorio].map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }

    const { id_laboratorio } = req.params;
    const { nombre } = req.body;
    try {
        const laboratorioActualizado = await prisma.laboratorio.update({
            where: { id_laboratorio: Number(id_laboratorio) },
            data: { nombre },
        });
        res.json(laboratorioActualizado);
    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar el laboratorio", error });
    }
};

// Eliminar un laboratorio
const EliminarLaboratorio = async (req, res) => {
    await Promise.all(validarIdLaboratorio.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }

    const { id_laboratorio } = req.params;
    try {
        await prisma.laboratorio.delete({
            where: { id_laboratorio: Number(id_laboratorio) },
        });
        res.json({ msg: "Laboratorio eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ msg: "Error al eliminar el laboratorio", error });
    }
};

module.exports = {
    MostrarLaboratorios,
    MostrarLaboratorio,
    CrearLaboratorio,
    EditarLaboratorio,
    EliminarLaboratorio,
};
