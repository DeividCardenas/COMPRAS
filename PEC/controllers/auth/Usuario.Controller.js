/**
 * @author Deivid Cardenas
 * @version 1.0.1
 * 
 * Controlador de usuario actualizado para Prisma con TypeScript
 */

const { response, request } = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require("bcrypt");
const { Encrypt } = require('../../middlewares/validate');
const { CreateJWT } = require('../../middlewares/jwt');

const prisma = new PrismaClient();

// Mostrar todos los usuarios
const MostrarUsuarios = async (req = request, res = response) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            include: { rol: true }
        });
        res.json({ usuarios });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Agregar un nuevo usuario
const AgregarUsuario = async (req, res) => {
    let { username, email, password, id_rol } = req.body;

    try {
        // Hash de la contraseña
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

// Mostrar un usuario por id
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

// Editar un usuario
const EditarUsuario = async (req = request, res = response) => {
    const { id_usuario } = req.params;
    const { username, email, password, id_rol } = req.body;

    try {
        const updateData = { username, email, id_rol };
        if (password) {
            updateData.password = Encrypt(password);
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

// Eliminar un usuario
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

// Iniciar sesión (Login)
// Iniciar sesión (Login)
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

        // Verificar contraseña
        const passwordMatch = await bcrypt.compare(password, usuario.password);
        if (!passwordMatch) {
            return res.status(400).json({ msg: "Contraseña incorrecta" });
        }

        // Extraer permisos
        const permisos = usuario.rol.permisos?.map(p => p.permiso.nombre) || [];
        
        // Extraer tarifarios permitidos desde los permisos
        const tarifarios = usuario.rol.permisos?.flatMap(p => 
            p.permiso.tarifarios.map(pt => pt.id_tarifario)
        ) || [];

        // Crear token JWT incluyendo permisos y tarifarios
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

// Cerrar sesión (Logout)
const Exit = async (req = request, res = response) => {
    try {
        res.json({ msg: "Sesión cerrada correctamente" });
    } catch (err) {
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
