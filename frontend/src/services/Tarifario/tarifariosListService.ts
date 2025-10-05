import { axiosInstance, setBaseURL } from "../Shared/axiosInstance";

interface Tarifario {
  id_tarifario: number;
  nombre: string;
  id_eps?: number;
  id_empresa?: number;
}

interface TarifariosListResponse {
  total: number;
  page: number;
  limit: number;
  tarifarios: Tarifario[];
}

export const fetchTarifarios = async (
  page: number = 1,
  limit: number = 10
): Promise<TarifariosListResponse> => {
  setBaseURL("tarifario");
  try {
    const response = await axiosInstance.get<TarifariosListResponse>("/", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener los tarifarios:", error);
    throw new Error("No se pudo obtener los tarifarios");
  }
};
