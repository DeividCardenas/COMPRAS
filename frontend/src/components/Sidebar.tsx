import React from "react";

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gray-800 text-white h-full flex flex-col">
      <div className="p-4 text-lg font-bold border-b border-gray-700">
        Panel de Admin
      </div>
      <nav className="flex-1 p-4">
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

export default Sidebar;