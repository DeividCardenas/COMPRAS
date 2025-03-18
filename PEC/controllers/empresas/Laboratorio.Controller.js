import { PrismaClient } from "@prisma/client";
import { body, param,validationResult } from "express-validator";
import ExcelJS from "exceljs";
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

        // Si hay un idEmpresa, filtramos por la relación con EmpresaOnLaboratorio
        if (idEmpresa) {
            filters.empresas = {
                some: { id_empresa: idEmpresa }
            };
        }

        // Consultar laboratorios con paginación y filtro por empresa
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


// Obtener un laboratorio por ID con productos filtrados y paginados
const MostrarLaboratorio = async (req, res) => {
    try {
        // Validar ID del laboratorio
        await Promise.all(validarIdLaboratorio.map(validation => validation.run(req)));
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() });
        }

        const { id_laboratorio } = req.params;

        // Validar que id_laboratorio sea un número válido
        const laboratorioId = Number(id_laboratorio);
        if (isNaN(laboratorioId) || laboratorioId <= 0) {
            return res.status(400).json({ msg: "ID de laboratorio inválido" });
        }

        // Paginación y filtros
        const { page = 1, limit = 10, codigo_magister, cum_pactado, descripcion, principio_activo, concentracion, registro_sanitario, con_regulacion } = req.query;

        const numeroPagina = parseInt(page, 10) || 1;
        const tamanoPagina = parseInt(limit, 10) || 10;
        const skip = (numeroPagina - 1) * tamanoPagina;

        // Construir condiciones para los productos
        const condiciones = { id_laboratorio: laboratorioId };

        if (codigo_magister) condiciones.codigo_magister = { contains: codigo_magister };
        if (cum_pactado) condiciones.cum_pactado = { contains: cum_pactado };
        if (descripcion) condiciones.descripcion = { contains: descripcion };
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

        // Buscar laboratorio y productos
        const laboratorio = await prisma.laboratorio.findUnique({
            where: { id_laboratorio: laboratorioId }
        });

        if (!laboratorio) {
            return res.status(404).json({ msg: "Laboratorio no encontrado" });
        }

        const totalProductos = await prisma.producto.count({ where: condiciones });
        const productos = await prisma.producto.findMany({
            where: condiciones,
            include: {},
            take: tamanoPagina,
            skip,
        });

        // Responder con la información completa
        res.status(200).json({
            laboratorio,
            productos: {
                totalProductos,
                totalPaginas: Math.ceil(totalProductos / tamanoPagina),
                paginaActual: numeroPagina,
                tamanoPagina,
                lista: productos,
            },
        });

    } catch (error) {
        console.error("Error al obtener el laboratorio con productos:", error);
        res.status(500).json({ msg: "Error interno del servidor al obtener el laboratorio", error: error.message });
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

const exportarProductosLaboratorio = async (req, res) => {
    const { id_laboratorio } = req.params;

    try {
        const idLaboratorio = Number(id_laboratorio);
        if (isNaN(idLaboratorio)) {
            return res.status(400).json({ mensaje: "ID de laboratorio inválido" });
        }

        const laboratorio = await prisma.laboratorio.findUnique({
            where: { id_laboratorio: idLaboratorio },
            select: {
                id_laboratorio: true,
                nombre: true,
                productos: {
                    select: {
                        descripcion: true,
                        principio_activo: true,
                        concentracion: true,
                        registro_sanitario: true,
                        cum_pactado: true,
                        costo_compra: true,
                        regulacion_tableta: true,
                        regulacion_empaque: true,
                    },
                },
            },
        });

        if (!laboratorio) {
            return res.status(404).json({ mensaje: "Laboratorio no encontrado" });
        }

        if (laboratorio.productos.length === 0) {
            return res.status(404).json({ mensaje: "No hay productos en este laboratorio" });
        }

        // Crear el archivo Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(laboratorio.nombre);

        // Encabezados de la tabla
        const encabezados = [
            "Descripción del Producto",
            "Principio Activo",
            "Concentración",
            "Registro Sanitario",
            "CUM Pactado",
            "Costo de Compra (COP)",
            "Regulación Tableta",
            "Regulación Empaque",
        ];
        worksheet.addRow(encabezados);

        // Llenar filas con los productos
        laboratorio.productos.forEach((producto) => {
            const fila = [
                producto.descripcion ?? "Sin descripción",
                producto.principio_activo || "",
                producto.concentracion || "",
                producto.registro_sanitario || "",
                producto.cum_pactado || "",
                producto.costo_compra ?? 0,
                producto.regulacion_tableta ?? "N/A",
                producto.regulacion_empaque ?? "N/A",
            ];
            worksheet.addRow(fila);
        });

        // Configurar encabezados para la descarga
        const nombreArchivo = `productos_${laboratorio.nombre.replace(/[^a-zA-Z0-9-_]/g, "_")}`;
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${nombreArchivo}_productos.xlsx"`
        );

        // Enviar el archivo Excel como respuesta
        await workbook.xlsx.write(res);
        if (!res.finished) res.end();
    } catch (error) {
        console.error("Error al exportar productos del laboratorio:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
};

export  {
    MostrarLaboratorios,
    MostrarLaboratorio,
    CrearLaboratorio,
    EditarLaboratorio,
    EliminarLaboratorio,
    exportarProductosLaboratorio
};
