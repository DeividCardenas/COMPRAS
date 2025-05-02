import { axiosInstance, setBaseURL } from "../Shared/axiosInstance";


// Definir un tipo para los parámetros de búsqueda de ventas
interface SalesParams {
  page: number;
  limit: number;
  id_producto?: number;
  id_empresa?: number;
  precio?: number;
  fecha_vigencia?: string;
  descripcion_comercial?: string;
  principio_activo?: string;
  concentracion?: string;
  estado?: string;
  codigo?: string;
  codigo_especifico?: string;
  Invima?: string;
  Fecha_vencimiento?: string;
  CUM?: string;
}

// Definir el tipo de una venta
interface Venta {
  id_ventas: number;
  id_producto: number;
  id_empresa: number;
  precio: number;
  fecha_vigencia: string;
  producto: {
    descripcion_comercial: string;
    principio_activo: string;
    concentracion: string;
    estado: string;
    codigo: string;
    codigo_especifico: string;
    Invima: string;
    Fecha_vencimiento: string;
    CUM: string;
  };
  empresa: {
    nombre: string;
  };
}

// Definir la estructura de la respuesta esperada de la API
interface SalesResponse {
  totalSales: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  sales: Venta[];
}

// Función para obtener las ventas con filtros y paginación
export const fetchVentas = async (
  filters: Partial<SalesParams>
): Promise<SalesResponse> => {
  setBaseURL("ventas");
  try {
    // Hacer la petición GET a la API con los parámetros
    const response = await axiosInstance.get<SalesResponse>("/", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener las ventas:", error);
    throw new Error("No se pudo obtener las ventas");
  }
};
