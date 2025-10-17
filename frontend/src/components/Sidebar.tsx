import React from "react";
import { LayoutDashboard, Shield, FlaskConical, Building2, Settings } from "lucide-react";

const Sidebar: React.FC = () => {
  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/eps", label: "EPS", icon: Shield },
    { href: "/Laboratorio", label: "Laboratorios", icon: FlaskConical },
    { href: "/empresas", label: "Empresas", icon: Building2 },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white h-full flex flex-col shadow-2xl">
      <div className="p-6 border-b border-indigo-700/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Settings size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">
              Panel de Admin
            </h1>
            <p className="text-xs text-indigo-300">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-white/10 hover:shadow-lg group"
              >
                <item.icon
                  size={20}
                  className="text-indigo-300 group-hover:text-white transition-colors duration-200"
                />
                <span className="font-medium group-hover:text-white transition-colors duration-200">
                  {item.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-indigo-700/50">
        <div className="text-xs text-indigo-400 text-center">
          © 2024 Pharma Elite Care
        </div>
      </div>
    </div>
  );
};

export default Sidebar;