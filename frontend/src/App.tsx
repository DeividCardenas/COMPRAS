import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Productos from "./pages/Productos";
import LaboratorioDetalles from "./pages/LaboratorioDetalles";
import Proveedores from "./pages/Proveedores";
import EmpresasPage from "./pages/Empresas";
import EPSPage from "./pages/EPS";
import TarifariosPage from "./pages/Tarifario";
import EmpresaDetalles from "./pages/EmpresaDetalles";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Menu" element={<Menu />} />
        <Route path="/Productos" element={<Productos />} />
        <Route path="/laboratorios/:laboratorioId/productos" element={<LaboratorioDetalles />} />
        <Route path="/Proveedores" element={<Proveedores />} />
        <Route path="/Empresas" element={<EmpresasPage />} />
        <Route path="/EPS" element={<EPSPage />} />
        <Route path="/tarifarios/:tarifarioId/productos" element={<TarifariosPage />} />
        <Route path="/Empresa/:id_empresa" element={<EmpresaDetalles />} />
      </Routes>

      {/* Agregamos ToastContainer aquí para que funcione en toda la app */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop />
    </Router>
  );
};

export default App;
