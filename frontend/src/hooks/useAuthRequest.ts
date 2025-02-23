import axios from "axios";
import { useAuth } from "../context/AuthContext";

export const useAuthRequest = () => {
  const { token, logout } = useAuth();

  const api = axios.create({
    baseURL: "http://localhost:2000/pec",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );

  return api;
};
