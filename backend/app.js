// Carga las variables de entorno desde un archivo .env
require("dotenv").config(); // Esto debe hacerse al inicio antes de usar variables de entorno

// Importa la clase Server desde la carpeta models
const Server = require("./models/server");

// Crea una nueva instancia del servidor
const server = new Server();

// Inicia el servidor en el puerto definido 
server.listen();
