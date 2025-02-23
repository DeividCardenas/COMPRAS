import axios from 'axios';

// Crea una instancia de Axios con la base URL común
const axiosInstance = axios.create({
  baseURL: '',  // Esta propiedad se actualizará según el endpoint de cada servicio
  timeout: 10000,  // Tiempo máximo de espera para las peticiones
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para actualizar dinámicamente la baseURL
export const setBaseURL = (service: string) => {
  switch (service) {
    case 'usuario':
      axiosInstance.defaults.baseURL = 'http://localhost:2000/pec/usuario';
      break;
    case 'rol':
      axiosInstance.defaults.baseURL = 'http://localhost:2000/pec/rol';
      break;
    case 'permiso':
      axiosInstance.defaults.baseURL = 'http://localhost:2000/pec/permiso';
      break;
    case 'permiso-rol':
      axiosInstance.defaults.baseURL = 'http://localhost:2000/pec/permiso-rol';
      break;
    case 'producto':
      axiosInstance.defaults.baseURL = 'http://localhost:2000/pec/producto';
      break;
    case 'empresa':
      axiosInstance.defaults.baseURL = 'http://localhost:2000/pec/empresa';
      break;
    case 'laboratorio':
      axiosInstance.defaults.baseURL = 'http://localhost:2000/pec/laboratorio';
      break;
    case 'empresa-laboratorio':
      axiosInstance.defaults.baseURL = 'http://localhost:2000/pec/empresa-laboratorio';
      break;
    case 'eps':
      axiosInstance.defaults.baseURL = 'http://localhost:2000/pec/eps';
      break;
    case 'tarifario':
      axiosInstance.defaults.baseURL = 'http://localhost:2000/pec/tarifario';
      break;
    case 'permiso-tarifario':
      axiosInstance.defaults.baseURL = 'http://localhost:2000/pec/permiso-tarifario';
      break;
    case 'tarifario-producto':
      axiosInstance.defaults.baseURL = 'http://localhost:2000/pec/tarifario-producto';
    break;  
    default:
      console.error('Servicio no encontrado');
  }
};

// Interceptor de solicitud para añadir el token JWT si está disponible
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // O de sessionStorage si prefieres
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Añadimos el token en las cabeceras
    }
    return config;
  },
  (error) => {
    return Promise.reject(new Error(error));
  }
);

// Interceptor de respuesta para manejar errores globales
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Puedes manejar diferentes tipos de errores aquí (por ejemplo, redirección en caso de 401)
    if (error.response?.status === 401) {
      // Redirigir a la página de login si el token no es válido
      window.location.href = '/login';
    } else if (error.response?.status === 500) {
      // Mostrar un mensaje de error genérico si el servidor falla
      alert('Hubo un error en el servidor. Por favor, inténtelo más tarde.');
    }
    return Promise.reject(new Error(error.message || 'Unknown error'));
  }
);

export default axiosInstance;
