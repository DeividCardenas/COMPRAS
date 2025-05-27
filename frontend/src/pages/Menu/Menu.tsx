import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, LogOut, Factory, Briefcase, Settings } from "lucide-react";
import { useAuth } from "../../context/useAuth";

const Menu: React.FC = () => {
  const navigate = useNavigate();
  const { setToken, setUser, user } = useAuth();

  const handleNavigation = (route: string) => {
    navigate(route);
  };

  const handleLogout = () => {
    setToken(null);
    setUser({ id: null, email: null, rol: null, permisos: [] });
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="h-screen bg-sky-900 flex flex-col items-center justify-center p-6 overflow-hidden relative">
      <button
        onClick={() => handleNavigation("/EPS")}
        className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all focus:outline-none group"
        aria-label="Ir a la sección de EPS"
      >
        <Briefcase size={32} className="text-indigo-900" />
        <span className="absolute top-full right-0 mt-2 w-max px-3 py-1 bg-indigo-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          Ir a la sección EPS
        </span>
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 w-full max-w-6xl px-4">
        <button
          onClick={() => handleNavigation("/Empresas")}
          className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all p-6 flex flex-col items-center justify-center text-center focus:outline-none"
          aria-label="Ir a la sección de Empresas"
        >
          <Factory size={60} className="text-indigo-900" />
          <h3 className="text-3xl font-semibold text-indigo-900 mt-5">Empresas</h3>
          <p className="text-gray-600 mt-2">Gestiona las empresas aquí</p>
        </button>

        <button
          onClick={() => handleNavigation("/Productos")}
          className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all p-6 flex flex-col items-center justify-center text-center focus:outline-none"
          aria-label="Ir a la sección de Productos"
        >
          <ShoppingBag size={60} className="text-indigo-900" />
          <h3 className="text-3xl font-semibold text-indigo-900 mt-5">Productos</h3>
          <p className="text-gray-600 mt-2">Gestiona tus productos aquí</p>
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="mt-10 px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all transform hover:scale-105 flex items-center gap-2"
        aria-label="Cerrar sesión"
      >
        <LogOut size={20} />
        Cerrar Sesión
      </button>

      {user?.rol === "Administrador" && (
        <button
          onClick={() => handleNavigation("/Admin")}
          className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all focus:outline-none group"
          aria-label="Ir a la página de Administración"
        >
          <Settings size={32} className="text-indigo-900" />
          <span className="absolute bottom-full right-0 mb-2 w-max px-3 py-1 bg-indigo-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            Ir a la página de Admin
          </span>
        </button>
      )}
    </div>
  );
};

export default Menu;
