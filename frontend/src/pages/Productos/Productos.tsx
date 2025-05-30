import { useState, useEffect, useCallback } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { fetchProductos, Producto, ProductParams } from "../../services/Productos/productosService";

const Productos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [selectedFilterRegulacion, setSelectedFilterRegulacion] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedExtraFields, setSelectedExtraFields] = useState<string[]>([]);

  // Estado para controlar el modal de selección de columnas
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  // Estado temporal para manejar cambios en el modal sin afectar inmediatamente la consulta
  const [tempSelectedExtraFields, setTempSelectedExtraFields] = useState<string[]>(selectedExtraFields);

  const itemsPerPage = 10;

  // Lista de campos extra disponibles con sus etiquetas
  const extraFieldsList = [
    { field: "presentacion", label: "Presentación" },
    { field: "registro_sanitario", label: "Registro Sanitario" },
    { field: "regulacion", label: "Regulación" },
    { field: "codigo_barras", label: "Código de Barras" },
  ];

  // Manejo de la selección temporal en el modal
  const toggleTempExtraField = (field: string) => {
    setTempSelectedExtraFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  // Aplica los cambios del modal y actualiza el estado de columnas seleccionadas
  const handleApplyColumnSelection = () => {
    setSelectedExtraFields(tempSelectedExtraFields);
    setShowColumnSelector(false);
  };

  // Cancela la selección y cierra el modal sin cambios
  const handleCancelColumnSelection = () => {
    setTempSelectedExtraFields(selectedExtraFields);
    setShowColumnSelector(false);
  };

  const fetchProductosData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Partial<ProductParams> = {
        page: currentPage,
        limit: itemsPerPage,
        con_regulacion:
          selectedFilterRegulacion === "regulados" || selectedFilterRegulacion === "no_regulados"
            ? selectedFilterRegulacion
            : undefined,
      };

      if (selectedFilter && search) {
        if (["descripcion", "codigo_barras", "cum"].includes(selectedFilter)) {
          (filters as Record<string, string>)[selectedFilter] = search;
        }
      }

      // Si se han seleccionado columnas extra, se unen en una cadena separada por comas
      if (selectedExtraFields.length > 0) {
        filters.campos = selectedExtraFields.join(",");
      }

      const fetchedProductos = await fetchProductos(filters);
      setProductos(fetchedProductos.productos);
      setTotalPages(fetchedProductos.totalPaginas);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      toast.error("Error al cargar los productos");
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, [search, currentPage, selectedFilter, selectedFilterRegulacion, selectedExtraFields]);

  useEffect(() => {
    fetchProductosData();
  }, [fetchProductosData]);

  return (
    <div className="relative p-4 bg-sky-900 min-h-screen flex flex-col">
      {/* Sección de filtros principales */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-100 rounded-lg p-2 text-gray-950 w-full shadow-md pr-8 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-950 text-lg"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>

        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="bg-zinc-100 text-black rounded-md p-2 shadow-sm text-sm"
        >
          <option value="">Filtro</option>
          <option value="descripcion">Descripción</option>
          <option value="codigo_barras">Código de Barras</option>
          <option value="cum">CUM</option>
        </select>

        {/* Mostrar el filtro solo si la columna "Regulación" está seleccionada */}
        {selectedExtraFields.includes("regulacion") && (
          <select
            value={selectedFilterRegulacion}
            onChange={(e) => setSelectedFilterRegulacion(e.target.value)}
            className="bg-zinc-100 text-black rounded-md p-2 shadow-sm text-sm"
          >
            <option value="">Filtrar por Regulación</option>
            <option value="regulados">Productos regulados</option>
            <option value="no_regulados">Productos no regulados</option>
          </select>
        )}

        {/* Botón para abrir el modal de selección de columnas */}
        <button
          onClick={() => setShowColumnSelector(true)}
          className="px-4 py-2 rounded-lg bg-indigo-900 hover:bg-indigo-700 text-white shadow-md"
        >
          Seleccionar columnas
        </button>
      </div>

      {/* Modal para seleccionar columnas adicionales */}
      {showColumnSelector && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Selecciona campos adicionales</h2>
            <div className="flex flex-col gap-3">
              {extraFieldsList.map((item) => (
                <label key={item.field} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={tempSelectedExtraFields.includes(item.field)}
                    onChange={() => toggleTempExtraField(item.field)}
                    className="mr-2"
                  />
                  {item.label}
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={handleCancelColumnSelection}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyColumnSelection}
                className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paginación */}
      <div className="flex justify-between items-center mb-4 text-sm w-full">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className={`py-2 px-3 bg-blue-950 hover:bg-gray-400 text-white rounded-md ${currentPage === 1 ? "invisible" : ""
            }`}
          style={{ width: "100px" }}
        >
          Anterior
        </button>

        <div className="flex-grow text-center text-white">
          Página {currentPage} de {totalPages}
        </div>

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className={`py-2 px-3 bg-blue-950 hover:bg-gray-400 text-white rounded-md ${currentPage === totalPages ? "invisible" : ""
            }`}
          style={{ width: "100px" }}
        >
          Siguiente
        </button>
      </div>

      {/* Tabla de productos */}
      {loading ? (
        <div className="text-center text-white">Cargando...</div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="p-3 border-b text-center text-white bg-indigo-900">
              <tr>
                <th className="p-2">CUM</th>
                <th className="p-2">Descripción</th>
                {selectedExtraFields.includes("presentacion") && <th className="p-2">Presentación</th>}
                <th className="p-2">Concentración</th>
                <th className="p-2">Laboratorio</th>
                <th className="p-2">Precio Unidad</th>
                <th className="p-2">Precio Presentacion</th>
                {/* Se renderizan las columnas adicionales de forma dinámica */}
                {selectedExtraFields.includes("registro_sanitario") && <th className="p-2">Registro Sanitario</th>}
                {selectedExtraFields.includes("regulacion") && <th className="p-2">Regulación</th>}
                {selectedExtraFields.includes("codigo_barras") && <th className="p-2">Código de Barras</th>}
              </tr>
            </thead>
            <tbody className="bg-stone-200">
              {productos.length > 0 ? (
                productos.map((producto) => (
                  <tr key={producto.id_producto} className="hover:bg-violet-300">
                    <td className="p-2 text-center">{producto.cum}</td>
                    <td className="p-2 text-center">{producto.descripcion}</td>
                    {selectedExtraFields.includes("presentacion") && (
                      <td className="p-2 text-center">{producto.presentacion ?? "-"}</td>
                    )}
                    <td className="p-2 text-center">{producto.concentracion ?? "-"}</td>
                    <td className="p-2 text-center">{producto.laboratorio?.nombre}</td>
                    <td className="p-2 text-center">
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                      }).format(Number(producto.precio_unidad))}
                    </td>
                    <td className="p-2 text-center">
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                      }).format(Number(producto.precio_presentacion))}
                    </td>
                    {selectedExtraFields.includes("registro_sanitario") && (
                      <td className="p-2 text-center">{producto.registro_sanitario ?? "-"}</td>
                    )}
                    {selectedExtraFields.includes("regulacion") && (
                      <td className="p-2 text-center">{producto.regulacion ?? "-"}</td>
                    )}
                    {selectedExtraFields.includes("codigo_barras") && (
                      <td className="p-2 text-center">{producto.codigo_barras ?? "-"}</td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6 + selectedExtraFields.length} className="text-center py-4 text-black">
                    No hay productos disponibles
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

export default Productos;
