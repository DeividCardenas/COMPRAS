import axiosInstance, { setBaseURL } from "./axiosInstance";

// Definir un tipo para los parámetros de búsqueda de productos
export interface ProductParams {
  page?: number;
  limit?: number;
  codigo_magister?: string;
  cum_pactado?: string;
  descripcion?: string;
  id_laboratorio?: number;
  principio_activo?: string;
  concentracion?: string;
  registro_sanitario?: string;
  con_regulacion?: "regulados" | "no_regulados";
}

// Definir la interfaz para los productos
export interface Producto {
  id_producto: number;
  codigo_magister?: string;
  cum_pactado?: string;
  descripcion: string;
  costo_compra: string;
  regulacion_tableta?: number | null;
  regulacion_empaque?: number | null;
  principio_activo: string;
  concentracion: string;
  registro_sanitario: string;
  laboratorio?: { nombre: string };
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

// Función para obtener un producto por su ID
export const fetchProductoById = async (
  id: number
): Promise<Producto | null> => {
  setBaseURL("producto");

  try {
    const response = await axiosInstance.get<Producto>(`/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el producto por ID:", error);
    throw new Error("No se pudo obtener el producto por ID");
  }
};
