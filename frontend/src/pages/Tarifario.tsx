import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom"; // Importa useParams para obtener el id_tarifario
import { fetchProductosDeTarifario, ProductoTarifario, TarifarioProductoParams } from "../services/tarifariosService";
import { downloadReporte } from "../services/funcionesService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const TarifariosPage = () => {
  const { tarifarioId } = useParams<{ tarifarioId: string }>(); // Obtiene el ID del tarifario desde la URL
  const [productos, setProductos] = useState<ProductoTarifario[]>([]);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const itemsPerPage = 10;

  const fetchTarifariosData = useCallback(async () => {
    if (!tarifarioId) return; // Evitar ejecutar la petición si el id_tarifario es undefined

    setLoading(true);
    try {
      const filters: TarifarioProductoParams = {
        page: currentPage,
        limit: itemsPerPage,
        laboratorio: selectedFilter === "laboratorio" ? search : undefined,
        codigoProducto: selectedFilter === "codigo_magister" ? search : undefined,
        cumPactado: selectedFilter === "cum_pactado" ? search : undefined,
        descripcion: selectedFilter === "descripcion" ? search : undefined,
      };

      const fetchedProductos = await fetchProductosDeTarifario(Number(tarifarioId), filters);

      setProductos(fetchedProductos.productos);
      setTotalPages(fetchedProductos.totalPaginas);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      toast.error("Error al cargar los productos");
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, [tarifarioId, search, currentPage, selectedFilter]);

  useEffect(() => {
    fetchTarifariosData();
  }, [fetchTarifariosData]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadReporte();
      toast.success("Reporte descargado correctamente");
    } catch (error) {
      console.error("Error al descargar el reporte:", error);
      toast.error("Hubo un error al descargar el reporte");
    } finally {
      setDownloading(false);
    }
  };

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


      </div>

      {/* Botón de descarga */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`py-2 px-4 text-white rounded-md mb-4 transition duration-300 ${downloading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-950 hover:bg-gray-400"}`}
        >
          {downloading ? "Descargando..." : "Descargar Reporte"}
        </button>
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
            <thead className="p-3 border-b text-center text-white bg-blue-950">
              <tr>
                <th className="p-2">Descripción</th>
                <th className="p-2">Código Magister</th>
                <th className="p-2">CUM Pactado</th>
                <th className="p-2">Costo Venta</th>
                <th className="p-2">Venta por Unidad</th>
                <th className="p-2">Venta por Empaque</th>
              </tr>
            </thead>
            <tbody className="bg-stone-200">
              {productos.length > 0 ? (
                productos.map(({ producto, costo_venta, venta_unidad, venta_empaque }) => (
                  <tr key={producto.id_producto} className="hover:bg-violet-300">
                    <td className="p-2 text-center">{producto.descripcion}</td>
                    <td className="p-2 text-center">{producto.codigo_magister ?? "-"}</td>
                    <td className="p-2 text-center">{producto.cum_pactado ?? "-"}</td>
                    <td className="p-2 text-center">
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                      }).format(Number(costo_venta))}
                    </td>
                    <td className="p-2 text-center">
                      {venta_unidad !== null
                        ? new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                          }).format(Number(venta_unidad))
                        : "-"}
                    </td>
                    <td className="p-2 text-center">
                      {venta_empaque !== null
                        ? new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                          }).format(Number(venta_empaque))
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-black">
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

export default TarifariosPage;
