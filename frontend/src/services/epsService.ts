import axiosInstance, { setBaseURL } from "./axiosInstance";

// Definir un tipo para los parámetros de búsqueda de EPS
export interface EPSParams {
  page?: number;
  limit?: number;
  nombre?: string;
}

// Definir la interfaz para los Tarifarios
export interface Tarifario {
  id_tarifario: number;
  nombre: string;
  epsId: number;
  eps: EPS;
  productos: TarifarioOnProducto[]; // Asegúrate de que este campo es relevante
}

// Definir la interfaz para las EPS
export interface EPS {
  id_eps: number;
  nombre: string;
  tarifarios: Tarifario[];
}

// Definir la estructura de la respuesta esperada de la API para EPS
interface EPSResponse {
  total: number;
  page: number;
  limit: number;
  eps: EPS[];
}

// Función para obtener EPS con filtros y paginación
export const fetchEPS = async (
  filters: Partial<EPSParams>
): Promise<EPSResponse> => {
  setBaseURL("EPS");

  try {
    const params: Record<string, string | number | undefined> = {
      ...filters,
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
    };

    const response = await axiosInstance.get<EPSResponse>("/", { params });

    // Verificar que la respuesta contiene los datos esperados
    if (!response.data?.eps) {
      throw new Error("Respuesta mal formada");
    }

    return response.data;
  } catch (error) {
    console.error("Error al obtener EPS:", error);
    throw new Error("No se pudo obtener las EPS");
  }
};

// Definir la interfaz para la relación entre Tarifario y Producto
export interface TarifarioOnProducto {
  id_tarifario: number;
  id_producto: number;
  // otros campos si es necesario
}
