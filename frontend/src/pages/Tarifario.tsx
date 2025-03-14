import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { fetchTarifarioPorId, exportarTarifarioExcel, ProductoEnTarifario } from "../services/tarifariosService";
import { toast } from "react-toastify";

const TarifariosPage = () => {
  const { id_tarifario } = useParams<{ id_tarifario: string }>();
  const [productos, setProductos] = useState<ProductoEnTarifario[]>([]);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchTarifarioData = useCallback(async () => {
    if (!id_tarifario) return;
    const tarifarioId = Number(id_tarifario);
    if (isNaN(tarifarioId)) {
      toast.error("ID de tarifario no válido");
      return;
    }
    setLoading(true);
    try {
      const tarifario = await fetchTarifarioPorId(tarifarioId);
      setProductos(tarifario.productos);
    } catch (error) {
      console.error("Error al cargar el tarifario:", error);
      toast.error("Error al cargar el tarifario. Ver consola para más detalles.");
    } finally {
      setLoading(false);
    }
  }, [id_tarifario]);

  useEffect(() => {
    fetchTarifarioData();
  }, [fetchTarifarioData]);

  const handleDownload = async () => {
    if (!id_tarifario) {
      toast.warning("No se encontró el ID del tarifario");
      return;
    }
    const tarifarioId = Number(id_tarifario);
    setDownloading(true);
    try {
      await exportarTarifarioExcel(tarifarioId);
      toast.success("El tarifario se exportó correctamente");
    } catch (error) {
      console.error("Error al descargar el tarifario:", error);
      toast.error("Hubo un error al descargar el tarifario. Inténtalo nuevamente.");
    } finally {
      setDownloading(false);
    }
  };

  const filteredProductos = productos.filter((producto) => {
    if (!search || !selectedFilter) return true;
    const value = producto[selectedFilter as keyof ProductoEnTarifario];
    return value?.toString().toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="relative p-6 bg-sky-900 min-h-screen flex flex-col text-white">
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full lg:w-1/3 p-2 rounded-md text-black bg-white shadow-md"
        />
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="w-full lg:w-1/4 p-2 rounded-md text-black bg-white shadow-md"
        >
          <option value="">Seleccionar filtro</option>
          <option value="descripcion">Descripción</option>
          <option value="principio_activo">Principio Activo</option>
          <option value="cum_pactado">CUM Pactado</option>
        </select>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`p-2 rounded-md ${downloading ? "bg-gray-500" : "bg-indigo-900 hover:bg-blue-900"}`}
        >
          {downloading ? "Descargando..." : "Descargar Tarifario"}
        </button>
      </div>

      {loading ? (
        <div className="text-center text-lg">Cargando tarifario...</div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg bg-white text-gray-900">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-900 text-white">
              <tr>
                <th className="p-3">CUM Pactado</th>
                <th className="p-3">Descripción</th>
                <th className="p-3">Principio Activo</th>
                <th className="p-3">Concentración</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Precio Unidad</th>
              </tr>
            </thead>
            <tbody>
              {filteredProductos.length > 0 ? (
                filteredProductos.map((producto) => (
                  <tr key={producto.id_producto} className="hover:bg-gray-300">
                    <td className="p-3 text-center">{producto.cum_pactado ?? "-"}</td>
                    <td className="p-3 text-center">{producto.descripcion}</td>
                    <td className="p-3 text-center">{producto.principio_activo}</td>
                    <td className="p-3 text-center">{producto.concentracion ?? "-"}</td>
                    <td className="p-3 text-center">{producto.precio}</td>
                    <td className="p-3 text-center">{producto.precio_unidad}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6">
                    {search ? "No se encontraron productos con ese filtro" : "No hay productos disponibles"}
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
