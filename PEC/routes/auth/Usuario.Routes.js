/**
 * @author Deivid Cardenas
 * @version 1.0.0
 * 
 * Rutas de Usuarios
 * Define las rutas para la gestión de usuarios en el sistema.
 */

const { Router } = require('express');
const router = Router();

const { 
    MostrarUsuarios, 
    AgregarUsuario, 
    MostrarUsuario, 
    EditarUsuario, 
    EliminarUsuario, 
    Login, 
    Exit 
} = require('../../controllers/auth/Usuario.Controller');

/* ========================== Gestión de Usuarios ========================== */

router.get('/', MostrarUsuarios);             // Obtener todos los usuarios
router.get('/:id_usuario', MostrarUsuario);   // Obtener un usuario por ID
router.post('/', AgregarUsuario);             // Agregar un nuevo usuario
router.put('/:id_usuario', EditarUsuario);    // Editar un usuario por ID
router.delete('/:id_usuario', EliminarUsuario); // Eliminar un usuario por ID

/* ============================== Autenticación ============================= */

router.post('/login', Login);  // Iniciar sesión
router.post('/logout', Exit);    // Cerrar sesión

module.exports = router;
