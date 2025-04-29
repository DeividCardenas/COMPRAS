// Importa jsonwebtoken para verificar tokens JWT
const jwt = require("jsonwebtoken");

// Importa Prisma Client para acceder a la base de datos
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Middleware para verificar el acceso basado en roles, permisos y/o tarifas específicas.
 *
 * @param {Object} opciones - Opciones de control de acceso.
 * @param {Array<string>} [opciones.rolesPermitidos=[]] - Lista de roles autorizados para acceder a la ruta.
 * @param {Array<string>} [opciones.permisosRequeridos=[]] - Permisos específicos requeridos para acceder.
 * @param {boolean} [opciones.verificarTarifario=false] - Si se debe validar acceso a un tarifario vía permisos asociados.
 *
 * @returns {Function} Middleware Express.
 */
const VerificarAcceso = ({ rolesPermitidos = [], permisosRequeridos = [], verificarTarifario = false }) => {
    return async (req, res, next) => {
        try {
            // Extraer el token JWT del encabezado Authorization
            const token = extraerToken(req);
            if (!token) return res.status(401).json({ msg: "Acceso denegado. Token no proporcionado." });

            // Verificar y decodificar el token
            const decoded = jwt.verify(token, process.env.AUTH_JW_SECRET_KEY);
            req.usuario = decoded; // Agrega info del usuario al request para su uso posterior

            // Consultar en la base de datos el usuario con sus roles y permisos
            const usuario = await buscarUsuarioConRol(decoded.id_usuario);
            if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado o inactivo." });

            // Validar si el rol del usuario está autorizado
            if (!verificarRol(usuario, rolesPermitidos)) {
                return res.status(403).json({ msg: "No tienes el rol adecuado para acceder a esta ruta." });
            }

            // Validar si el usuario tiene los permisos necesarios
            if (!verificarPermisos(usuario, permisosRequeridos)) {
                return res.status(403).json({ 
                    msg: "No tienes los permisos necesarios para acceder a esta ruta.",
                    permisosRequeridos,
                    permisosUsuario: usuario.rol.permisos.map(p => p.permiso.nombre)
                });
            }

            // Verificación adicional si la ruta requiere acceso a un tarifario específico
            if (verificarTarifario && !(await verificarAccesoTarifario(req, usuario))) {
                return res.status(403).json({ msg: "No tienes acceso a este tarifario." });
            }

            // Si pasa todas las validaciones, continúa con la siguiente función/middleware
            next();
        } catch (err) {
            manejarError(err, res);
        }
    };
};

/**
 * Extrae el token JWT del encabezado Authorization.
 *
 * @param {Request} req - Objeto de solicitud Express.
 * @returns {string|null} - Token sin el prefijo 'Bearer ', o null si no existe.
 */
const extraerToken = (req) => {
    let token = req.header("Authorization");
    return token?.startsWith("Bearer ") ? token.slice(7) : token;
};

/**
 * Consulta en la base de datos al usuario y carga su rol y permisos.
 *
 * @param {number} id_usuario - ID del usuario autenticado.
 * @returns {Promise<Object|null>} - Usuario con su rol y permisos, o null si no existe.
 */
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

/**
 * Verifica si el rol del usuario está dentro de los roles permitidos.
 *
 * @param {Object} usuario - Usuario obtenido de la base de datos.
 * @param {Array<string>} rolesPermitidos - Lista de nombres de roles autorizados.
 * @returns {boolean} - True si tiene rol permitido o si no se especificaron roles.
 */
const verificarRol = (usuario, rolesPermitidos) => {
    return rolesPermitidos.length === 0 || rolesPermitidos.includes(usuario.rol.nombre);
};

/**
 * Verifica si el usuario tiene al menos uno de los permisos requeridos.
 *
 * @param {Object} usuario - Usuario con su lista de permisos.
 * @param {Array<string>} permisosRequeridos - Lista de permisos requeridos.
 * @returns {boolean} - True si tiene al menos un permiso requerido o si no se requieren permisos.
 */
const verificarPermisos = (usuario, permisosRequeridos) => {
    const permisosUsuario = usuario.rol.permisos.map(p => p.permiso.nombre);
    return permisosRequeridos.length === 0 || permisosRequeridos.some(permiso => permisosUsuario.includes(permiso));
};

/**
 * Verifica si el usuario tiene permisos sobre un tarifario específico.
 *
 * @param {Request} req - Objeto de solicitud Express (con id_tarifario en params).
 * @param {Object} usuario - Usuario autenticado con permisos.
 * @returns {Promise<boolean>} - True si tiene acceso al tarifario, false si no.
 */
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

/**
 * Maneja errores de autenticación y autorización.
 *
 * @param {Error} err - Error capturado.
 * @param {Response} res - Objeto de respuesta Express.
 */
const manejarError = (err, res) => {
    console.error("Error en la verificación de acceso:", err);
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({ msg: "Token expirado, por favor inicia sesión nuevamente." });
    }
    return res.status(401).json({ msg: "Token inválido o no autorizado." });
};

// Exporta el middleware principal
module.exports = { VerificarAcceso };
