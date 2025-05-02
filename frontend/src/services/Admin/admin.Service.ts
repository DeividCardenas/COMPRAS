import { axiosInstance, setBaseURL } from "../Shared/axiosInstance";

// Definir un tipo para los parámetros de búsqueda
export interface AdminParams {
  page?: number;
  limit?: number;
  nombre?: string;
  rol?: number;
  empresa?: number;
}

// Definir la interfaz para las respuestas de la API
interface UsuarioResponse {
  totalUsuarios: number;
  totalPaginas: number;
  paginaActual: number;
  tamanoPagina: number;
  usuarios: Usuario[];
}

interface Usuario {
  id_usuario: number;
  username: string;
  email: string;
  rol: { nombre: string };
}

interface EpsResponse {
  totalEps: number;
  totalPaginas: number;
  paginaActual: number;
  tamanoPagina: number;
  eps: Eps[];
}

interface Eps {
  id_eps: number;
  nombre: string;
}

interface LaboratorioResponse {
  totalLaboratorios: number;
  totalPaginas: number;
  paginaActual: number;
  tamanoPagina: number;
  laboratorios: Laboratorio[];
}

interface Laboratorio {
  id_laboratorio: number;
  nombre: string;
}

interface EmpresaResponse {
  totalEmpresas: number;
  totalPaginas: number;
  paginaActual: number;
  tamanoPagina: number;
  empresas: Empresa[];
}

interface Empresa {
  id_empresa: number;
  nombre: string;
}

// Alias de tipo para los parámetros de consulta
type QueryParams = Record<string, string | number | undefined>;

// Función para obtener usuarios con filtros y paginación
export const fetchUsers = async (
  filters: Partial<AdminParams>
): Promise<UsuarioResponse> => {
  try {
    const params: QueryParams = {
      ...filters,
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
    };

    // Usa la URL completa para usuarios
    const response = await axiosInstance.get<UsuarioResponse>("http://localhost:2000/pec/usuario", { params });

    return response.data;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw new Error("No se pudo obtener los usuarios");
  }
};

// Función para obtener EPS con filtros y paginación
export const fetchEps = async (
  filters: Partial<AdminParams>
): Promise<EpsResponse> => {
  setBaseURL("eps");

  try {
    const params: QueryParams = {
      ...filters,
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
    };

    const response = await axiosInstance.get<EpsResponse>("http://localhost:2000/pec/eps", { params });

    return response.data;
  } catch (error) {
    console.error("Error al obtener EPS:", error);
    throw new Error("No se pudo obtener las EPS");
  }
};

// Función para obtener laboratorios con filtros y paginación
export const fetchLaboratorios = async (
  filters: Partial<AdminParams>
): Promise<LaboratorioResponse> => {
  setBaseURL("laboratorios");

  try {
    const params: QueryParams = {
      ...filters,
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
    };

    const response = await axiosInstance.get<LaboratorioResponse>("http://localhost:2000/pec/laboratorio", { params });

    return response.data;
  } catch (error) {
    console.error("Error al obtener laboratorios:", error);
    throw new Error("No se pudo obtener los laboratorios");
  }
};

// Función para obtener empresas con filtros y paginación
export const fetchEmpresas = async (
  filters: Partial<AdminParams>
): Promise<EmpresaResponse> => {
  setBaseURL("empresas");

  try {
    const params: QueryParams = {
      ...filters,
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
    };

    const response = await axiosInstance.get<EmpresaResponse>("http://localhost:2000/pec/empresa", { params });

    return response.data;
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    throw new Error("No se pudo obtener las empresas");
  }
};