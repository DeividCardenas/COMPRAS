/**
 * Rutas de Proveedor
 * Define las rutas para la gestión de proveedores en el sistema.
 * Incluye operaciones CRUD para proveedores.
 */

const { Router } = require("express");
const router = Router();

const {
    MostrarProveedores,
    CrearProveedor,
    EditarProveedor,
    EliminarProveedor,
    validarProveedor,
    validarEdicionProveedor

} = require("../../controllers/proveedores/Proveedor.Controller");

/* ========================== Proveedores ========================== */

router.get("/", MostrarProveedores);                  // Obtener todos los proveedores
router.post("/", validarProveedor, CrearProveedor);   // Crear un nuevo proveedor
router.put("/:id_proveedor", validarEdicionProveedor, EditarProveedor);        // Editar un proveedor por ID
router.delete("/:id_proveedor", EliminarProveedor);   // Eliminar un proveedor por ID

module.exports = router;
