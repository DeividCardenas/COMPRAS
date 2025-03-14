const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const VerificarAcceso = ({ rolesPermitidos = [], permisosRequeridos = [], verificarTarifario = false }) => {
    return async (req, res, next) => {
        try {
            const token = extraerToken(req);
            if (!token) return res.status(401).json({ msg: "Acceso denegado. Token no proporcionado." });

            const decoded = jwt.verify(token, process.env.AUTH_JW_SECRET_KEY);
            req.usuario = decoded;

            const usuario = await buscarUsuarioConRol(decoded.id_usuario);
            if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado o inactivo." });

            if (!verificarRol(usuario, rolesPermitidos)) {
                return res.status(403).json({ msg: "No tienes el rol adecuado para acceder a esta ruta." });
            }

            if (!verificarPermisos(usuario, permisosRequeridos)) {
                return res.status(403).json({ 
                    msg: "No tienes los permisos necesarios para acceder a esta ruta.",
                    permisosRequeridos,
                    permisosUsuario: usuario.rol.permisos.map(p => p.permiso.nombre)
                });
            }

            if (verificarTarifario && !(await verificarAccesoTarifario(req, usuario))) {
                return res.status(403).json({ msg: "No tienes acceso a este tarifario." });
            }

            next();
        } catch (err) {
            manejarError(err, res);
        }
    };
};

// Función para extraer el token del encabezado
const extraerToken = (req) => {
    let token = req.header("Authorization");
    return token?.startsWith("Bearer ") ? token.slice(7) : token;
};

// Buscar usuario con sus roles y permisos
const buscarUsuarioConRol = async (id_usuario) => {
    return await prisma.usuario.findUnique({
        where: { id_usuario },
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
};

// Verificar rol
const verificarRol = (usuario, rolesPermitidos) => {
    return rolesPermitidos.length === 0 || rolesPermitidos.includes(usuario.rol.nombre);
};

// Verificar permisos
const verificarPermisos = (usuario, permisosRequeridos) => {
    const permisosUsuario = usuario.rol.permisos.map(p => p.permiso.nombre);
    return permisosRequeridos.length === 0 || permisosRequeridos.some(permiso => permisosUsuario.includes(permiso));
};

// Verificar acceso a tarifario
const verificarAccesoTarifario = async (req, usuario) => {
    const { id_tarifario } = req.params;
    if (!id_tarifario) return false;

    return await prisma.permisoOnTarifario.findFirst({
        where: {
            id_tarifario: parseInt(id_tarifario),
            id_permiso: {
                in: usuario.rol.permisos.map(p => p.permiso.id_permiso)
            }
        }
    });
};

// Manejar errores
const manejarError = (err, res) => {
    console.error("Error en la verificación de acceso:", err);
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({ msg: "Token expirado, por favor inicia sesión nuevamente." });
    }
    return res.status(401).json({ msg: "Token inválido o no autorizado." });
};

module.exports = { VerificarAcceso };
