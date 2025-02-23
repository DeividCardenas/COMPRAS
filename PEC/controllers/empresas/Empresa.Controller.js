const { PrismaClient } = require("@prisma/client");
const { body, param, query, validationResult } = require("express-validator");
const prisma = new PrismaClient();

/**
 * @author Deivid Cardenas
 * @version 1.0.1
 * 
 * Controlador de Empresa
 * Maneja la lógica de negocio para la gestión de empresas.
 */

// Middleware para validar datos antes de procesar la solicitud
const validarEmpresa = [
    body("nombre")
        .trim()
        .notEmpty().withMessage("El nombre es obligatorio")
        .isLength({ min: 3, max: 100 }).withMessage("El nombre debe tener entre 3 y 100 caracteres"),
];

const validarIdEmpresa = [
    param("id_empresa")
        .isInt().withMessage("El ID de la empresa debe ser un número entero válido"),
];

// Mostrar todas las empresas con paginación y filtro por nombre
const MostrarEmpresas = async (req, res) => {
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

        const empresas = await prisma.empresa.findMany({
            where: {
                nombre: {
                    contains: nombre,
                },
            },
            include: {
                laboratorios: {
                    include: {
                        laboratorio: {
                            select: { nombre: true },
                        },
                    },
                },
                tarifarios: {
                    select: { nombre: true },
                },
            },
            skip,
            take: pageSize,
        });

        // Formatear laboratorios y tarifarios
        const formattedEmpresas = empresas.map((empresa) => ({
            ...empresa,
            laboratorios: empresa.laboratorios.map((lab) => lab.laboratorio.nombre),
            tarifarios: empresa.tarifarios.map((tarifario) => tarifario.nombre),
        }));

        const totalEmpresas = await prisma.empresa.count({
            where: {
                nombre: {
                    contains: nombre,
                },
            },
        });

        res.json({
            total: totalEmpresas,
            page: pageNumber,
            limit: pageSize,
            data: formattedEmpresas,
        });
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener las empresas", error });
    }
};

// Mostrar una empresa por ID
const MostrarEmpresa = async (req, res) => {
    await param("id_empresa").isInt().withMessage("El ID de la empresa debe ser un número entero válido").run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }

    const { id_empresa } = req.params;
    try {
        const empresa = await prisma.empresa.findUnique({
            where: { id_empresa: Number(id_empresa) },
            include: { laboratorios: true, tarifarios: true },
        });
        if (!empresa) return res.status(404).json({ msg: "Empresa no encontrada" });
        res.json(empresa);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener la empresa", error });
    }
};

// Crear una nueva empresa
const CrearEmpresa = async (req, res) => {
    await Promise.all(validarEmpresa.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }

    const { nombre } = req.body;

    try {
        const empresaExistente = await prisma.empresa.findUnique({
            where: { nombre },
        });

        if (empresaExistente) {
            return res.status(400).json({ msg: "La empresa ya existe" });
        }

        const nuevaEmpresa = await prisma.empresa.create({
            data: { nombre },
        });

        res.status(201).json(nuevaEmpresa);
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(400).json({ msg: "El nombre de la empresa ya está en uso" });
        }
        res.status(500).json({ msg: "Error al crear la empresa", error });
    }
};

// Editar una empresa
const EditarEmpresa = async (req, res) => {
    await Promise.all([...validarEmpresa, ...validarIdEmpresa].map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }

    const { id_empresa } = req.params;
    const { nombre } = req.body;

    try {
        const empresaActualizada = await prisma.empresa.update({
            where: { id_empresa: Number(id_empresa) },
            data: { nombre },
        });
        res.json(empresaActualizada);
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ msg: "Empresa no encontrada" });
        }
        res.status(500).json({ msg: "Error al actualizar la empresa", error });
    }
};

// Eliminar una empresa
const EliminarEmpresa = async (req, res) => {
    await Promise.all(validarIdEmpresa.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }

    const { id_empresa } = req.params;
    try {
        await prisma.empresa.delete({
            where: { id_empresa: Number(id_empresa) },
        });
        res.json({ msg: "Empresa eliminada correctamente" });
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ msg: "Empresa no encontrada" });
        }
        res.status(500).json({ msg: "Error al eliminar la empresa", error });
    }
};

module.exports = {
    MostrarEmpresas,
    MostrarEmpresa,
    CrearEmpresa,
    EditarEmpresa,
    EliminarEmpresa,
};
