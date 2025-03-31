import { axiosInstance, setBaseURL } from "./axiosInstance";

// Definir la estructura del producto en el tarifario
export interface ProductoEnTarifario {
  id_producto: number;
  cum: string;
  descripcion: string;
  concentracion: string;
  presentacion: string;
  registro_sanitario: string;
  id_laboratorio: number;
  iva: number;
  regulacion?: string;
  codigo_barras?: string;
  precio: number;
  precio_unidad: number;
  precio_presentacion: number;
  createdAt: string;
  updatedAt: string;
  laboratorio: {
    nombre: string;
  };
}

// Definir la estructura de la respuesta del tarifario
export interface TarifarioResponse {
  tarifario: {
    id_tarifario: number;
    nombre: string;
    createdAt: string;
    updatedAt: string;
    permisos: string[];
  };
  productos: {
    totalProductos: number;
    totalPaginas: number;
    paginaActual: number;
    tamanoPagina: number;
    lista: ProductoEnTarifario[];
  };
}

// Función para obtener un tarifario por su ID con paginación y filtros
export const fetchTarifarioPorId = async (
  id_tarifario: number,
  page: number = 1,
  limit: number = 10,
  filtros: Record<string, string | undefined> = {}
): Promise<TarifarioResponse> => {
  setBaseURL("tarifario");

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filtros,
    });
    const response = await axiosInstance.get<TarifarioResponse>(`/${id_tarifario}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el tarifario:", error);
    throw new Error("No se pudo obtener el tarifario");
  }
};
