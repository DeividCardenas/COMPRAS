/**
 * Controlador de usuario para Prisma con JavaScript
 * Este archivo contiene las funciones del controlador para manejar las operaciones CRUD
 * sobre los usuarios, así como la lógica de autenticación y autorización.
 */

const { response, request } = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require("bcrypt");
const { Encrypt } = require('../../middlewares/validate');
const { CreateJWT } = require('../../middlewares/jwt');

const prisma = new PrismaClient();

/**
 * Función para obtener todos los usuarios.
 * 
 * @param {request} req - Objeto de solicitud.
 * @param {response} res - Objeto de respuesta.
 * @returns {Object} Lista de usuarios con sus roles asociados.
 */
const MostrarUsuarios = async (req = request, res = response) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            include: { rol: true } // Incluye los roles asociados a los usuarios.
        });
        res.json({ usuarios });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Función para agregar un nuevo usuario.
 * 
 * @param {request} req - Objeto de solicitud con los datos del usuario.
 * @param {response} res - Objeto de respuesta.
 * @returns {Object} Información del usuario creado.
 */
const AgregarUsuario = async (req, res) => {
    let { username, email, password, id_rol } = req.body;

    try {
        // Encriptar la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const usuario = await prisma.usuario.create({
            data: { 
                username, 
                email, 
                password: hashedPassword,
                id_rol 
            }
        });

        res.json({ usuario });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Función para mostrar un usuario específico por su ID.
 * 
 * @param {request} req - Objeto de solicitud con el ID del usuario en los parámetros.
 * @param {response} res - Objeto de respuesta con los detalles del usuario.
 * @returns {Object} Datos del usuario encontrado.
 */
const MostrarUsuario = async (req = request, res = response) => {
    const { id_usuario } = req.params;

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id_usuario: Number(id_usuario) },
            include: { rol: true }
        });

        if (usuario) {
            res.json({ usuario });
        } else {
            res.status(404).json({ msg: "Usuario no encontrado" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Función para editar los datos de un usuario.
 * 
 * @param {request} req - Objeto de solicitud con los datos actualizados y el ID del usuario.
 * @param {response} res - Objeto de respuesta con el usuario actualizado.
 * @returns {Object} Usuario editado.
 */
const EditarUsuario = async (req = request, res = response) => {
    const { id_usuario } = req.params;
    const { username, email, password, id_rol } = req.body;

    try {
        const updateData = { username, email, id_rol };
        if (password) {
            updateData.password = Encrypt(password); // Encriptar la nueva contraseña si es proporcionada.
        }

        const usuario = await prisma.usuario.update({
            where: { id_usuario: Number(id_usuario) },
            data: updateData
        });

        res.json({ usuario });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Función para eliminar un usuario por su ID.
 * 
 * @param {request} req - Objeto de solicitud con el ID del usuario.
 * @param {response} res - Objeto de respuesta indicando si se eliminó correctamente.
 * @returns {Object} Mensaje de éxito al eliminar el usuario.
 */
const EliminarUsuario = async (req = request, res = response) => {
    const { id_usuario } = req.params;

    try {
        await prisma.usuario.delete({
            where: { id_usuario: Number(id_usuario) }
        });
        res.json({ msg: "Usuario eliminado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Función para iniciar sesión (login) de un usuario.
 * 
 * @param {request} req - Objeto de solicitud con el email y la contraseña del usuario.
 * @param {response} res - Objeto de respuesta con los detalles del usuario y el token JWT.
 * @returns {Object} Detalles del usuario autenticado y el token JWT generado.
 */
const Login = async (req, res) => {
    let { email, password } = req.body;

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { email },
            include: {
                rol: {
                    include: {
                        permisos: {
                            include: {
                                permiso: {
                                    include: {
                                        tarifarios: {
                                            include: {
                                                tarifario: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!usuario) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        // Verificar la contraseña ingresada con la almacenada
        const passwordMatch = await bcrypt.compare(password, usuario.password);
        if (!passwordMatch) {
            return res.status(400).json({ msg: "Contraseña incorrecta" });
        }

        // Extraer permisos y tarifarios asociados al usuario
        const permisos = usuario.rol.permisos?.map(p => p.permiso.nombre) || [];
        const tarifarios = usuario.rol.permisos?.flatMap(p => 
            p.permiso.tarifarios.map(pt => pt.id_tarifario)
        ) || [];

        // Crear un token JWT para el usuario
        const userJWT = CreateJWT({ 
            id_usuario: usuario.id_usuario,
            rol: usuario.rol.nombre,
            permisos,
            tarifarios
        });

        res.json({
            usuario: { 
                id_usuario: usuario.id_usuario, 
                username: usuario.username, 
                email: usuario.email, 
                rol: usuario.rol.nombre, 
                permisos,
                tarifarios
            },
            userJWT
        });
    } catch (err) {
        console.error("Error en el login:", err);
        res.status(500).json({ msg: "Error interno del servidor" });
    }
};

/**
 * Función para cerrar sesión (logout) del usuario.
 * 
 * @param {request} req - Objeto de solicitud.
 * @param {response} res - Objeto de respuesta con un mensaje de éxito.
 * @returns {Object} Mensaje indicando que la sesión fue cerrada.
 */
const Exit = async (req = request, res = response) => {
    try {
        res.json({ msg: "Sesión cerrada correctamente" });
    } catch (err) {
        console.error("Error al cerrar sesión:", err);
        res.status(500).json({ msg: "Error al cerrar sesión" });
    }
};

module.exports = {
    MostrarUsuarios,
    AgregarUsuario,
    MostrarUsuario,
    EditarUsuario,
    EliminarUsuario,
    Login,
    Exit
};
