import React, { useState } from "react";
import { fetchEmpresas, fetchEps, fetchLaboratorios, fetchUsers } from "../../services/Admin/admin.Service";
import Sidebar from "../../components/Sidebar";
import MobileSidebar from "../../components/MobileSidebar";
import Header from "../../components/Header";


const AdminDashboard: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const fetchData = async (type: string) => {
    try {
      setError(null); // Limpiar errores previos
      setData(null); // Limpiar datos previos
      let response;
      const defaultFilters = { page: 1, limit: 10 }; // Filtros predeterminados

      switch (type) {
        case "users":
          response = await fetchUsers(defaultFilters);
          break;
        case "eps":
          response = await fetchEps(defaultFilters);
          break;
        case "laboratorios":
          response = await fetchLaboratorios(defaultFilters);
          break;
        case "empresas":
          response = await fetchEmpresas(defaultFilters);
          break;
        default:
          throw new Error("Tipo de datos no válido");
      }
      setData(response);
    } catch (err) {
      console.error(`Error al obtener ${type}:`, err);
      setError(`No se pudo cargar la información de ${type}. Intente nuevamente más tarde.`);
    }
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const confirmDelete = () => {
    console.log("Eliminando:", selectedItem);
    closeModals();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Mobile header */}
        <Header onMenuClick={handleMenuToggle} />

        {/* Main content */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none p-6">
          <h1 className="text-2xl font-bold text-center text-blue-800 mb-6">
            Panel de Administración
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => fetchData("users")}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition"
            >
              Ver Usuarios
            </button>
            <button
              onClick={() => fetchData("eps")}
              className="bg-green-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-600 transition"
            >
              Ver EPS
            </button>
            <button
              onClick={() => fetchData("laboratorios")}
              className="bg-yellow-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-yellow-600 transition"
            >
              Ver Laboratorios
            </button>
            <button
              onClick={() => fetchData("empresas")}
              className="bg-purple-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-purple-600 transition"
            >
              Ver Empresas
            </button>
          </div>

          {error && <p className="text-center text-red-600">{error}</p>}

          <div className="bg-white p-4 rounded-lg shadow-md">
            {data ? (
              (() => {
                if (Array.isArray(data.usuarios)) {
                  // Renderizar usuarios
                  return (
                    <ul className="space-y-2">
                      {data.usuarios.map((usuario: any) => (
                        <li key={usuario.id_usuario} className="p-2 border-b border-gray-200 flex justify-between items-center">
                          <div>
                            <strong>ID:</strong> {usuario.id_usuario} - 
                            <strong> Nombre:</strong> {usuario.username} - 
                            <strong> Email:</strong> {usuario.email} - 
                            <strong> Rol:</strong> {usuario.rol.nombre}
                          </div>
                          <div>
                            <button
                              onClick={() => handleEdit(usuario)}
                              className="bg-blue-500 text-white px-2 py-1 rounded-md mr-2"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(usuario)}
                              className="bg-red-500 text-white px-2 py-1 rounded-md"
                            >
                              Eliminar
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  );
                } 
                else if (Array.isArray(data.eps)) {
                  // Renderizar EPS
                  return (
                    <ul className="space-y-2">
                      {data.eps.map((eps: any) => (
                        <li key={eps.id_eps} className="p-2 border-b border-gray-200 flex justify-between items-center">
                          <div>
                            <strong>ID:</strong> {eps.id_eps} - 
                            <strong> Nombre:</strong> {eps.nombre}
                          </div>
                          <div>
                            <button
                              onClick={() => handleEdit(eps)}
                              className="bg-blue-500 text-white px-2 py-1 rounded-md mr-2"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(eps)}
                              className="bg-red-500 text-white px-2 py-1 rounded-md"
                            >
                              Eliminar
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  );
                }
                else if (Array.isArray(data.data)) {
                  // Renderizar laboratorios
                  return (
                    <ul className="space-y-2">
                      {data.data.map((laboratorio: any) => (
                        <li key={laboratorio.id_laboratorio} className="p-2 border-b border-gray-200 flex justify-between items-center">
                          <div>
                            <strong>ID:</strong> {laboratorio.id_laboratorio} - 
                            <strong> Nombre:</strong> {laboratorio.nombre}
                          </div>
                          <div>
                            <button
                              onClick={() => handleEdit(laboratorio)}
                              className="bg-blue-500 text-white px-2 py-1 rounded-md mr-2"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(laboratorio)}
                              className="bg-red-500 text-white px-2 py-1 rounded-md"
                            >
                              Eliminar
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  );
                }
                else if (Array.isArray(data.data)) {
                  // Renderizar empresas
                  return (
                    <ul className="space-y-4">
                      {data.data.map((empresa: any) => (
                        <li key={empresa.id_empresa} className="p-4 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <strong>ID:</strong> {empresa.id_empresa} - 
                              <strong> Nombre:</strong> {empresa.nombre}
                            </div>
                            <div>
                              <button
                                onClick={() => handleEdit(empresa)}
                                className="bg-blue-500 text-white px-2 py-1 rounded-md mr-2"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(empresa)}
                                className="bg-red-500 text-white px-2 py-1 rounded-md"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                          <strong>Laboratorios:</strong>
                          <ul className="ml-4 mt-2 space-y-2">
                            {empresa.laboratorios.map((laboratorio: any) => (
                              <li key={laboratorio.id_laboratorio} className="flex justify-between items-center">
                                <div>
                                  <strong>ID:</strong> {laboratorio.id_laboratorio} - 
                                  <strong> Nombre:</strong> {laboratorio.nombre}
                                </div>
                                <div>
                                  <button
                                    onClick={() => handleEdit(laboratorio)}
                                    className="bg-blue-500 text-white px-2 py-1 rounded-md mr-2"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDelete(laboratorio)}
                                    className="bg-red-500 text-white px-2 py-1 rounded-md"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  );
                }
                else {
                  return (
                    <pre className="text-sm text-gray-800 overflow-auto">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  );
                }
              })()
            ) : (
              <p className="text-center text-gray-500">Seleccione una opción para cargar datos.</p>
            )}
          </div>
        </main>
      </div>

      {/* Modal para Editar */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Editar Información</h2>
            <p>Editar información de: {selectedItem?.username || selectedItem?.nombre}</p>
            {/* Aquí puedes agregar un formulario para editar */}
            <button
              onClick={closeModals}
              className="bg-gray-500 text-white px-4 py-2 rounded-md mt-4"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal para Confirmar Eliminación */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirmar Eliminación</h2>
            <p>¿Estás seguro de que deseas eliminar: {selectedItem?.username || selectedItem?.nombre}?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={closeModals}
                className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;