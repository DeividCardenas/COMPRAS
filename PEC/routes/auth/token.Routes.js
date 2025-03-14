const { Router } = require("express");
const { CreateJWT } = require("../../middlewares/jwt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = Router();

router.post("/generar-token", async (req, res) => {
  const { id_usuario } = req.body;

  if (!id_usuario) {
    return res.status(400).json({ msg: "id_usuario es obligatorio" });
  }

  try {
    // Buscar usuario con rol, permisos y tarifarios asociados
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario },
      include: {
        rol: {
          include: {
            permisos: {
              include: { permiso: true }
            }
          }
        },
        rol: {
          include: {
            permisos: {
              include: {
                permiso: {
                  include: {
                    tarifarios: {
                      include: { tarifario: true }
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
      return res.status(404).json({ msg: "Usuario no encontrado o inactivo" });
    }

    const rol = usuario.rol.nombre;
    const permisos = usuario.rol.permisos.map(p => p.permiso.nombre);

    // Obtener los tarifarios y sus permisos asociados
    const tarifarios = usuario.rol.permisos.flatMap(p =>
      p.permiso.tarifarios.map(t => ({
        id_tarifario: t.id_tarifario,
        nombre_tarifario: t.tarifario.nombre,
        permiso: p.permiso.nombre
      }))
    );

    // Generar token con rol, permisos y tarifarios
    const { token, expiresIn } = CreateJWT({ id_usuario, rol, permisos, tarifarios });

    res.json({ token, expiresIn });
  } catch (error) {
    console.error("Error al generar token:", error);
    res.status(500).json({ msg: "Error al generar token" });
  }
});

module.exports = router;

