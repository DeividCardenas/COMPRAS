// Importa la biblioteca jsonwebtoken para crear tokens JWT
const jwt = require("jsonwebtoken");

/**
 * Crea un token JWT con la información del usuario.
 *
 * @param {Object} data - Objeto con los datos necesarios para el token.
 * @param {number|string} data.id_usuario - Identificador único del usuario.
 * @param {string} data.rol - Rol asignado al usuario (ej: "admin", "user").
 * @param {Array} [data.permisos=[]] - Lista de permisos específicos asignados al usuario.
 *
 * @returns {{ token: string, expiresIn: string }} - Objeto con el token generado y su tiempo de expiración.
 *
 * @throws {Error} Si no se encuentra la clave secreta en las variables de entorno o falla la generación del token.
 */
const CreateJWT = (data) => {
  // Desestructura los campos esperados, con permisos como arreglo por defecto
  const { id_usuario, rol, permisos = [] } = data;

  // Verifica que exista la clave secreta para firmar el token
  if (!process.env.AUTH_JW_SECRET_KEY) {
    throw new Error("Falta la clave secreta AUTH_JW_SECRET_KEY en las variables de entorno.");
  }

  try {
    // Genera el token JWT con los datos del usuario
    const token = jwt.sign(
      { id_usuario, rol, permisos }, // Payload del token
      process.env.AUTH_JW_SECRET_KEY, // Clave secreta
      {
        expiresIn: "8h",      // Duración del token
        algorithm: "HS256",   // Algoritmo de cifrado
      }
    );

    // Devuelve el token y su expiración como respuesta
    return { token, expiresIn: "8h" };
  } catch (error) {
    console.error("Error al crear el token JWT:", error);
    throw new Error("Error al generar el token.");
  }
};

// Exporta la función para que pueda usarse en otras partes del proyecto
module.exports = { CreateJWT };
