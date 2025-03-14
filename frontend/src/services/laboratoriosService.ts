import { axiosInstance, setBaseURL } from "./axiosInstance";

import axios from "axios";

interface Producto {
  id_producto: number;
  codigo_magister?: string;
  cum_pactado?: string;
  descripcion: string;
  principio_activo: string;
  concentracion: string;
  registro_sanitario: string;
  costo_compra: string;
  regulacion_tableta?: number | null;
  regulacion_empaque?: number | null;
}

interface Laboratorio {
  id_laboratorio: number;
  nombre: string;
}

interface ProductoResponse {
  laboratorio: Laboratorio;
  productos: {
    totalProductos: number;
    totalPaginas: number;
    paginaActual: number;
    tamanoPagina: number;
    lista: Producto[];
  };
}

export const fetchProductsByLaboratory = async (
  id_laboratorio: string,
  filters: Record<string, string>
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
      console.error("Error al obtener los productos del laboratorio:", error.response?.data || error.message);
      throw new Error(error.response?.data?.msg || "No se pudo obtener los productos del laboratorio");
    } else {
      console.error("Error desconocido:", error);
      throw new Error("No se pudo obtener los productos del laboratorio");
    }
  }
};

export const exportProductsToExcel = async (id_laboratorio: string): Promise<void> => {
  if (!id_laboratorio) {
    throw new Error("El ID del laboratorio es obligatorio para exportar los productos.");
  }

  setBaseURL("laboratorio");

  try {
    // Primero obtenemos los datos del laboratorio para obtener el nombre
    const { laboratorio } = await fetchProductsByLaboratory(id_laboratorio, {});

    if (!laboratorio?.nombre) {
      throw new Error("No se pudo obtener el nombre del laboratorio.");
    }

    const nombre_laboratorio = laboratorio.nombre;

    // Luego hacemos la solicitud de exportación
    const response = await axiosInstance.get(`/${id_laboratorio}/exportar`, {
      responseType: "blob", // Para recibir el archivo como blob
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Generar nombre de archivo limpio
    const nombreArchivo = `productos_${nombre_laboratorio.replace(/[^a-zA-Z0-9-_]/g, "_")}.xlsx`;

    // Crear enlace de descarga
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
