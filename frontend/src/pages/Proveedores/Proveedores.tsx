import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { fetchProveedores } from '../../services/Proveedores/proveedoresService';

interface Proveedor {
  id_proveedor: number;
  laboratorio: string;
  tipo: string;
  titular: string;
  direccion: string;
  telefono: string;
  email: string;
}

const Proveedores: React.FC = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getProveedores = async () => {
      setLoading(true);
      try {
        const result = await fetchProveedores({
          page: currentPage,
          limit: itemsPerPage,
          search,
          filter: selectedFilter,
        });

        // defensivo: aceptar distintos formatos de respuesta
        const providers = Array.isArray((result as any).providers)
          ? (result as any).providers
          : Array.isArray((result as any).data)
          ? (result as any).data
          : [];

        const total = (result as any).totalPages || (result as any).total || 1;

        setProveedores(providers);
        setTotalPages(Number(total));
      } catch (error) {
        console.error('Error al obtener proveedores', error);
      } finally {
        setLoading(false);
      }
    };
    getProveedores();
  }, [search, currentPage, selectedFilter, itemsPerPage]);

  return (
    <div className="relative p-6 bg-sky-900 min-h-screen flex flex-col items-center">
      <button
        onClick={() => navigate('/Menu')}
        className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all focus:outline-none"
        aria-label="Ir al inicio"
      >
        Inicio
      </button>

      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-white text-center mb-6">Proveedores</h1>

        <div className="bg-white p-4 rounded-2xl shadow-md mb-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Buscar proveedores..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-100 rounded-lg p-2 text-gray-950 w-full shadow-md pr-8 text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-950 text-lg"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-zinc-100 text-black rounded-md p-2 shadow-sm text-sm"
              >
                <option value="">Filtro</option>
                <option value="laboratorio">Laboratorio</option>
                <option value="tipo">Tipo</option>
                <option value="titular">Titular</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 text-sm w-full max-w-5xl px-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`py-2 px-3 bg-blue-950 hover:bg-gray-400 text-white rounded-md ${currentPage === 1 ? 'invisible' : ''}`}
            style={{ width: '100px' }}
          >
            Anterior
          </button>

          <div className="flex-grow text-center text-white">
            Página {totalPages > 0 ? currentPage : 0} de {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className={`py-2 px-3 bg-blue-950 hover:bg-gray-400 text-white rounded-md ${currentPage === totalPages ? 'invisible' : ''}`}
            style={{ width: '100px' }}
          >
            Siguiente
          </button>
        </div>

        {loading ? (
          <div className="text-center text-white">Cargando...</div>
        ) : (
          <div className="overflow-x-auto shadow-lg rounded-lg bg-white p-4">
            <table className="min-w-full text-sm">
              <thead className="p-3 border-b text-center text-white bg-blue-950">
                <tr>
                  <th className="p-2">Laboratorio</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Titular</th>
                </tr>
              </thead>
              <tbody className="bg-stone-200">
                {proveedores.length > 0 ? (
                  proveedores.map((proveedor) => (
                    <tr key={proveedor.id_proveedor} className="hover:bg-violet-300">
                      <td className="p-2 text-center">{proveedor.laboratorio}</td>
                      <td className="p-2 text-center">{proveedor.tipo}</td>
                      <td className="p-2 text-center">{proveedor.titular}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-black">
                      No hay proveedores disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Proveedores;
