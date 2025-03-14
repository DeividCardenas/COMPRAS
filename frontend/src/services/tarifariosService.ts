import { axiosInstance, setBaseURL } from "./axiosInstance";
import axios from "axios";

// Definir la estructura del producto en el tarifario
export interface ProductoEnTarifario {
  id_producto: number;
  codigo_magister?: string;
  cum_pactado?: string;
  descripcion: string;
  principio_activo: string;
  concentracion: string;
  registro_sanitario: string;
  precio: number;
  precio_unidad: number;
  precio_empaque: number;
  createdAt: string;
  updatedAt: string;
}

// Definir la estructura del tarifario
export interface TarifarioResponse {
  id_tarifario: number;
  nombre: string;
  id_eps?: number;
  id_empresa?: number;
  productos: ProductoEnTarifario[];
  createdAt: string;
  updatedAt: string;
}

// Función para obtener un tarifario por su ID
export const fetchTarifarioPorId = async (
  id_tarifario: number
): Promise<TarifarioResponse> => {
  setBaseURL("tarifario");

  try {
    const response = await axiosInstance.get<TarifarioResponse>(
      `/${id_tarifario}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener el tarifario:", error);
    throw new Error("No se pudo obtener el tarifario");
  }
};

// Función para exportar el tarifario a Excel con el nombre correcto
export const exportarTarifarioExcel = async (id_tarifario: number): Promise<void> => {
  setBaseURL("tarifario");

  try {
    console.log("Exportando tarifario con ID:", id_tarifario);

    // Primero, obtener los datos del tarifario para extraer el nombre
    const tarifario = await fetchTarifarioPorId(id_tarifario);
    const nombreArchivo = tarifario.nombre.replace(/[^a-zA-Z0-9-_]/g, "_");

    // Luego, hacer la petición para descargar el archivo
    const response = await axiosInstance.get(
      `/${id_tarifario}/exportar-simplificado`,
      { responseType: "blob" }
    );

    if (!response.data || response.data.size === 0) {
      console.warn("El archivo exportado está vacío.");
      return;
    }

    if (
      response.headers["content-type"] !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      throw new Error("El servidor no devolvió un archivo Excel válido.");
    }

    // Crear un enlace para descargar el archivo con el nombre del tarifario
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${nombreArchivo}.xlsx`);
    document.body.appendChild(link);
    link.click();

    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log(`El tarifario "${tarifario.nombre}" se ha exportado y descargado correctamente.`);
  } catch (error: unknown) {
    console.error("Error al exportar el tarifario:", error);

    if (axios.isAxiosError(error)) {
      alert(`Error: ${error.response?.data?.mensaje || "No se pudo exportar el tarifario."}`);
    } else {
      alert("Hubo un error inesperado al exportar el tarifario. Inténtalo nuevamente.");
    }
  }
};
