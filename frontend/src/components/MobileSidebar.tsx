import React from "react";
import { X } from "lucide-react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed inset-0 z-40 bg-gray-800 text-white transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold">Menú</h2>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 focus:outline-none"
          aria-label="Cerrar menú"
        >
          <X size={24} />
        </button>
      </div>
      <nav className="p-4">
        <ul className="space-y-4">
          <li>
            <a href="/admin" className="hover:text-gray-300">
              Dashboard
            </a>
          </li>
          <li>
            <a href="/eps" className="hover:text-gray-300">
              EPS
            </a>
          </li>
          <li>
            <a href="/laboratorios" className="hover:text-gray-300">
              Laboratorios
            </a>
          </li>
          <li>
            <a href="/empresas" className="hover:text-gray-300">
              Empresas
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default MobileSidebar;