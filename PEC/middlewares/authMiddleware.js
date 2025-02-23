const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const VerificarAcceso = ({ rolesPermitidos = [], permisosRequeridos = [] }) => {
    return async (req, res, next) => {
        try {
            let token = req.header("Authorization");
            if (!token) {
                return res.status(401).json({ msg: "Acceso denegado. Token no proporcionado." });
            }

            // Manejar "Bearer <token>"
            if (token.startsWith("Bearer ")) {
                token = token.slice(7, token.length);
            }

            // Verificar y decodificar el token
            const decoded = jwt.verify(token, process.env.AUTH_JW_SECRET_KEY);
            req.usuario = decoded;

            const usuario = await prisma.usuario.findUnique({
                where: { id_usuario: decoded.id_usuario },
                include: {
                    rol: {
                        include: {
                            permisos: {
                                include: { permiso: true }
                            }
                        }
                    }
                }
            });

            if (!usuario) {
                return res.status(401).json({ msg: "Usuario no encontrado o inactivo." });
            }

            const permisosUsuario = usuario.rol.permisos.map(p => p.permiso.nombre);

            // Verificar rol
            if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuario.rol.nombre)) {
                return res.status(403).json({ msg: "No tienes el rol adecuado para acceder a esta ruta." });
            }

            // Verificar permisos
            if (permisosRequeridos.length > 0) {
                const tienePermiso = permisosRequeridos.some(permiso => permisosUsuario.includes(permiso));

                if (!tienePermiso) {
                    return res.status(403).json({ msg: "No tienes permisos para acceder a esta ruta." });
                }
            }

            next(); // Permitir acceso a la siguiente función
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ msg: "Token expirado, por favor inicia sesión nuevamente." });
            }
            return res.status(401).json({ msg: "Token inválido o no autorizado." });
        }
    };
};

module.exports = { VerificarAcceso };
