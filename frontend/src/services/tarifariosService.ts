import axiosInstance, { setBaseURL } from "./axiosInstance";

// Definir un tipo para los parámetros de búsqueda de productos en un tarifario
export interface TarifarioProductoParams {
  page?: number;
  limit?: number;
  laboratorio?: string;
  codigoProducto?: string;
  cumPactado?: string;
  descripcion?: string;
}

// Definir la interfaz para los productos dentro de un tarifario
export interface ProductoTarifario {
  costo_venta: string;
  venta_unidad: boolean;
  venta_empaque: boolean;
  producto: {
    id_producto: number;
    codigo_magister?: string;
    cum_pactado?: string;
    descripcion: string;
    laboratorio?: {
      nombre: string;
    };
  };
}

// Definir la estructura de la respuesta esperada de la API
export interface TarifarioProductoResponse {
  productos: ProductoTarifario[];
  totalProductos: number;
  totalPaginas: number;
  paginaActual: number;
  limitePorPagina: number;
}

// Función para obtener productos de un tarifario con filtros y paginación
export const fetchProductosDeTarifario = async (
  tarifarioId: number,
  filters: Partial<TarifarioProductoParams>
): Promise<TarifarioProductoResponse> => {
  setBaseURL("tarifarios");

  try {
    const params: Record<string, string | number | undefined> = {
      ...filters,
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
    };

    const response = await axiosInstance.get<TarifarioProductoResponse>(
      `/${tarifarioId}/productos`,
      { params }
    );

    return response.data;
  } catch (error) {
    console.error("Error al obtener productos del tarifario:", error);
    throw new Error("No se pudo obtener los productos del tarifario");
  }
};
