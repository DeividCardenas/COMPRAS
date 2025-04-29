/**
 * Rutas de Tarifario - Producto
 * Define las rutas para la gestión de la relación entre tarifarios y productos.
 * Incluye operaciones para asignar y eliminar productos de tarifarios.
 */

const { Router } = require("express");
const router = Router();

const { 
    AsignarProductoATarifario, 
    EliminarProductoDeTarifario 
} = require("../../controllers/productos/TarifarioOnProducto.Controller");

/* ========================== Tarifario - Producto ========================== */

router.post("/", AsignarProductoATarifario);                                    // Asignar un producto a un tarifario
router.delete("/:id_tarifario/:id_producto", EliminarProductoDeTarifario);      // Eliminar un producto de un tarifario

module.exports = router;
