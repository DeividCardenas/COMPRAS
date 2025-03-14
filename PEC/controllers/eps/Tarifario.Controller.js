import { PrismaClient } from "@prisma/client";
import { validationResult, param, body } from "express-validator";
import ExcelJS from "exceljs";
const prisma = new PrismaClient();

// Middleware de validaciones
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

const validarIdTarifario = [
  param("id_tarifario")
    .isInt()
    .withMessage("El ID del tarifario debe ser un número entero."),
];

// Obtener todos los tarifarios con paginación y búsqueda
const MostrarTarifarios = async (req, res) => {
  const { page = 1, limit = 10, nombre } = req.query;
  const skip = (page - 1) * limit;

  try {
    const where = nombre
      ? { nombre: { contains: nombre, mode: "insensitive" } }
      : {};

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
  if (!errors.isEmpty())
    return res.status(400).json({ errores: errors.array() });

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
  if (!errors.isEmpty())
    return res.status(400).json({ errores: errors.array() });

  const { id_tarifario } = req.params;

  try {
    const tarifario = await prisma.tarifario.findUnique({
      where: { id_tarifario: Number(id_tarifario) },
      include: {
        productos: {
          include: {
            producto: {
              select: {
                id_producto: true,
                codigo_magister: false,
                cum_pactado: true,
                descripcion: true,
                principio_activo: true,
                concentracion: true,
                registro_sanitario: true,
                costo_compra: false,
                regulacion_tableta: false,
                regulacion_empaque: false,
              },
            },
          },
        },
        permisos: true,
      },
    });

    if (!tarifario)
      return res.status(404).json({ msg: "Tarifario no encontrado" });

    // Transformar los productos para incluir los precios del tarifario
    const productosConPrecios = tarifario.productos.map((producto) => ({
      id_producto: producto.producto.id_producto,
      cum_pactado: producto.producto.cum_pactado,
      descripcion: producto.producto.descripcion,
      principio_activo: producto.producto.principio_activo,
      concentracion: producto.producto.concentracion,
      registro_sanitario: producto.producto.registro_sanitario,
      precio: producto.precio,
      precio_unidad: producto.precio_unidad,
      precio_empaque: producto.precio_empaque,
    }));

    res.json({ ...tarifario, productos: productosConPrecios });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Editar un tarifario
const EditarTarifario = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errores: errors.array() });

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
  if (!errors.isEmpty())
    return res.status(400).json({ errores: errors.array() });

  const { id_tarifario } = req.params;
  try {
    await prisma.tarifario.delete({
      where: { id_tarifario: Number(id_tarifario) },
    });
    res.json({ msg: "Tarifario eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

    const encabezados = ["ID Producto", ...camposSeleccionados, "Precio", "Precio Unidad", "Precio Empaque"];
    worksheet.addRow(encabezados);

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

const exportarTarifarioSimplificado = async (req, res) => {
  const { id_tarifario } = req.params;

  try {
    const idTarifario = Number(id_tarifario);
    if (isNaN(idTarifario)) {
      return res.status(400).json({ mensaje: "ID de tarifario inválido" });
    }

    const camposSeleccionados = [
      "descripcion",
      "principio_activo",
      "concentracion",
      "cum_pactado",
    ];

    const tarifario = await prisma.tarifario.findUnique({
      where: { id_tarifario: idTarifario },
      select: {
        id_tarifario: true,
        nombre: true,
        productos: {
          select: {
            producto: {
              select: {
                descripcion: true,
                principio_activo: true,
                concentracion: true,
                cum_pactado: true,
              },
            },
            precio: true,
            precio_unidad: true,
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

    const encabezados = [
      "Descripción del Producto",
      "Principio Activo",
      "Concentración",
      "CUM Pactado",
      "Precio (COP)",
      "Precio por Unidad (COP)",
    ];
    worksheet.addRow(encabezados);

    tarifario.productos.forEach((item) => {
      const fila = [
        item.producto?.descripcion ?? "Sin descripción",
        item.producto?.principio_activo || "",
        item.producto?.concentracion || "",
        item.producto?.cum_pactado || "",
        item.precio,
        item.precio_unidad,
      ];
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
  validarTarifario,
  validarIdTarifario,
  exportarTarifario,
  exportarTarifarioSimplificado,
};
