/**
 * @author Deivid Cardenas
 * @version 1.0.0
 * 
 * Rutas de Producto
 * Define las rutas para la gestión de productos en el sistema.
 */

const { Router } = require("express");
const router = Router();

const { 
    MostrarProductos, 
    MostrarProductoPorId, 
    CrearProducto, 
    EditarProducto, 
    EliminarProducto 
} = require("../../controllers/productos/Producto.Controller");

/* ========================== Productos ========================== */

router.get("/", MostrarProductos);                  // Obtener todos los productos
router.get("/:id_producto", MostrarProductoPorId);  // Obtener un producto por ID
router.post("/", CrearProducto);                    // Crear un nuevo producto
router.put("/:id_producto", EditarProducto);        // Editar un producto por ID
router.delete("/:id_producto", EliminarProducto);   // Eliminar un producto por ID

module.exports = router;
