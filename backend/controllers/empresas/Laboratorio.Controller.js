/**
 * Controlador de Laboratorio
 * Maneja la lógica de negocio para la gestión de laboratorios y productos asociados.
 * Incluye operaciones de creación, actualización, eliminación y consulta de laboratorios,
 * así como la exportación de productos en formato Excel.
 */


import { PrismaClient } from "@prisma/client";
import { body, param, validationResult } from "express-validator";
import ExcelJS from "exceljs";

const prisma = new PrismaClient();

// Middleware de validación para la creación y edición de laboratorios
const validarLaboratorio = [
    body("nombre")
        .trim()
        .notEmpty().withMessage("El nombre es obligatorio")
        .isLength({ min: 3, max: 100 }).withMessage("El nombre debe tener entre 3 y 100 caracteres"),
];

// Middleware de validación para la verificación de ID de laboratorio
const validarIdLaboratorio = [
    param("id_laboratorio")
        .isInt().withMessage("El ID del laboratorio debe ser un número entero válido"),
];

/**
 * Obtener todos los laboratorios con paginación y filtrado.
 * @param {Request} req - La solicitud HTTP.
 * @param {Response} res - La respuesta HTTP.
 * @returns {Promise<void>} Respuesta con los datos de los laboratorios.
 */
const MostrarLaboratorios = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 9;
        const nombre = req.query.nombre?.trim() || "";
        const idEmpresa = req.query.empresa ? parseInt(req.query.empresa, 10) : null;

        const skip = (page - 1) * limit;

        let filters = {
            nombre: { contains: nombre }
        };

        // Filtro adicional por empresa
        if (idEmpresa) {
            filters.empresas = {
                some: { id_empresa: idEmpresa }
            };
        }

        // Consultar laboratorios con filtros aplicados
        const [laboratorios, total] = await Promise.all([
            prisma.laboratorio.findMany({
                where: filters,
                select: {
                    id_laboratorio: true,
                    nombre: true,
                },
                skip,
                take: limit,
            }),
            prisma.laboratorio.count({
                where: filters,
            }),
        ]);

        if (total === 0) {
            return res.status(200).json({
                msg: "No se encontraron laboratorios",
                total,
                page,
                limit,
                totalPages: 0,
                data: [],
            });
        }

        res.json({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            data: laboratorios,
        });
    } catch (error) {
        console.error("Error en MostrarLaboratorios:", error);
        res.status(500).json({ msg: "Error al obtener los laboratorios", error: error.message });
    }
};

/**
 * Obtener un laboratorio específico junto con sus productos asociados.
 * @param {Request} req - La solicitud HTTP.
 * @param {Response} res - La respuesta HTTP.
 * @returns {Promise<void>} Respuesta con los datos del laboratorio y productos.
 */
const MostrarLaboratorio = async (req, res) => {
    try {
        // Validación del ID de laboratorio
        await Promise.all(validarIdLaboratorio.map(validation => validation.run(req)));
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() });
        }

        const { id_laboratorio } = req.params;
        const laboratorioId = parseInt(id_laboratorio, 10);
        
        if (isNaN(laboratorioId) || laboratorioId <= 0) {
            return res.status(400).json({ msg: "ID de laboratorio inválido" });
        }

        // Paginación
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        let limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
        const maxLimit = 50; // Límite máximo para evitar sobrecarga
        limit = Math.min(limit, maxLimit);
        const skip = (page - 1) * limit;

        // Parámetros de filtrado
        const { cum, descripcion, concentracion, registro_sanitario, presentacion, regulacion, codigo_barras, con_regulacion, campos } = req.query;

        const condiciones = { id_laboratorio: laboratorioId };

        // Aplicar filtros adicionales
        if (cum) condiciones.cum = { contains: cum };
        if (descripcion) condiciones.descripcion = { contains: descripcion };
        if (concentracion) condiciones.concentracion = { contains: concentracion };
        if (registro_sanitario) condiciones.registro_sanitario = { contains: registro_sanitario };
        if (presentacion) condiciones.presentacion = { contains: presentacion };
        if (codigo_barras) condiciones.codigo_barras = { contains: codigo_barras };
        
        if (con_regulacion === "regulados") {
            condiciones.regulacion = { not: null };
        } else if (con_regulacion === "no_regulados") {
            condiciones.regulacion = null;
        } else if (regulacion) {
            condiciones.regulacion = { contains: regulacion};
        }

        // Campos a seleccionar para los productos
        const selectFields = {
            id_producto: true, cum: true, descripcion: true, concentracion: true,
            id_laboratorio: true, precio_unidad: true, precio_presentacion: true,
            iva: true, createdAt: true, updatedAt: true,
            laboratorio: { select: { nombre: true } },
        };

        // Agregar campos opcionales
        const extraFields = ["presentacion", "registro_sanitario", "regulacion", "codigo_barras"];
        if (campos) {
            campos.split(",").map(campo => campo.trim()).forEach(field => {
                if (extraFields.includes(field)) selectFields[field] = true;
            });
        }

        // Buscar laboratorio
        const laboratorio = await prisma.laboratorio.findUnique({
            where: { id_laboratorio: laboratorioId },
            select: { id_laboratorio: true, nombre: true, createdAt: true, updatedAt: true }
        });

        if (!laboratorio) {
            return res.status(404).json({ msg: "Laboratorio no encontrado" });
        }

        // Obtener productos asociados
        const [productos, totalProductos] = await Promise.all([
            prisma.producto.findMany({
                where: condiciones,
                select: selectFields,
                take: limit,
                skip,
            }),
            prisma.producto.count({ where: condiciones })
        ]);

        // Responder con la información del laboratorio y productos
        res.status(200).json({
            laboratorio,
            productos: {
                totalProductos,
                totalPaginas: Math.ceil(totalProductos / limit),
                paginaActual: page,
                tamanoPagina: limit,
                lista: productos,
            },
        });

    } catch (error) {
        console.error("Error al obtener el laboratorio con productos:", error);
        res.status(500).json({ msg: "Error interno del servidor al obtener el laboratorio", error: error.message });
    }
};

