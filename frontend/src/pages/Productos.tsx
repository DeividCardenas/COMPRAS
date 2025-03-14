import { useState, useEffect, useCallback } from "react";
import { fetchProductos, Producto, ProductParams } from "../services/productosService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const Productos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [selectedFilterRegulacion, setSelectedFilterRegulacion] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;

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
        if (["descripcion", "codigo_magister", "cum_pactado"].includes(selectedFilter)) {
          (filters as Record<string, string>)[selectedFilter] = search;
        }
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
  }, [search, currentPage, selectedFilter, selectedFilterRegulacion]);

  useEffect(() => {
    fetchProductosData();
  }, [fetchProductosData]);

  return (

    <div className="relative p-4 bg-sky-900 min-h-screen flex flex-col">
      {/* Filtros */}
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
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-950 text-lg">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>

        <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} className="bg-zinc-100 text-black rounded-md p-2 shadow-sm text-sm">
          <option value="">Filtro</option>
          <option value="descripcion">Descripción</option>
          <option value="codigo_magister">Código Magister</option>
          <option value="cum_pactado">CUM Pactado</option>
        </select>

        <select
          value={selectedFilterRegulacion}
          onChange={(e) => setSelectedFilterRegulacion(e.target.value)}
          className="bg-zinc-100 text-black rounded-md p-2 shadow-sm text-sm"
        >
          <option value="">Filtrar por Regulación</option>
          <option value="todos">Todos los productos</option>
          <option value="regulados">Productos regulados</option>
          <option value="no_regulados">Productos no regulados</option>
        </select>
      </div>

      {/* Paginación */}
      <div className="flex justify-between items-center mb-4 text-sm w-full">
        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} className={`py-2 px-3 bg-blue-950 hover:bg-gray-400 text-white rounded-md ${currentPage === 1 ? "invisible" : ""}`} style={{ width: "100px" }}>
          Anterior
        </button>

        <div className="flex-grow text-center text-white">
          Página {currentPage} de {totalPages}
        </div>

        <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} className={`py-2 px-3 bg-blue-950 hover:bg-gray-400 text-white rounded-md ${currentPage === totalPages ? "invisible" : ""}`} style={{ width: "100px" }}>
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
                <th className="p-2">Código Magister</th>
                <th className="p-2">CUM Pactado</th>
                <th className="p-2">Laboratorio</th>
                <th className="p-2">Descripción</th>
                <th className="p-2">Principio Activo</th>
                <th className="p-2">Concentración</th>
                <th className="p-2">Costo Compra</th>
                {selectedFilterRegulacion === "regulados" && <th className="p-2">Regulación</th>}
              </tr>
            </thead>
            <tbody className="bg-stone-200">
              {productos.length > 0 ? (
                productos.map((producto) => (
                  <tr key={producto.id_producto} className="hover:bg-violet-300">
                    <td className="p-2 text-center">{producto.codigo_magister ?? "-"}</td>
                    <td className="p-2 text-center">{producto.cum_pactado ?? "-"}</td>
                    <td className="p-2 text-center">{producto.laboratorio?.nombre}</td>
                    <td className="p-2 text-center">{producto.descripcion}</td>
                    <td className="p-2 text-center">{producto.principio_activo}</td>
                    <td className="p-2 text-center">{producto.concentracion ?? "-"}</td>
                    <td className="p-2 text-center">
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                      }).format(Number(producto.costo_compra))}
                    </td>
                    {selectedFilterRegulacion === "regulados" && (
                      <td className="p-2 text-center">
                        {producto.regulacion_tableta || producto.regulacion_empaque ? (
                          <div className="flex items-center justify-center gap-4">
                            <span>
                              <strong>Tableta:</strong>{" "}
                              {producto.regulacion_tableta
                                ? new Intl.NumberFormat("es-CO", {
                                  style: "currency",
                                  currency: "COP",
                                }).format(Number(producto.regulacion_tableta))
                                : "-"}
                            </span>
                            <span>
                              <strong>Empaque:</strong>{" "}
                              {producto.regulacion_empaque
                                ? new Intl.NumberFormat("es-CO", {
                                  style: "currency",
                                  currency: "COP",
                                }).format(Number(producto.regulacion_empaque))
                                : "-"}
                            </span>
                          </div>
                        ) : (
                          "No"
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={selectedFilterRegulacion === "regulados" ? 7 : 6}
                    className="text-center py-4 text-black"
                  >
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
