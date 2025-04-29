/**
 * Rutas de Producto
 * Define las rutas para la gestión de productos en el sistema.
 * Incluye operaciones CRUD para productos.
 */

const { Router } = require("express");
const router = Router();

const { 
    MostrarProductos,
    CrearProducto, 
    EditarProducto, 
    EliminarProducto,
    validarProducto,
    validarEdicionProducto

} = require("../../controllers/productos/Producto.Controller");

/* ========================== Productos ========================== */

router.get("/", MostrarProductos);                  // Obtener todos los productos
router.post("/", validarProducto, CrearProducto);   // Crear un nuevo producto
router.put("/:id_producto", validarEdicionProducto, EditarProducto);        // Editar un producto por ID
router.delete("/:id_producto", EliminarProducto);   // Eliminar un producto por ID

module.exports = router;