/**
 * Crear un nuevo laboratorio.
 * @param {Request} req - La solicitud HTTP.
 * @param {Response} res - La respuesta HTTP.
 * @returns {Promise<void>} Respuesta con el laboratorio creado.
 */
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

/**
 * Editar un laboratorio existente.
 * @param {Request} req - La solicitud HTTP.
 * @param {Response} res - La respuesta HTTP.
 * @returns {Promise<void>} Respuesta con el laboratorio actualizado.
 */
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

/**
 * Eliminar un laboratorio por su ID.
 * @param {Request} req - La solicitud HTTP.
 * @param {Response} res - La respuesta HTTP.
 * @returns {Promise<void>} Respuesta con mensaje de éxito o error.
 */
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

/**
 * Exportar los productos de un laboratorio a un archivo Excel.
 * @param {Request} req - La solicitud HTTP.
 * @param {Response} res - La respuesta HTTP.
 * @returns {Promise<void>} Respuesta con el archivo Excel descargable.
 */
const exportarProductosLaboratorio = async (req, res) => {
    try {
        const { id_laboratorio } = req.params;
        const idLaboratorio = Number(id_laboratorio);

        if (isNaN(idLaboratorio)) {
            return res.status(400).json({ mensaje: "ID de laboratorio inválido" });
        }

        // Obtener el laboratorio
        const laboratorio = await prisma.laboratorio.findUnique({
            where: { id_laboratorio: idLaboratorio },
            select: { id_laboratorio: true, nombre: true },
        });

        if (!laboratorio) {
            return res.status(404).json({ mensaje: "Laboratorio no encontrado" });
        }

        // Paginación y descarga de productos
        const all = req.query.all === "true";
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = all ? undefined : Math.max(parseInt(req.query.limit, 10) || 100, 1);
        const skip = all ? undefined : (page - 1) * limit;

        // Obtener productos
        const productos = await prisma.producto.findMany({
            where: { id_laboratorio: idLaboratorio },
            select: {
                descripcion: true,
                concentracion: true,
                presentacion: true,
                registro_sanitario: true,
                cum: true,
                precio_unidad: true,
                precio_presentacion: true,
                iva: true,
                regulacion: true,
                codigo_barras: true,
            },
            take: limit,
            skip,
        });

        if (productos.length === 0) {
            return res.status(404).json({ mensaje: "No hay productos en este laboratorio" });
        }

        // Crear el archivo Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(laboratorio.nombre);

        // Encabezados de la tabla con estilo
        const encabezados = [
            "Descripción", "Concentración", "Presentación",
            "Registro Sanitario", "CUM", "Precio Unidad (COP)",
            "Precio Presentación (COP)", "IVA", "Regulación", "Código de Barras"
        ];
        const headerRow = worksheet.addRow(encabezados);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFFCC00" }, // Amarillo claro
            };
            cell.alignment = { horizontal: "center" };
        });

        // Función para formatear valores nulos
        const formatValue = (value, defaultValue = "N/A") => value ?? defaultValue;

        // Agregar filas con datos
        productos.forEach((producto) => {
            worksheet.addRow([  
                formatValue(producto.descripcion),
                formatValue(producto.concentracion),
                formatValue(producto.presentacion),
                formatValue(producto.registro_sanitario),
                formatValue(producto.cum),
                formatValue(producto.precio_unidad, 0),
                formatValue(producto.precio_presentacion, 0),
                formatValue(producto.iva, 0),
                formatValue(producto.regulacion, "No Aplica"),
                formatValue(producto.codigo_barras),
            ]);
        });

        // Configurar el nombre del archivo
        const nombreArchivo = `productos_${laboratorio.nombre.replace(/[^a-zA-Z0-9-_]/g, "_")}`;
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        const fileNameSuffix = all ? "_completo" : `_pagina${page}`;
        res.setHeader("Content-Disposition", `attachment; filename="${nombreArchivo}${fileNameSuffix}.xlsx"`);

        // Enviar el archivo Excel como respuesta
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Error al exportar productos del laboratorio:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
};

export {
    MostrarLaboratorios,
    MostrarLaboratorio,
    CrearLaboratorio,
    EditarLaboratorio,
    EliminarLaboratorio,
    exportarProductosLaboratorio
};
