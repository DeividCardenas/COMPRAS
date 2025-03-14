import { axiosInstance, setBaseURL } from "./axiosInstance";

interface LoginResponse {
  usuario: {
    id_usuario: number;
    email: string;
    rol: { nombre: string; permisos: { permiso: { nombre: string } }[] };
  };
  userJWT: { token: string };
}

export const loginUser = async (email: string, password: string): Promise<{ token: string; usuario: { id: number; email: string; rol: string; permisos: string[] } }> => {
  setBaseURL("auth"); // Ajuste de la base URL para autenticación

  try {
    const response = await axiosInstance.post<LoginResponse>("/login", { email, password });

    const { usuario, userJWT } = response.data;

    return {
      token: userJWT.token,
      usuario: {
        id: usuario.id_usuario,
        email: usuario.email,
        rol: usuario.rol.nombre,
        permisos: usuario.rol.permisos.map((p) => p.permiso.nombre), // Extraer permisos como un array de strings
      },
    };
  } catch {
    throw new Error("Error al iniciar sesión");
  }
};
