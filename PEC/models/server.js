const express = require("express");
const cors = require("cors");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 2000;
    this.path = "/pec/";
    
    this.middlewares();
    this.routes();
    this.errorHandler();
  }

  middlewares() {
    this.app.use(cors()); // Habilitar CORS solo aquí
    this.app.use(express.json()); // Habilitar JSON parser
  }

  routes() {
    this.app.use(this.path + "Usuario", require("../routes/auth/Usuario.Routes"));
    this.app.use(this.path + "rol", require("../routes/roles/Rol.routes"));
    this.app.use(this.path + "permiso", require("../routes/roles/Permiso.routes"));
    this.app.use(this.path + "permiso-rol", require("../routes/roles/PermisoOnRol.routes"));
    this.app.use(this.path + "producto", require("../routes/productos/Producto.routes"));
    this.app.use(this.path + "empresa", require("../routes/empresas/Empresa.routes"));
    this.app.use(this.path + "laboratorio", require("../routes/empresas/Laboratorio.routes"));
    this.app.use(this.path + "empresa-laboratorio", require("../routes/empresas/EmpresaOnLaboratorio.routes"));
    this.app.use(this.path + "eps", require("../routes/eps/EPS.routes"));
    this.app.use(this.path + "tarifario", require("../routes/eps/Tarifario.routes"));
    this.app.use(this.path + "permiso-tarifario", require("../routes/roles/PermisoOnTarifario.routes"));
    this.app.use(this.path + "tarifario-producto", require("../routes/productos/TarifarioOnProducto.routes"));
  }

  errorHandler() {
    this.app.use((err, req, res, next) => {
      console.error(err);
      res.status(500).json({ msg: "Ocurrió un error en el servidor." });
    });
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Servidor funcionando en el puerto: ${this.port}`);
    });
  }
}

module.exports = Server;
