// Importación de módulos necesarios
const express = require("express");
const cors = require("cors");

// Clase principal del servidor
class Server {
  constructor() {
    // Inicialización de la aplicación Express
    this.app = express();

    // Definición del puerto desde variables de entorno o valor por defecto
    this.port = process.env.PORT || 2000;

    // Prefijo base para todas las rutas del servidor
    this.path = "/pec/";

    // Llamado a métodos de configuración
    this.middlewares();   // Configuración de middlewares
    this.routes();        // Definición de rutas
    this.errorHandler();  // Manejo de errores
  }

  /**
   * Configura los middlewares globales del servidor.
   */
  middlewares() {
    this.app.use(cors());           // Habilita CORS para permitir solicitudes de otros dominios
    this.app.use(express.json());   // Permite recibir y procesar JSON en las solicitudes
  }

  /**
   * Define todas las rutas del servidor agrupadas por módulo.
   */
  routes() {
    // Rutas de autenticación y usuarios
    this.app.use(this.path + "usuario", require("../routes/auth/Usuario.Routes"));
    this.app.use(this.path + "token", require("../routes/auth/token.Routes"));

    // Rutas relacionadas con roles y permisos
    this.app.use(this.path + "rol", require("../routes/roles/Rol.routes"));
    this.app.use(this.path + "permiso", require("../routes/roles/Permiso.routes"));
    this.app.use(this.path + "permiso-rol", require("../routes/roles/PermisoOnRol.routes"));

    // Rutas de productos
    this.app.use(this.path + "producto", require("../routes/productos/Producto.routes"));
    this.app.use(this.path + "tarifario-producto", require("../routes/productos/TarifarioOnProducto.routes"));

    // Rutas de empresas y laboratorios
    this.app.use(this.path + "empresa", require("../routes/empresas/Empresa.routes"));
    this.app.use(this.path + "laboratorio", require("../routes/empresas/Laboratorio.routes"));
    this.app.use(this.path + "empresa-laboratorio", require("../routes/empresas/EmpresaOnLaboratorio.routes"));
  // Rutas de proveedores
  this.app.use(this.path + "proveedores", require("../routes/proveedores/Proveedor.routes"));

    // Rutas para EPS y tarifarios
    this.app.use(this.path + "eps", require("../routes/eps/EPS.routes"));
    this.app.use(this.path + "tarifario", require("../routes/eps/Tarifario.routes"));
    this.app.use(this.path + "permiso-tarifario", require("../routes/roles/PermisoOnTarifario.routes"));
    // Ruta para comparador
    this.app.use(this.path + "compare", require("../routes/compare/Compare.routes"));
    // Ruta para debug (diagnóstico)
    this.app.use(this.path + "debug", require("../routes/debug/Debug.routes"));
  }

  /**
   * Middleware de manejo global de errores.
   */
  errorHandler() {
    this.app.use((err, req, res, next) => {
      console.error(err); // Muestra el error en la consola para depuración
      res.status(500).json({ msg: "Ocurrió un error en el servidor." }); // Respuesta genérica al cliente
    });
  }

  /**
   * Inicia el servidor y escucha en el puerto configurado.
   */
  listen() {
    this.app.listen(this.port, '0.0.0.0', () => {
      console.log(`Servidor funcionando en el puerto: ${this.port}`);
    });
  }
}

// Exportación de la clase para su uso en otros archivos
module.exports = Server;
