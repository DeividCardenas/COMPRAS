/**
 * @author Deivid Cardenas
 * @version 1.0.0
 * 
 * Rutas de Permisos
 * Define las rutas para la gestión de permisos en el sistema.
 */

const { Router } = require('express');
const router = Router();

const { 
    MostrarPermisos, 
    CrearPermiso, 
    MostrarPermiso, 
    EditarPermiso, 
    EliminarPermiso 
} = require('../../controllers/roles/Permiso.Controller');

/* ========================== Permisos ========================== */

router.get('/', MostrarPermisos);                     // Obtener todos los permisos
router.get('/:id_permiso', MostrarPermiso);           // Obtener un permiso por ID
router.post('/', CrearPermiso);                       // Crear un nuevo permiso
router.put('/:id_permiso', EditarPermiso);            // Editar un permiso por ID
router.delete('/:id_permiso', EliminarPermiso);       // Eliminar un permiso por ID

module.exports = router;
