import { axiosInstance, setBaseURL } from "./axiosInstance";

import axios from "axios";

export interface EmpresaParams {
  page?: number;
  limit?: number;
  nombre?: string;
}

export interface Laboratorio {
  id_laboratorio: number;
  nombre: string;
}

export interface Tarifario {
  id_tarifario: number;
  nombre: string;
}

export interface Empresa {
  id_empresa: number;
  nombre: string;
  laboratorios: Laboratorio[];
  tarifarios: Tarifario[];
}

interface EmpresaResponse {
  total: number;
  page: number;
  limit: number;
  data: Empresa[];
}

const limpiarParametros = (params: Record<string, string | number | undefined>) => {
  return Object.fromEntries(
    Object.entries(params).filter(([ v]) => v !== undefined && v !== null)
  );
};

export const fetchEmpresas = async (
  filters: Partial<EmpresaParams>
): Promise<EmpresaResponse> => {
  setBaseURL("empresa");

  try {
    const params: Record<string, string | number | undefined> = {
      ...filters,
      page: Math.max(filters.page ?? 1, 1),
      limit: Math.min(Math.max(filters.limit ?? 10, 1), 100),
    };

    const cleanedParams = limpiarParametros(params);

    const response = await axiosInstance.get<EmpresaResponse>("/", {
      params: cleanedParams,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error de Axios al obtener empresas:", error.response?.data || error.message);
      throw new Error(error.response?.data?.msg || "No se pudo obtener las empresas");
    } else {
      console.error("Error desconocido al obtener empresas:", error);
      throw new Error("Error inesperado al obtener las empresas");
    }
  }
};
