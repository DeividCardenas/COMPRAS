const { PrismaClient } = require("@prisma/client");
const { validationResult, param, body, query } = require("express-validator");

const prisma = new PrismaClient();

// Middleware de validaciones
const validarTarifario = [
    body("nombre").notEmpty().withMessage("El nombre es obligatorio."),
    body("id_eps").optional().isInt().withMessage("El ID de EPS debe ser un número entero."),
    body("id_empresa").optional().isInt().withMessage("El ID de Empresa debe ser un número entero."),
];

const validarIdTarifario = [
    param("id_tarifario").isInt().withMessage("El ID del tarifario debe ser un número entero."),
];

// Obtener todos los tarifarios con paginación y búsqueda
const MostrarTarifarios = async (req, res) => {
    const { page = 1, limit = 10, nombre } = req.query;
    const skip = (page - 1) * limit;
    
    try {
        const where = nombre ? { nombre: { contains: nombre, mode: "insensitive" } } : {};
        
        const tarifarios = await prisma.tarifario.findMany({
            where,
            include: { eps: true, empresa: true, productos: true },
            skip: Number(skip),
            take: Number(limit),
        });

        const total = await prisma.tarifario.count({ where });
        res.json({ total, page: Number(page), limit: Number(limit), tarifarios });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear un tarifario
const CrearTarifario = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });
    
    const { nombre, id_eps, id_empresa } = req.body;
    try {
        const tarifario = await prisma.tarifario.create({
            data: { nombre, id_eps, id_empresa },
        });
        res.status(201).json({ msg: "Tarifario creado exitosamente", tarifario });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener un tarifario por ID
const MostrarTarifarioPorId = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });

    const { id_tarifario } = req.params;
    try {
        const tarifario = await prisma.tarifario.findUnique({
            where: { id_tarifario: Number(id_tarifario) },
            include: { productos: true, permisos: true },
        });

        if (!tarifario) return res.status(404).json({ msg: "Tarifario no encontrado" });
        res.json(tarifario);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Editar un tarifario
const EditarTarifario = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });
    
    const { id_tarifario } = req.params;
    const { nombre } = req.body;
    try {
        const tarifario = await prisma.tarifario.update({
            where: { id_tarifario: Number(id_tarifario) },
            data: { nombre },
        });
        res.json({ msg: "Tarifario actualizado exitosamente", tarifario });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar un tarifario
const EliminarTarifario = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });
    
    const { id_tarifario } = req.params;
    try {
        await prisma.tarifario.delete({ where: { id_tarifario: Number(id_tarifario) } });
        res.json({ msg: "Tarifario eliminado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { 
    MostrarTarifarios, 
    CrearTarifario, 
    MostrarTarifarioPorId, 
    EditarTarifario, 
    EliminarTarifario, 
    validarTarifario, 
    validarIdTarifario 
};
