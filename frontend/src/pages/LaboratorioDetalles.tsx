import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { fetchProductsByLaboratory, exportProductsToExcel } from "../services/laboratoriosService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faFileExport } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

interface Producto {
  id_producto: number;
  codigo_magister?: string;
  cum_pactado?: string;
  descripcion: string;
  principio_activo: string;
  concentracion: string;
  registro_sanitario: string;
  costo_compra: string;
  regulacion_tableta?: number | null;
  regulacion_empaque?: number | null;
}

const LaboratorioDetalles = () => {
  const { laboratorioId } = useParams<{ laboratorioId: string }>();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [selectedFilterRegulacion, setSelectedFilterRegulacion] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;

  const fetchProductosData = useCallback(async () => {
    if (!laboratorioId) return;
    setLoading(true);
    try {
      const filters: Record<string, string> = {
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      };
      if (selectedFilter && search) {
        filters[selectedFilter] = search;
      }
      if (["regulados", "no_regulados"].includes(selectedFilterRegulacion)) {
        filters["con_regulacion"] = selectedFilterRegulacion;
      }
      const fetchedProductos = await fetchProductsByLaboratory(laboratorioId, filters);
      setProductos(fetchedProductos.productos.lista);
      setTotalPages(fetchedProductos.productos.totalPaginas);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      toast.error("Error al cargar los productos");
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, [laboratorioId, search, selectedFilter, selectedFilterRegulacion, currentPage]);

  const handleExportExcel = async () => {
    if (!laboratorioId) return;
    try {
      await exportProductsToExcel(laboratorioId);
      toast.success("Productos exportados con éxito");
    } catch {
      toast.error("Error al exportar los productos");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchProductosData();
  }, [fetchProductosData, search, selectedFilter, selectedFilterRegulacion]);

  return (
    <div className="relative p-4 bg-sky-900 min-h-screen flex flex-col">
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

        <button
          onClick={handleExportExcel}
          className="bg-indigo-900 text-white px-4 py-2 rounded-md hover:bg-blue-900 absolute top-4 right-4"
        > 
          <FontAwesomeIcon icon={faFileExport} className="mr-2" />
          Exportar a Excel
        </button>

        <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} className="bg-zinc-100 text-black rounded-md p-2 shadow-sm text-sm">
          <option value="">Filtro</option>
          <option value="codigo_magister">Código Magister</option>
          <option value="cum_pactado">CUM Pactado</option>
          <option value="descripcion">Descripción</option>
          <option value="principio_activo">Principio Activo</option>
          <option value="concentracion">Concentración</option>
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

      <div className="flex justify-between items-center mb-4 text-sm w-full">
        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} className={`py-2 px-3 bg-indigo-900 hover:bg-gray-400 text-white rounded-md ${currentPage === 1 ? "invisible" : ""}`} style={{ width: "100px" }}>
          Anterior
        </button>
        <div className="flex-grow text-center text-white">
          Página {currentPage} de {totalPages}
        </div>
        <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} className={`py-2 px-3 bg-indigo-900 hover:bg-gray-400 text-white rounded-md ${currentPage === totalPages ? "invisible" : ""}`} style={{ width: "100px" }}>
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
                          <span>
                            Tableta: {producto.regulacion_tableta ?? "-"} | Empaque: {producto.regulacion_empaque ?? "-"}
                          </span>
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

export default LaboratorioDetalles;
