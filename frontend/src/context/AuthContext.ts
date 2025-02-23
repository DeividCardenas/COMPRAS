import { createContext } from "react";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  user: { id: number | null; email: string | null; rol: string | null; permisos: string[] };
  setUser: (user: { id: number | null; email: string | null; rol: string | null; permisos: string[] }) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
