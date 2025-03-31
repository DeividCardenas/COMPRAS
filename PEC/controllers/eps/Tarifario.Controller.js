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

      // Agregar campos opcionales
      const extraFields = ["regulacion", "codigo_barras"];
      if (campos) {
          campos.split(",").map(campo => campo.trim()).forEach(field => {
              if (extraFields.includes(field)) selectFields[field] = true;
          });
      }

      // Buscar tarifario
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
