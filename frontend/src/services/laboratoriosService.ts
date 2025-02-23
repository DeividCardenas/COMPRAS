import axiosInstance, { setBaseURL } from "./axiosInstance";
import axios from "axios";

interface Producto {
  id_producto: number;
  codigo_magister?: string;
  cum_pactado?: string;
  descripcion: string;
  costo_compra: string;
  regulacion_tableta?: number | null;
  regulacion_empaque?: number | null;
}

interface ProductoResponse {
  total: number;
  page: number;
  limit: number;
  productos: Producto[];
}

export const fetchProductsByLaboratory = async (
  id_laboratorio: string,
  filters: Record<string, string> // <-- Ahora `filters` es un objeto con strings
): Promise<ProductoResponse> => {
  if (!id_laboratorio) {
    throw new Error("El ID del laboratorio es obligatorio.");
  }

  setBaseURL("laboratorios");

  try {
    const response = await axiosInstance.get<ProductoResponse>(
      `/${id_laboratorio}/productos`,
      { params: filters }
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Error al obtener los productos:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || "No se pudo obtener los productos");
    } else {
      console.error("Error desconocido:", error);
      throw new Error("No se pudo obtener los productos");
    }
  }
};
