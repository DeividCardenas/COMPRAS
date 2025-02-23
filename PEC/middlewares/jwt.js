const jwt = require("jsonwebtoken");

const CreateJWT = (data) => {
  const { id_usuario, rol, permisos = [] } = data; // Asegurar que permisos siempre sea un array

  if (!process.env.AUTH_JW_SECRET_KEY) {
    throw new Error("Falta la clave secreta AUTH_JW_SECRET_KEY en las variables de entorno.");
  }

  try {
    const token = jwt.sign(
      { id_usuario, rol, permisos }, // Mantiene permisos en el payload
      process.env.AUTH_JW_SECRET_KEY,
      {
        expiresIn: "8h",
        algorithm: "HS256",
      }
    );

    return { token, expiresIn: "8h" };
  } catch (error) {
    console.error("Error al crear el token JWT:", error);
    throw new Error("Error al generar el token.");
  }
};

module.exports = { CreateJWT };
