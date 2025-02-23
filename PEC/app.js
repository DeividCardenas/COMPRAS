require("dotenv").config(); // Cargar variables de entorno al inicio

const Server = require("./models/server");

const server = new Server();

server.listen();
