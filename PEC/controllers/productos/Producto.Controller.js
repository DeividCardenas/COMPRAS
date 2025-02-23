const { response, request } = require("express");
const { PrismaClient } = require("@prisma/client");
const { body, param, query, validationResult } = require("express-validator");

const prisma = new PrismaClient();

const validarErrores = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
};

// Obtener productos con filtros y paginación
const MostrarProductos = [
    query("page").optional().isInt({ min: 1 }).withMessage("La página debe ser un número entero positivo"),
    query("limit").optional().isInt({ min: 1 }).withMessage("El límite debe ser un número entero positivo"),
    validarErrores,
    async (req = request, res = response) => {
        try {
            const { codigo_magister, cum_pactado, descripcion, id_laboratorio, principio_activo, concentracion, registro_sanitario, con_regulacion, page = 1, limit = 10 } = req.query;
            const numeroPagina = parseInt(page, 10) || 1;
            const tamanoPagina = parseInt(limit, 10) || 10;
            const skip = (numeroPagina - 1) * tamanoPagina;

            const condiciones = {};
            if (codigo_magister) condiciones.codigo_magister = { contains: codigo_magister };
            if (cum_pactado) condiciones.cum_pactado = { contains: cum_pactado };
            if (descripcion) condiciones.descripcion = { contains: descripcion };
            if (id_laboratorio) condiciones.id_laboratorio = parseInt(id_laboratorio, 10);
            if (principio_activo) condiciones.principio_activo = { contains: principio_activo };
            if (concentracion) condiciones.concentracion = { contains: concentracion };
            if (registro_sanitario) condiciones.registro_sanitario = { contains: registro_sanitario };

            if (con_regulacion === "regulados") {
                condiciones.OR = [
                    { regulacion_tableta: { not: null } },
                    { regulacion_empaque: { not: null } },
                ];
            } else if (con_regulacion === "no_regulados") {
                condiciones.AND = [
                    { regulacion_tableta: null },
                    { regulacion_empaque: null },
                ];
            }

            const totalProductos = await prisma.producto.count({ where: condiciones });
            const productos = await prisma.producto.findMany({
                where: condiciones,
                include: { laboratorio: { select: { nombre: true } } },
                take: tamanoPagina,
                skip,
            });

            res.json({ totalProductos, totalPaginas: Math.ceil(totalProductos / tamanoPagina), paginaActual: numeroPagina, tamanoPagina, productos });
        } catch (error) {
            res.status(500).json({ mensaje: "Error al obtener los productos", error: error.message });
        }
    }
];

// Obtener un producto por ID
const MostrarProductoPorId = [
    param("id_producto").isInt().withMessage("El ID del producto debe ser un número entero"),
    validarErrores,
    async (req = request, res = response) => {
        try {
            const { id_producto } = req.params;
            const producto = await prisma.producto.findUnique({
                where: { id_producto: parseInt(id_producto, 10) },
                include: { laboratorio: { select: { nombre: true } } },
            });

            if (!producto) return res.status(404).json({ mensaje: "Producto no encontrado" });
            res.json(producto);
        } catch (error) {
            res.status(500).json({ mensaje: "Error al obtener el producto", error: error.message });
        }
    }
];

// Crear un nuevo producto
const CrearProducto = [
    body("codigo_magister").notEmpty().withMessage("El código magister es obligatorio"),
    body("cum_pactado").notEmpty().withMessage("El CUM pactado es obligatorio"),
    body("descripcion").notEmpty().withMessage("La descripción es obligatoria"),
    body("principio_activo").notEmpty().withMessage("El principio activo es obligatorio"),
    body("concentracion").notEmpty().withMessage("La concentración es obligatoria"),
    body("registro_sanitario").notEmpty().withMessage("El registro sanitario es obligatorio"),
    body("id_laboratorio").isInt().withMessage("El ID del laboratorio debe ser un número entero"),
    body("costo_compra").isFloat({ min: 0 }).withMessage("El costo de compra debe ser un número positivo"),
    body("regulacion_tableta").optional().isInt().withMessage("La regulación tableta debe ser un número entero"),
    body("regulacion_empaque").optional().isInt().withMessage("La regulación empaque debe ser un número entero"),
    validarErrores,
    async (req = request, res = response) => {
        try {
            const { id_laboratorio } = req.body;
            
            // Verificar si el laboratorio existe
            const laboratorio = await prisma.laboratorio.findUnique({
                where: { id_laboratorio: parseInt(id_laboratorio, 10) }
            });
            
            if (!laboratorio) {
                return res.status(400).json({ mensaje: "El laboratorio especificado no existe" });
            }
            
            const nuevoProducto = await prisma.producto.create({ data: req.body });
            res.status(201).json({ mensaje: "Producto agregado con éxito", producto: nuevoProducto });
        } catch (error) {
            res.status(500).json({ mensaje: "Error al agregar el producto", error: error.message });
        }
    }
];

// Editar un producto
const EditarProducto = [
    param("id_producto").isInt().withMessage("El ID del producto debe ser un número entero"),
    
    body("codigo_magister").optional().notEmpty().withMessage("El código magister no puede estar vacío"),
    body("cum_pactado").optional().notEmpty().withMessage("El CUM pactado no puede estar vacío"),
    body("descripcion").optional().notEmpty().withMessage("La descripción no puede estar vacía"),
    body("principio_activo").optional().notEmpty().withMessage("El principio activo no puede estar vacío"),
    body("concentracion").optional().notEmpty().withMessage("La concentración no puede estar vacía"),
    body("registro_sanitario").optional().notEmpty().withMessage("El registro sanitario no puede estar vacío"),
    body("id_laboratorio").optional().isInt().withMessage("El ID del laboratorio debe ser un número entero"),
    body("costo_compra").optional().isFloat({ min: 0 }).withMessage("El costo de compra debe ser un número positivo"),
    body("regulacion_tableta").optional().isInt({ min: 0 }).withMessage("La regulación de tableta debe ser un número entero positivo"),
    body("regulacion_empaque").optional().isInt({ min: 0 }).withMessage("La regulación de empaque debe ser un número entero positivo"),

    validarErrores,

    async (req = request, res = response) => {
        try {
            const { id_producto } = req.params;
            const datosActualizados = req.body;

            const productoActualizado = await prisma.producto.update({
                where: { id_producto: parseInt(id_producto, 10) },
                data: datosActualizados,
            });

            res.json({ mensaje: "Producto actualizado con éxito", producto: productoActualizado });
        } catch (error) {
            res.status(500).json({ mensaje: "Error al actualizar el producto", error: error.message });
        }
    }
];

// Eliminar un producto
const EliminarProducto = [
    param("id_producto").isInt().withMessage("El ID del producto debe ser un número entero"),
    validarErrores,
    async (req = request, res = response) => {
        try {
            const { id_producto } = req.params;
            await prisma.producto.delete({ where: { id_producto: parseInt(id_producto, 10) } });
            res.json({ mensaje: "Producto eliminado con éxito" });
        } catch (error) {
            res.status(500).json({ mensaje: "Error al eliminar el producto", error: error.message });
        }
    }
];

module.exports = { MostrarProductos, MostrarProductoPorId, CrearProducto, EditarProducto, EliminarProducto };
