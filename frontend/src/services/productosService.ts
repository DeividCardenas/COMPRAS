import { axiosInstance, setBaseURL } from "./axiosInstance";

// Definir un tipo para los parámetros de búsqueda de productos
export interface ProductParams {
  page?: number;
  limit?: number;
  cum?: string;
  descripcion?: string;
  concentracion?: string;
  registro_sanitario?: string;
  presentacion?: string;
  regulacion?: string;
  codigo_barras?: string;
  id_laboratorio?: number;
  con_regulacion?: "regulados" | "no_regulados";
  campos?: string;
}

// Definir la interfaz para los productos
export interface Producto {
  id_producto: number;
  cum: string;
  descripcion: string;
  concentracion: string;
  id_laboratorio: number;
  precio_unidad: string;
  precio_presentacion: string;
  iva: number;
  laboratorio?: { nombre: string };
  presentacion?: string;
  registro_sanitario?: string;
  regulacion?: string | null;
  codigo_barras?: string;
  
}

// Definir la estructura de la respuesta esperada de la API para productos
interface ProductoResponse {
  totalProductos: number;
  totalPaginas: number;
  paginaActual: number;
  tamanoPagina: number;
  productos: Producto[];
}

// Función para obtener productos con filtros y paginación
export const fetchProductos = async (
  filters: Partial<ProductParams>
): Promise<ProductoResponse> => {
  setBaseURL("producto");

  try {
    const params: Record<string, string | number | undefined> = {
      ...filters,
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
    };

    const response = await axiosInstance.get<ProductoResponse>("/", { params });

    return response.data;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw new Error("No se pudo obtener los productos");
  }
};
