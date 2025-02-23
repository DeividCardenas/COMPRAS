import axiosInstance, { setBaseURL } from "./axiosInstance";

// Definir un tipo para los parámetros de búsqueda
interface ProviderParams {
  page: number;
  limit: number;
  search?: string;
  filter?: string;
  laboratorio?: string;
  tipo?: string;
  titular?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

// Definir el tipo de un proveedor
interface Proveedor {
  id_proveedor: number;
  laboratorio: string;
  tipo: string;
  titular: string;
  direccion: string;
  telefono: string;
  email: string;
}

// Definir la estructura de la respuesta esperada de la API
interface ProviderResponse {
  providers: Proveedor[];
  totalProviders: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

// Función para obtener proveedores con filtros y paginación
export const fetchProveedores = async (
  filters: Partial<ProviderParams>
): Promise<ProviderResponse> => {
  setBaseURL("proveedores"); // Establecer la base URL para proveedores
  try {
    // Hacer la petición GET a la API con los parámetros
    const response = await axiosInstance.get<ProviderResponse>("/", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    throw new Error("No se pudo obtener los proveedores");
  }
};
