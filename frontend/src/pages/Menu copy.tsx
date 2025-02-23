import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Factory, Truck, FlaskConical} from "lucide-react";

const Menu: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-sky-900 flex items-center justify-center p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
        
        {/* Tarjeta de Productos */}
        <button
          onClick={() => handleNavigation("/Productos")}
          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all p-6 flex flex-col items-center justify-center text-center focus:outline-none"
          aria-label="Ir a la sección de Productos"
        >
          <ShoppingBag size={48} className="text-[#16347C]" />
          <h3 className="text-2xl font-semibold text-[#16347C] mt-3">Productos</h3>
          <p className="text-gray-600 mt-2">Gestiona tus productos aquí</p>
        </button>

        {/* Tarjeta de Empresas */}
        <button
          onClick={() => handleNavigation("/Empresas")}
          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all p-6 flex flex-col items-center justify-center text-center focus:outline-none"
          aria-label="Ir a la sección de Empresas"
        >
          <Factory size={48} className="text-[#16347C]" />
          <h3 className="text-2xl font-semibold text-[#16347C] mt-3">Empresas</h3>
          <p className="text-gray-600 mt-2">Gestiona las empresas aquí</p>
        </button>

        {/* Tarjeta de Proveedores */}
        <button
          onClick={() => handleNavigation("/Proveedores")}
          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all p-6 flex flex-col items-center justify-center text-center focus:outline-none"
          aria-label="Ir a la sección de Proveedores"
        >
          <Truck size={48} className="text-[#16347C]" />
          <h3 className="text-2xl font-semibold text-[#16347C] mt-3">Proveedores</h3>
          <p className="text-gray-600 mt-2">Gestiona los proveedores aquí</p>
        </button>

        {/* Tarjeta de Laboratorios */}
        <button
          onClick={() => handleNavigation("/Laboratorios")}
          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all p-6 flex flex-col items-center justify-center text-center focus:outline-none"
          aria-label="Ir a la sección de Laboratorios"
        >
          <FlaskConical size={48} className="text-[#16347C]" />
          <h3 className="text-2xl font-semibold text-[#16347C] mt-3">Laboratorios</h3>
          <p className="text-gray-600 mt-2">Gestiona los Laboratorios aquí</p>
        </button>

      </div>
    </div>
  );
};

export default Menu;
