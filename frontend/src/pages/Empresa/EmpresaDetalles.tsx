import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { fetchVentas } from '../../services/Ventas/ventasService';

interface Venta {
  id_ventas: number;
  precio: number;
  fecha_vigencia: string;
  producto: {
    descripcion_comercial: string;
    principio_activo: string;
    concentracion: string;
    estado: string;
    codigo: string;
    codigo_especifico: string;
    Invima: string;
    Fecha_vencimiento: string;
    CUM: string;
  };
}

const EmpresaDetalles = () => {
  const { id_empresa } = useParams<{ id_empresa: string }>();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [search, setSearch] = useState('');
  // Inicializamos el filtro por defecto. Puedes modificarlo según tu necesidad.
  const [selectedFilter, setSelectedFilter] = useState('descripcion_comercial');
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  // Función para obtener las ventas con los filtros y paginación
  const fetchVentasData = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        id_empresa: parseInt(id_empresa!),
        page: currentPage,
        limit: itemsPerPage,
        ...activeFilters,
        // Se agrega el filtro seleccionado con el valor del search (o undefined si está vacío)
        [selectedFilter]: search || undefined,
      };

      const fetchedVentas = await fetchVentas(filters);

      setVentas(fetchedVentas.sales);
      const calculatedTotalPages = Math.max(1, Math.ceil(fetchedVentas.totalSales / itemsPerPage));
      setTotalPages(calculatedTotalPages);

      // Si no hay ventas, reiniciamos a la primera página
      if (fetchedVentas.sales.length === 0) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      setVentas([]);
    } finally {
      setLoading(false);
    }
  }, [search, currentPage, selectedFilter, activeFilters, id_empresa]);

  // Se llama a fetchVentasData cada vez que alguno de los parámetros cambia
  useEffect(() => {
    fetchVentasData();
  }, [fetchVentasData]);

  // Actualiza los filtros activos cada vez que cambie el search o el filtro seleccionado,
  // y reinicia la paginación a la primera página
  useEffect(() => {
    if (selectedFilter) {
      setActiveFilters((prev) => ({
        ...prev,
        [selectedFilter]: search,
      }));
      setCurrentPage(1);
    }
  }, [search, selectedFilter]);

  return (
    <div className="relative p-4 bg-sky-900 min-h-screen flex flex-col">
      {/* Sección de búsqueda y filtros */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Buscar ventas..."
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
            <option value="descripcion_comercial">Descripción Comercial</option>
            <option value="principio_activo">Principio Activo</option>
            <option value="concentracion">Concentración</option>
            <option value="estado">Estado</option>
            <option value="codigo">Código</option>
            <option value="codigo_especifico">Código Específico</option>
            <option value="Invima">Invima</option>
            <option value="Fecha_vencimiento">Fecha de Vencimiento</option>
            <option value="CUM">CUM</option>
          </select>
        </div>
      </div>

      {/* Controles de paginación */}
      <div className="flex justify-between items-center mb-4 text-sm w-full">
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

      {/* Tabla de resultados */}
      {loading ? (
        <div className="text-center text-white">Cargando...</div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="p-3 border-b text-center text-white bg-blue-950">
              <tr>
                <th className="p-2">Descripción</th>
                <th className="p-2">Principio</th>
                <th className="p-2">Concentración</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Código</th>
                <th className="p-2">Específico</th>
                <th className="p-2">Invima</th>
                <th className="p-2">Vencimiento</th>
                <th className="p-2">CUM</th>
                <th className="p-2">Precio</th>
                <th className="p-2">Vigencia</th>
              </tr>
            </thead>
            <tbody className="bg-stone-200">
              {ventas.length > 0 ? (
                ventas.map((venta) => (
                  <tr key={venta.id_ventas} className="hover:bg-violet-300">
                    <td className="p-2 text-center">{venta.producto.descripcion_comercial}</td>
                    <td className="p-2 text-center">{venta.producto.principio_activo}</td>
                    <td className="p-2 text-center">{venta.producto.concentracion}</td>
                    <td className="p-2 text-center">{venta.producto.estado}</td>
                    <td className="p-2 text-center">{venta.producto.codigo}</td>
                    <td className="p-2 text-center">{venta.producto.codigo_especifico}</td>
                    <td className="p-2 text-center">{venta.producto.Invima}</td>
                    <td className="p-2 text-center">
                      {new Date(venta.producto.Fecha_vencimiento).toLocaleDateString()}
                    </td>
                    <td className="p-2 text-center">{venta.producto.CUM}</td>
                    <td className="p-2 text-center">${venta.precio}</td>
                    <td className="p-2 text-center">
                    {(() => {
                      const date = new Date(venta.fecha_vigencia);
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      return `${year}-${month}-${day}`;
                    })()}
                  </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="text-center py-4 text-black">
                    No hay ventas disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmpresaDetalles;
