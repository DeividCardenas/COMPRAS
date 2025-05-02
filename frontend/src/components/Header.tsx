import React from "react";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between">
      <h1 className="text-lg font-bold text-gray-800">Panel de Administración</h1>
      <button
        onClick={onMenuClick}
        className="text-gray-800 hover:text-gray-600 focus:outline-none md:hidden"
        aria-label="Abrir menú"
      >
        <Menu size={24} />
      </button>
    </header>
  );
};

export default Header;