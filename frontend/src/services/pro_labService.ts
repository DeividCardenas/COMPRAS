import { axiosInstance, setBaseURL } from "./axiosInstance";

// Definir el tipo para los parámetros de búsqueda de productos
interface ProductoParams {
  laboratorioId: string;
  codigo_magister?: string;
  cum_pactado?: string;
  descripcion?: string;
  page?: number;
  limit?: number;
  incluir_regulacion?: string;
  solo_con_regulacion?: string;
}

// Definir el tipo de un producto
interface RegulacionProducto {
  regulacion_tableta?: number;
  regulacion_empaque?: number;
}

interface Producto {
  id_producto: number;
  codigo_magister: string;
  cum_pactado: string;
  descripcion: string;
  costo_compra: number;
  regulacion?: RegulacionProducto; // Agregar la opción de regulaciones
}

// Definir la estructura de la respuesta esperada de la API
interface ProductoResponse {
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  productos: Producto[];
}

// Función para obtener los productos de un laboratorio
export const fetchProductosByLaboratorio = async (
  params: ProductoParams
): Promise<ProductoResponse> => {
  setBaseURL("laboratorios"); // Establecer la base URL para la API

  try {
    const response = await axiosInstance.get<ProductoResponse>(`/${params.laboratorioId}`, {
      params,
    });

    return response.data; // Devuelve los productos y los detalles de paginación
  } catch (error) {
    console.error("Error al obtener los productos del laboratorio:", error);
    throw new Error("No se pudieron obtener los productos del laboratorio");
  }
};
