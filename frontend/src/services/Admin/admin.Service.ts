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

// Interfaces para actualización
interface UserUpdateData {
  username?: string;
  email?: string;
  rol_id?: number;
}

interface GenericUpdateData {
  nombre?: string;
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

// Funciones de actualización

// Actualizar usuario
export const updateUser = async (
  userId: number, 
  userData: UserUpdateData
): Promise<any> => {
  try {
    const response = await axiosInstance.put(
      `http://localhost:2000/pec/usuario/${userId}`,
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    throw new Error("No se pudo actualizar el usuario");
  }
};

// Actualizar EPS
export const updateEps = async (
  epsId: number,
  epsData: GenericUpdateData
): Promise<any> => {
  try {
    setBaseURL("eps");
    const response = await axiosInstance.put(
      `http://localhost:2000/pec/eps/${epsId}`,
      epsData
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar la EPS:", error);
    throw new Error("No se pudo actualizar la EPS");
  }
};

// Actualizar Laboratorio
export const updateLaboratorio = async (
  labId: number,
  labData: GenericUpdateData
): Promise<any> => {
  try {
    setBaseURL("laboratorios");
    const response = await axiosInstance.put(
      `http://localhost:2000/pec/laboratorio/${labId}`,
      labData
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el laboratorio:", error);
    throw new Error("No se pudo actualizar el laboratorio");
  }
};

// Actualizar Empresa
export const updateEmpresa = async (
  empresaId: number,
  empresaData: GenericUpdateData
): Promise<any> => {
  try {
    setBaseURL("empresas");
    const response = await axiosInstance.put(
      `http://localhost:2000/pec/empresa/${empresaId}`,
      empresaData
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar la empresa:", error);
    throw new Error("No se pudo actualizar la empresa");
  }
};

// Funciones de eliminación

// Eliminar usuario
export const deleteUser = async (userId: number): Promise<any> => {
  try {
    const response = await axiosInstance.delete(
      `http://localhost:2000/pec/usuario/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    throw new Error("No se pudo eliminar el usuario");
  }
};

// Eliminar EPS
export const deleteEps = async (epsId: number): Promise<any> => {
  try {
    setBaseURL("eps");
    const response = await axiosInstance.delete(
      `http://localhost:2000/pec/eps/${epsId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al eliminar la EPS:", error);
    throw new Error("No se pudo eliminar la EPS");
  }
};

// Eliminar Laboratorio
export const deleteLaboratorio = async (labId: number): Promise<any> => {
  try {
    setBaseURL("laboratorios");
    const response = await axiosInstance.delete(
      `http://localhost:2000/pec/laboratorio/${labId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el laboratorio:", error);
    throw new Error("No se pudo eliminar el laboratorio");
  }
};

// Eliminar Empresa
export const deleteEmpresa = async (empresaId: number): Promise<any> => {
  try {
    setBaseURL("empresas");
    const response = await axiosInstance.delete(
      `http://localhost:2000/pec/empresa/${empresaId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al eliminar la empresa:", error);
    throw new Error("No se pudo eliminar la empresa");
  }
};
 
//agregar eps
export const addEps = async (epsData: GenericUpdateData): Promise<any> => {
  try {
    setBaseURL("eps");
    const response = await axiosInstance.post(
      "http://localhost:2000/pec/eps",
      epsData
    );
    return response.data;
  } catch (error) {
    console.error("Error al agregar la EPS:", error);
    throw new Error("No se pudo agregar la EPS");
  }
};

//agregar laboratorio
export const addLaboratorio = async (
  labData: GenericUpdateData
): Promise<any> => {
  try {
    setBaseURL("laboratorios");
    const response = await axiosInstance.post(
      "http://localhost:2000/pec/laboratorio",
      labData
    );
    return response.data;
  } catch (error) {
    console.error("Error al agregar el laboratorio:", error);
    throw new Error("No se pudo agregar el laboratorio");
  }
};

//agregar empresa
export const addEmpresa = async (
  empresaData: GenericUpdateData
): Promise<any> => {
  try {
    setBaseURL("empresas");
    const response = await axiosInstance.post(
      "http://localhost:2000/pec/empresa",
      empresaData
    );
    return response.data;
  } catch (error) {
    console.error("Error al agregar la empresa:", error);
    throw new Error("No se pudo agregar la empresa");
  }
};