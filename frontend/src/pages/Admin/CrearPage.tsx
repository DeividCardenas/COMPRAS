import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addEps, addLaboratorio, addEmpresa } from "../../services/Admin/admin.Service";

const CrearPage: React.FC = () => {
  // Estados para los formularios
  const [epsNombre, setEpsNombre] = useState("");
  const [labNombre, setLabNombre] = useState("");
  const [empresaNombre, setEmpresaNombre] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const navigate = useNavigate();

  // Handlers para crear EPS
  const handleCrearEps = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    try {
      await addEps({ nombre: epsNombre });
      setMensaje("EPS creada exitosamente.");
      setEpsNombre("");
    } catch {
      setMensaje("Error al crear la EPS.");
    }
  };

  // Handlers para crear Laboratorio
  const handleCrearLab = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    try {
      await addLaboratorio({ nombre: labNombre });
      setMensaje("Laboratorio creado exitosamente.");
      setLabNombre("");
    } catch {
      setMensaje("Error al crear el laboratorio.");
    }
  };

  // Handlers para crear Empresa
  const handleCrearEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    try {
      await addEmpresa({ nombre: empresaNombre });
      setMensaje("Empresa creada exitosamente.");
      setEmpresaNombre("");
    } catch {
      setMensaje("Error al crear la empresa.");
    }
  };

  return (
    <div className="min-h-screen bg-sky-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-indigo-900 mb-8">
          Crear Entidades
        </h1>
        <button
          onClick={() => navigate("/Admin")}
          className="mb-6 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
        >
          Volver atrás
        </button>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-green-700">Crear EPS</h2>
          <form onSubmit={handleCrearEps} className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Nombre de la EPS"
              value={epsNombre}
              onChange={(e) => setEpsNombre(e.target.value)}
              required
              className="border border-gray-300 rounded-md p-2"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2 transition"
            >
              Crear EPS
            </button>
          </form>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-yellow-700">
            Crear Laboratorio
          </h2>
          <form onSubmit={handleCrearLab} className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Nombre del Laboratorio"
              value={labNombre}
              onChange={(e) => setLabNombre(e.target.value)}
              required
              className="border border-gray-300 rounded-md p-2"
            />
            <button
              type="submit"
              className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-md px-4 py-2 transition"
            >
              Crear Laboratorio
            </button>
          </form>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2 text-purple-700">
            Crear Empresa
          </h2>
          <form onSubmit={handleCrearEmpresa} className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Nombre de la Empresa"
              value={empresaNombre}
              onChange={(e) => setEmpresaNombre(e.target.value)}
              required
              className="border border-gray-300 rounded-md p-2"
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-md px-4 py-2 transition"
            >
              Crear Empresa
            </button>
          </form>
        </div>

        {mensaje && (
          <div className="mt-6 text-center text-lg font-medium text-indigo-800">
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrearPage;
