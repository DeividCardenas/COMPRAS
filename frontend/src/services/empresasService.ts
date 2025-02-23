import axiosInstance, { setBaseURL } from "./axiosInstance";

// Definir un tipo para los parámetros de búsqueda de empresas
export interface EmpresaParams {
  page?: number;
  limit?: number;
  nombre?: string;
}

// Definir la interfaz para los objetos relacionados
export interface Laboratorio {
  id_laboratorio: number;
  nombre: string;
}

export interface Tarifario {
  id_tarifario: number;
  nombre: string;
}

// Definir la interfaz para la estructura de una empresa
export interface Empresa {
  id_empresa: number;
  nombre: string;
  laboratorios: Laboratorio[];
  tarifarios: Tarifario[];
}

// Definir la estructura de la respuesta esperada de la API para empresas
interface EmpresaResponse {
  total: number;
  page: number;
  limit: number;
  data: Empresa[];
}

// Función para obtener empresas con filtros y paginación
export const fetchEmpresas = async (
  filters: Partial<EmpresaParams>
): Promise<EmpresaResponse> => {
  setBaseURL("empresa");

  try {
    const params: Record<string, string | number | undefined> = {
      ...filters,
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
    };

    const response = await axiosInstance.get<EmpresaResponse>("/", { params });
    return response.data;
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    throw new Error("No se pudo obtener las empresas");
  }
};
