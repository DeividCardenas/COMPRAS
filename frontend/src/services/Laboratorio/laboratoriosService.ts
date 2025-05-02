import { axiosInstance, setBaseURL } from "../Shared/axiosInstance";
import axios from "axios";

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

export interface Laboratorio {
  id_laboratorio: number;
  nombre: string;
}

// Definir la estructura de la respuesta esperada de la API para productos
interface ProductosResponse {
  totalProductos: number;
  paginaActual: number;
  tamanoPagina: number;
  totalPaginas: number;
  laboratorio: Laboratorio;
  lista: Producto[];
}

export interface ProductoResponse {
  laboratorio: Laboratorio;
  totalPaginas: number;
  productos: ProductosResponse;
}

interface LaboratorioResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: Laboratorio[];
}

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

// Servicio para obtener productos por laboratorio
export const fetchProductsByLaboratory = async (
  id_laboratorio: string,
  filters: ProductParams
): Promise<ProductoResponse> => {
  if (!id_laboratorio) {
    throw new Error("El ID del laboratorio es obligatorio.");
  }

  setBaseURL("laboratorio");

  try {
    const response = await axiosInstance.get<ProductoResponse>(
      `/${id_laboratorio}`,
      { params: filters }
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error al obtener los productos del laboratorio:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.msg ||
          "No se pudo obtener los productos del laboratorio"
      );
    } else {
      console.error("Error desconocido:", error);
      throw new Error("No se pudo obtener los productos del laboratorio");
    }
  }
};

export const exportProductsToExcel = async (
  id_laboratorio: string,
  all: boolean = false,
  page: number = 1,
  limit: number = 100
): Promise<void> => {
  if (!id_laboratorio) {
    throw new Error("El ID del laboratorio es obligatorio para exportar los productos.");
  }

  setBaseURL("laboratorio");

  try {
    // Obtener detalles del laboratorio para nombrar el archivo correctamente
    const { laboratorio } = await fetchProductsByLaboratory(id_laboratorio, { page, limit });

    if (!laboratorio?.nombre) {
      throw new Error("No se pudo obtener el nombre del laboratorio.");
    }

    const nombre_laboratorio = laboratorio.nombre.replace(/[^a-zA-Z0-9-_]/g, "_");

    // Solicitar el archivo Excel
    const response = await axiosInstance.get(`/${id_laboratorio}/exportar`, {
      params: { all, page, limit },
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Nombre del archivo con sufijo adecuado
    const fileNameSuffix = all ? "_completo" : `_pagina${page}`;
    const nombreArchivo = `productos_${nombre_laboratorio}${fileNameSuffix}.xlsx`;

    // Descargar el archivo
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", nombreArchivo);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Error al exportar los productos del laboratorio:", error.response?.data || error.message);
      throw new Error(error.response?.data?.mensaje || "No se pudo exportar los productos del laboratorio");
    } else {
      console.error("Error desconocido:", error);
      throw new Error("No se pudo exportar los productos del laboratorio");
    }
  }
};

export const fetchLaboratories = async (
  page: number = 1,
  limit: number = 9,
  nombre: string = "",
  empresa?: number
): Promise<LaboratorioResponse> => {
  setBaseURL("laboratorio");

  try {
    const response = await axiosInstance.get<LaboratorioResponse>("/", {
      params: { 
        page, 
        limit, 
        nombre: nombre.trim(), 
        empresa
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Error al obtener los laboratorios:", error.response?.data || error.message);
      throw new Error(error.response?.data?.msg || "No se pudo obtener los laboratorios");
    } else {
      console.error("Error desconocido:", error);
      throw new Error("No se pudo obtener los laboratorios");
    }
  }
};