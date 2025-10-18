const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * GET /pec/compare/producto/:productoId?tarifarioIds=1,2,3
 * Returns price comparison across tarifarios/EPS/Empresa for a product
 */
const compareProducto = async (req, res) => {
  try {
    let { productoId } = req.params;
    const { tarifarioIds, epsIds, empresaIds, cum } = req.query;

    // If cum is provided, try to resolve productoId by cum
    if (cum) {
      const producto = await prisma.producto.findUnique({ where: { cum: String(cum) } });
      if (!producto) {
        return res.status(404).json({ msg: `No se encontró producto con CUM=${cum}` });
      }
      productoId = String(producto.id_producto);
    }

    // Validate productoId is numeric
    const parsedId = Number(productoId);
    if (!cum && (isNaN(parsedId) || parsedId <= 0)) {
      return res.status(400).json({ msg: 'Parámetro inválido: productoId debe ser un número entero positivo o enviar ?cum=...' });
    }

    // Build where clause
    const where = {
      id_producto: Number(productoId),
    };

    if (tarifarioIds) {
      const ids = String(tarifarioIds).split(",").map((i) => Number(i));
      where.id_tarifario = { in: ids };
    }

    // apply eps/empresa filters via nested where if provided
    const nestedTarifarioFilter = {};
    if (epsIds) {
      nestedTarifarioFilter.id_eps = { in: String(epsIds).split(",").map((i) => Number(i)) };
    }
    if (empresaIds) {
      nestedTarifarioFilter.id_empresa = { in: String(empresaIds).split(",").map((i) => Number(i)) };
    }

    const findOptions = {
      where,
      include: {
        tarifario: {
          include: {
            empresa: true,
            eps: true,
          },
        },
        producto: true,
      },
    };

    if (Object.keys(nestedTarifarioFilter).length > 0) {
      // move the tarifario nested filter into where
      findOptions.where = {
        ...where,
        tarifario: nestedTarifarioFilter,
      };
    }

    // fetch tarifarioOnProducto with relations
    const registros = await prisma.tarifarioOnProducto.findMany(findOptions);

    // Map response
    const result = registros.map((r) => ({
      id_tarifario: r.id_tarifario,
      tarifario_nombre: r.tarifario?.nombre || null,
      empresa_id: r.tarifario?.empresa?.id_empresa || null,
      empresa_nombre: r.tarifario?.empresa?.nombre || null,
      eps_id: r.tarifario?.eps?.id_eps || null,
      eps_nombre: r.tarifario?.eps?.nombre || null,
      precio: r.precio,
      precio_unidad: r.precio_unidad,
      precio_empaque: r.precio_empaque,
    }));
    if (result.length === 0) {
      return res.json({ productoId: Number(productoId), resultados: [] });
    }

    res.json({ productoId: Number(productoId), resultados: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener comparativo", detalle: error.message });
  }
};

module.exports = { compareProducto };
