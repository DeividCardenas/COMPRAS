import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, LogOut, Factory, Briefcase } from "lucide-react"; // Importando el ícono de EPS
import { useAuth } from "../context/useAuth";

const Menu: React.FC = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth(); // Importamos el contexto de autenticación

  const handleNavigation = (route: string) => {
    navigate(route);
  };

  const handleLogout = () => {
    setToken(null);
    setUser({ id: null, email: null, rol: null, permisos: [] });
    localStorage.removeItem("token"); // Eliminamos el token del almacenamiento local
    navigate("/"); // Redirigir al login
  };

  return (
    <div className="min-h-screen bg-sky-900 flex flex-col items-center justify-center p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">

        {/* Tarjeta de Productos */}
        <button
          onClick={() => handleNavigation("/Productos")}
          className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all p-6 flex flex-col items-center justify-center text-center focus:outline-none"
          aria-label="Ir a la sección de Productos"
        >
          <ShoppingBag size={48} className="text-[#16347C]" />
          <h3 className="text-2xl font-semibold text-[#16347C] mt-4">Productos</h3>
          <p className="text-gray-600 mt-2">Gestiona tus productos aquí</p>
        </button>

        {/* Tarjeta de Empresas */}
        <button
          onClick={() => handleNavigation("/Empresas")}
          className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all p-6 flex flex-col items-center justify-center text-center focus:outline-none"
          aria-label="Ir a la sección de Empresas"
        >
          <Factory size={48} className="text-[#16347C]" />
          <h3 className="text-2xl font-semibold text-[#16347C] mt-4">Empresas</h3>
          <p className="text-gray-600 mt-2">Gestiona las empresas aquí</p>
        </button>

        {/* Tarjeta de EPS */}
        <button
          onClick={() => handleNavigation("/EPS")}
          className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all p-6 flex flex-col items-center justify-center text-center focus:outline-none"
          aria-label="Ir a la sección de EPS"
        >
          <Briefcase size={48} className="text-[#16347C]" /> {/* Ícono de EPS */}
          <h3 className="text-2xl font-semibold text-[#16347C] mt-4">EPS</h3>
          <p className="text-gray-600 mt-2">Gestiona las EPS aquí</p>
        </button>

      </div>

      {/* Botón de Logout */}
      <button
        onClick={handleLogout}
        className="mt-10 px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all transform hover:scale-105 flex items-center gap-2"
        aria-label="Cerrar sesión"
      >
        <LogOut size={20} />
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Menu;
