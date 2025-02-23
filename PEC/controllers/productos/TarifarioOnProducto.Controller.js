const { PrismaClient } = require("@prisma/client");
const { body, param, validationResult } = require("express-validator");

const prisma = new PrismaClient();

// Validaciones para asignar un producto a un tarifario
const validarAsignacionProducto = [
    body("id_tarifario")
        .isInt({ min: 1 })
        .withMessage("El ID del tarifario debe ser un número entero válido y mayor a 0"),
    body("id_producto")
        .isInt({ min: 1 })
        .withMessage("El ID del producto debe ser un número entero válido y mayor a 0"),
    body("precio")
        .isInt({ min: 0 })
        .withMessage("El precio debe ser un número entero válido y mayor o igual a 0"),
    body("precio_unidad")
        .isInt({ min: 0 })
        .withMessage("El precio por unidad debe ser un número entero válido y mayor o igual a 0"),
    body("precio_empaque")
        .isInt({ min: 0 })
        .withMessage("El precio por empaque debe ser un número entero válido y mayor o igual a 0"),
];

// Asignar un producto a un tarifario con precio
const AsignarProductoATarifario = async (req, res) => {
    await Promise.all(validarAsignacionProducto.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }

    const { id_tarifario, id_producto, precio, precio_unidad, precio_empaque } = req.body;

    try {
        // Verificar si ya existe la relación
        const existeRelacion = await prisma.tarifarioOnProducto.findUnique({
            where: { id_tarifario_id_producto: { id_tarifario, id_producto } },
        });

        if (existeRelacion) {
            return res.status(400).json({ msg: "El producto ya está asignado a este tarifario" });
        }

        // Crear la asignación
        const nuevoRegistro = await prisma.tarifarioOnProducto.create({
            data: {
                id_tarifario,
                id_producto,
                precio,
                precio_unidad,
                precio_empaque,
            },
        });

        res.status(201).json(nuevoRegistro);
    } catch (error) {
        res.status(500).json({
            error: "Error al asignar el producto al tarifario",
            detalle: error.message,
        });
    }
};

// Validaciones para eliminar un producto de un tarifario
const validarEliminacionProducto = [
    param("id_tarifario")
        .isInt({ min: 1 })
        .withMessage("El ID del tarifario debe ser un número entero válido y mayor a 0"),
    param("id_producto")
        .isInt({ min: 1 })
        .withMessage("El ID del producto debe ser un número entero válido y mayor a 0"),
];

// Eliminar un producto de un tarifario
const EliminarProductoDeTarifario = async (req, res) => {
    await Promise.all(validarEliminacionProducto.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }

    const { id_tarifario, id_producto } = req.params;

    try {
        await prisma.tarifarioOnProducto.delete({
            where: { id_tarifario_id_producto: { id_tarifario: Number(id_tarifario), id_producto: Number(id_producto) } },
        });

        res.json({ msg: "Producto eliminado del tarifario correctamente" });
    } catch (error) {
        res.status(500).json({
            error: "Error al eliminar el producto del tarifario",
            detalle: error.message,
        });
    }
};

module.exports = { AsignarProductoATarifario, EliminarProductoDeTarifario };