import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Factory, ShoppingBag, Home, Briefcase, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/useAuth';

const Navbar: React.FC = () => {
  const { setToken, setUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    setToken(null);
    setUser({ id: null, email: null, rol: null, permisos: [] });
    localStorage.removeItem('token');
    navigate('/'); // Redirigir al login sin recargar la página
  };

  return (
    <nav className="bg-sky-900 p-4 fixed top-0 w-full z-50 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <button
          onClick={toggleMenu}
          className="md:hidden text-white focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <ul
          className={`${
            isMenuOpen ? 'block' : 'hidden'
          } md:flex md:space-x-8 bg-sky-900 md:bg-transparent absolute md:static top-16 left-0 w-full md:w-auto p-4 md:p-0`}
        >
          {[
            { path: '/Menu', label: 'Inicio', icon: <Home size={20} /> },
            { path: '/Productos', label: 'Productos', icon: <ShoppingBag size={20} /> },
            { path: '/Empresas', label: 'Empresas', icon: <Factory size={20} /> },
            { path: '/EPS', label: 'EPS', icon: <Briefcase size={20} /> },
          ].map((item) => (
            <li key={item.path} className="flex items-center">
              <Link
                to={item.path}
                className="text-white flex items-center hover:text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                <span className="ml-2 hidden md:inline">{item.label}</span>
              </Link>
            </li>
          ))}

          <li className="flex items-center border-t md:border-t-0 mt-4 md:mt-0 pt-4 md:pt-0">
            <button
              onClick={handleLogout}
              className="text-white flex items-center hover:text-red-400"
            >
              <LogOut size={20} className="mr-2" />
              <span className="hidden md:inline">Cerrar Sesión</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
