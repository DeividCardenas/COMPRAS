import axios from 'axios';

// Crea una instancia de Axios con la base URL común
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Usa la variable de entorno
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para actualizar dinámicamente la baseURL
export const setBaseURL = (service: string) => {
  const baseURL = import.meta.env.VITE_API_URL;
  
  if (!baseURL) {
    console.error('La variable VITE_API_URL no está definida');
    return;
  }

  switch (service) {
    case 'usuario':
      axiosInstance.defaults.baseURL = `${baseURL}/usuario`;
      break;
    case 'rol':
      axiosInstance.defaults.baseURL = `${baseURL}/rol`;
      break;
    case 'permiso':
      axiosInstance.defaults.baseURL = `${baseURL}/permiso`;
      break;
    case 'permiso-rol':
      axiosInstance.defaults.baseURL = `${baseURL}/permiso-rol`;
      break;
    case 'producto':
      axiosInstance.defaults.baseURL = `${baseURL}/producto`;
      break;
    case 'empresa':
      axiosInstance.defaults.baseURL = `${baseURL}/empresa`;
      break;
    case 'laboratorio':
      axiosInstance.defaults.baseURL = `${baseURL}/laboratorio`;
      break;
    case 'empresa-laboratorio':
      axiosInstance.defaults.baseURL = `${baseURL}/empresa-laboratorio`;
      break;
    case 'eps':
      axiosInstance.defaults.baseURL = `${baseURL}/eps`;
      break;
    case 'tarifario':
      axiosInstance.defaults.baseURL = `${baseURL}/tarifario`;
      break;
    case 'permiso-tarifario':
      axiosInstance.defaults.baseURL = `${baseURL}/permiso-tarifario`;
      break;
    case 'proveedores':
      axiosInstance.defaults.baseURL = `${baseURL}/proveedores`;
      break;
    case 'tarifario-producto':
      axiosInstance.defaults.baseURL = `${baseURL}/tarifario-producto`;
      break;
    default:
      console.error('Servicio no encontrado');
  }
};
