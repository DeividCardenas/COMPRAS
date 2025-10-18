const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listarTarifarioPorProducto = async (req, res) => {
  try {
    const { id_producto } = req.params;
    const parsed = Number(id_producto);
    if (isNaN(parsed) || parsed <= 0) {
      return res.status(400).json({ msg: 'id_producto inválido' });
    }

    const rows = await prisma.tarifarioOnProducto.findMany({
      where: { id_producto: parsed },
      include: { tarifario: true, producto: true },
    });

    res.json({ count: rows.length, rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al listar tarifarioOnProducto', detalle: error.message });
  }
};

module.exports = { listarTarifarioPorProducto };
