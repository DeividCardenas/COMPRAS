/** 
 * Controlador de Tarifario 
 * Este controlador maneja la lógica de negocio para la gestión de tarifarios en la aplicación, 
 * incluyendo operaciones de creación, lectura, actualización y eliminación (CRUD) 
 * junto con la paginación y validación de los datos, también cuenta con la exportación de tarifarios a Excel.
 */

import { PrismaClient } from "@prisma/client";
import { validationResult, param, body } from "express-validator";
import ExcelJS from "exceljs";

// Instancia de Prisma para interactuar con la base de datos
const prisma = new PrismaClient();

// Middleware de validaciones para crear o editar un tarifario
const validarTarifario = [
  body("nombre").notEmpty().withMessage("El nombre es obligatorio."),
  body("id_eps")
    .optional()
    .isInt()
    .withMessage("El ID de EPS debe ser un número entero."),
  body("id_empresa")
    .optional()
    .isInt()
    .withMessage("El ID de Empresa debe ser un número entero."),
];

// Validación para el ID de un tarifario en la URL
const validarIdTarifario = [
  param("id_tarifario")
    .isInt()
    .withMessage("El ID del tarifario debe ser un número entero."),
];

// Obtener todos los tarifarios con paginación y búsqueda
const MostrarTarifarios = async (req, res) => {
  // Desestructuración de parámetros de consulta
  const { page = 1, limit = 10, nombre } = req.query;
  const skip = (page - 1) * limit;

  try {
    // Filtro de búsqueda por nombre
    const where = nombre
      ? { nombre: { contains: nombre, mode: "insensitive" } }
      : {};

    // Buscar tarifarios con las condiciones especificadas
    const tarifarios = await prisma.tarifario.findMany({
      where,
      include: { eps: true, empresa: true, productos: true },
      skip: Number(skip),
      take: Number(limit),
    });

    // Obtener el total de tarifarios para paginación
    const total = await prisma.tarifario.count({ where });
    res.json({ total, page: Number(page), limit: Number(limit), tarifarios });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo tarifario
const CrearTarifario = async (req, res) => {
  // Validar los datos del cuerpo de la solicitud
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errores: errors.array() });

  const { nombre, id_eps, id_empresa } = req.body;
  try {
    // Crear un nuevo tarifario en la base de datos
    const tarifario = await prisma.tarifario.create({
      data: { nombre, id_eps, id_empresa },
    });
    res.status(201).json({ msg: "Tarifario creado exitosamente", tarifario });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mostrar un tarifario específico por ID, con productos y paginación
const MostrarTarifarioPorId = async (req, res) => {
  try {
    // Validar ID del tarifario
    await Promise.all(validarIdTarifario.map(validation => validation.run(req)));
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    const { id_tarifario } = req.params;
    const tarifarioId = parseInt(id_tarifario, 10);
    if (isNaN(tarifarioId) || tarifarioId <= 0) {
      return res.status(400).json({ msg: "ID de tarifario inválido" });
    }

    // Paginación con valores seguros
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    let limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const maxLimit = 50;
    limit = Math.min(limit, maxLimit);
    const skip = (page - 1) * limit;

    // Parámetros de filtrado
    const { cum, descripcion, concentracion, registro_sanitario, presentacion, regulacion, codigo_barras, con_regulacion, campos } = req.query;

    const condiciones = { id_tarifario: tarifarioId };

    // Añadir filtros dinámicos
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
        condiciones.regulacion = { contains: regulacion };
    }

    // Definir campos base obligatorios
    const selectFields = {
        id_producto: true, cum: true, descripcion: true, concentracion: true,
        presentacion: true, registro_sanitario: true, id_laboratorio: true,
        iva: true, createdAt: true, updatedAt: true, laboratorio: { select: { nombre: true } }
    };

    // Campos opcionales para la respuesta
    const extraFields = ["regulacion", "codigo_barras"];
    if (campos) {
        campos.split(",").map(campo => campo.trim()).forEach(field => {
            if (extraFields.includes(field)) selectFields[field] = true;
        });
    }

    // Buscar tarifario por ID
    const tarifario = await prisma.tarifario.findUnique({
        where: { id_tarifario: tarifarioId },
        select: { id_tarifario: true, nombre: true, createdAt: true, updatedAt: true, permisos: true }
    });

    if (!tarifario) {
        return res.status(404).json({ msg: "Tarifario no encontrado" });
    }

    // Obtener productos y total de productos
    const [productos, totalProductos] = await Promise.all([
      prisma.tarifarioOnProducto.findMany({
          where: { id_tarifario: tarifarioId },
          select: {
              producto: { select: selectFields },
              precio: true,
              precio_unidad: true,
              precio_empaque: true,
          },
          take: limit,
          skip,
      }),
      prisma.tarifarioOnProducto.count({ where: { id_tarifario: tarifarioId } })
  ]);

    // Transformar productos para incluir precios del tarifario
    const productosConPrecios = productos.map(({ producto, precio, precio_unidad, precio_empaque }) => ({
        ...producto,
        precio,
        precio_unidad,
        precio_presentacion: precio_empaque,
    }));

    // Responder con la información completa
    res.status(200).json({
        tarifario,
        productos: {
            totalProductos,
            totalPaginas: Math.ceil(totalProductos / limit),
            paginaActual: page,
            tamanoPagina: limit,
            lista: productosConPrecios,
        },
    });

  } catch (error) {
      console.error("Error al obtener el tarifario con productos:", error);
      res.status(500).json({ msg: "Error interno del servidor al obtener el tarifario", error: error.message });
  }
};

// Editar un tarifario existente
const EditarTarifario = async (req, res) => {
  // Validar los datos del cuerpo de la solicitud
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errores: errors.array() });

  const { id_tarifario } = req.params;
  const { nombre } = req.body;
  try {
    // Actualizar el tarifario con el ID proporcionado
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
  // Validar el ID del tarifario
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errores: errors.array() });

  const { id_tarifario } = req.params;
  try {
    // Eliminar el tarifario de la base de datos
    await prisma.tarifario.delete({
      where: { id_tarifario: Number(id_tarifario) },
    });
    res.json({ msg: "Tarifario eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Exportar un tarifario con productos seleccionados en un archivo Excel
const exportarTarifario = async (req, res) => {
  const { id_tarifario } = req.params;
  const camposSeleccionados = req.body.campos || [];

  try {
    const idTarifario = Number(id_tarifario);
    if (isNaN(idTarifario)) {
      return res.status(400).json({ mensaje: "ID de tarifario inválido" });
    }

    if (camposSeleccionados.length === 0) {
      return res.status(400).json({ mensaje: "Debe seleccionar al menos un campo para exportar" });
    }

    // Campos válidos del modelo Producto
    const todosLosCampos = [
      "codigo_magister",
      "cum_pactado",
      "descripcion",
      "costo_compra",
      "regulacion_tableta",
      "regulacion_empaque",
      "principio_activo",
      "concentracion",
      "registro_sanitario",
    ];

    const camposInvalidos = camposSeleccionados.filter(campo => !todosLosCampos.includes(campo));
    if (camposInvalidos.length > 0) {
      return res.status(400).json({ mensaje: `Campos no válidos: ${camposInvalidos.join(", ")}` });
    }

    const camposValidos = camposSeleccionados.reduce((acc, campo) => {
      acc[campo] = true;
      return acc;
    }, { id_producto: true });

    const tarifario = await prisma.tarifario.findUnique({
      where: { id_tarifario: idTarifario },
      select: {
        id_tarifario: true,
        nombre: true,
        productos: {
          select: {
            producto: { select: camposValidos },
            precio: true,
            precio_unidad: true,
            precio_empaque: true,
          },
        },
      },
    });

    if (!tarifario) {
      return res.status(404).json({ mensaje: "Tarifario no encontrado" });
    }

    if (tarifario.productos.length === 0) {
      return res.status(404).json({ mensaje: "No hay productos en este tarifario" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(tarifario.nombre);

    // Encabezados del archivo Excel
    const encabezados = ["ID Producto", ...camposSeleccionados, "Precio", "Precio Unidad", "Precio Empaque"];
    worksheet.addRow(encabezados);

    // Agregar datos de los productos
    tarifario.productos.forEach((item) => {
      const fila = [item.producto?.id_producto];
      camposSeleccionados.forEach((campo) => {
        fila.push(item.producto?.[campo] ?? "");
      });
      fila.push(item.precio, item.precio_unidad, item.precio_empaque);
      worksheet.addRow(fila);
    });

    const nombreArchivo = tarifario.nombre.replace(/[^a-zA-Z0-9-_]/g, "_");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${nombreArchivo}.xlsx"`
    );

    await workbook.xlsx.write(res);
    if (!res.finished) res.end();
  } catch (error) {
    console.error("Error al exportar tarifario:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};


export {
  MostrarTarifarios,
  CrearTarifario,
  MostrarTarifarioPorId,
  EditarTarifario,
  EliminarTarifario,
  exportarTarifario,
  validarTarifario,
  validarIdTarifario,
};
