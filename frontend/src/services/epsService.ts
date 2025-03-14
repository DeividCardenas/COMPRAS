import axiosInstance, { setBaseURL } from "./axiosInstance";

// Definir un tipo para los parámetros de búsqueda de EPS
export interface EPSParams {
  page?: number;
  limit?: number;
  nombre?: string;
  orden?: string;
  direccion?: 'asc' | 'desc';
}

// Definir la interfaz para la relación entre Tarifario y Producto
export interface TarifarioOnProducto {
  id_tarifario: number;
  id_producto: number;
  precio: number;
  precio_unidad: number;
  precio_empaque: number;
}

// Definir la interfaz para los Tarifarios
export interface Tarifario {
  id_tarifario: number;
  nombre: string;
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
  pagina_actual: number;
  total_paginas: number;
  limite: number;
  eps: EPS[];
}

// Función para obtener EPS con filtros, paginación y ordenamiento
export const fetchEPS = async (
  filters: Partial<EPSParams>
): Promise<EPSResponse> => {
  setBaseURL("eps");

  try {
    // Configurar los parámetros de la solicitud
    const params: Record<string, string | number | undefined> = {
      ...filters,
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
      orden: filters.orden ?? 'nombre',
      direccion: filters.direccion ?? 'asc',
    };

    // Realizar la solicitud a la API
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
