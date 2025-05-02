import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import Menu from "./pages/Menu/Menu";
import LaboratorioDetalles from "./pages/Laboratorio/LaboratorioDetalles";
import EmpresasPage from "./pages/Empresa/Empresas";
import EmpresaDetalles from "./pages/Empresa/EmpresaDetalles";
import Productos from "./pages/Productos/Productos";
import Login from "./pages/Auth/Login";
import Proveedores from "./pages/Proveedores/Proveedores";
import EPSPage from "./pages/EPS/EPS";
import TarifariosPage from "./pages/Tarifario/Tarifario";
import AdminPage from "./pages/Admin/AdminPage";

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/*"
            element={
              <Routes>
                <Route path="/Menu" element={<Menu />} />
                <Route path="/Productos" element={<Productos />} />
                <Route path="/laboratorio/:laboratorioId" element={<LaboratorioDetalles />} />
                <Route path="/Proveedores" element={<Proveedores />} />
                <Route path="/Empresas" element={<EmpresasPage />} />
                <Route path="/EPS" element={<EPSPage />} />
                <Route path="/tarifario/:id_tarifario" element={<TarifariosPage />} />
                <Route path="/Empresa/:id_empresa" element={<EmpresaDetalles />} />
                <Route path="/Admin" element={<AdminPage />} />
              </Routes>
            }
          />
        </Routes>

        {/* Toasts para notificaciones */}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop />
      </div>
    </Router>
  );
};

export default App;
