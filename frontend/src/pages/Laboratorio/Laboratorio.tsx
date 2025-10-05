import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { fetchLaboratories, Laboratorio, fetchProductsByLaboratory, Producto } from "../../services/Laboratorio/laboratoriosService";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const Laboratorios: React.FC = () => {
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Modal states for laboratory details
  const [selectedLab, setSelectedLab] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Details states
  const [productos, setProductos] = useState<Producto[]>([]);
  const [searchDetails, setSearchDetails] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [selectedFilterRegulacion, setSelectedFilterRegulacion] = useState("");
  const [currentPageDetails, setCurrentPageDetails] = useState(1);
  const [totalPagesDetails, setTotalPagesDetails] = useState(1);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedExtraFields, setSelectedExtraFields] = useState<string[]>([]);
  const [tempSelectedExtraFields, setTempSelectedExtraFields] = useState<string[]>(selectedExtraFields);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const itemsPerPage = 9;

  const itemsPerPageDetails = 10;

  // Extra fields list
  const extraFieldsList = [
    { field: "presentacion", label: "Presentación" },
    { field: "registro_sanitario", label: "Registro Sanitario" },
    { field: "regulacion", label: "Regulación" },
    { field: "codigo_barras", label: "Código de Barras" },
  ];

  useEffect(() => {
    const loadLaboratorios = async () => {
      try {
        const response = await fetchLaboratories(currentPage, itemsPerPage, search);
        setLaboratorios(response.data);
        setTotalPages(response.totalPages);
      } catch (error) {
        toast.error("Error al cargar laboratorios");
      } finally {
        setLoading(false);
      }
    };
    loadLaboratorios();
  }, [currentPage, search]);

  // Effect to fetch products when modal filters change
  useEffect(() => {
    if (showModal && selectedLab) {
      fetchProductsForModal(selectedLab);
    }
  }, [currentPageDetails, searchDetails, selectedFilter, selectedFilterRegulacion, selectedExtraFields]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleViewDetails = (id: number) => {
    setSelectedLab(id);
    setShowModal(true);
    setCurrentPageDetails(1);
    setSearchDetails("");
    setSelectedFilter("");
    setSelectedFilterRegulacion("");
    setSelectedExtraFields([]);
    setTempSelectedExtraFields([]);
    fetchProductsForModal(id);
  };

  const fetchProductsForModal = async (labId: number) => {
    setLoadingDetails(true);
    try {
      const filters: Record<string, string> = {
        page: currentPageDetails.toString(),
        limit: itemsPerPageDetails.toString(),
      };

      if (selectedFilter && searchDetails) {
        filters[selectedFilter] = searchDetails;
      }
      if (["regulados", "no_regulados"].includes(selectedFilterRegulacion)) {
        filters["con_regulacion"] = selectedFilterRegulacion;
      }
      if (selectedExtraFields.length > 0) {
        filters["campos"] = selectedExtraFields.join(",");
      }

      const fetchedProductos = await fetchProductsByLaboratory(labId.toString(), filters);
      setProductos(fetchedProductos.productos.lista);
      setTotalPagesDetails(fetchedProductos.productos.totalPaginas);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      toast.error("Error al cargar los productos");
      setProductos([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const toggleTempExtraField = (field: string) => {
    setTempSelectedExtraFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleApplyColumnSelection = () => {
    setSelectedExtraFields(tempSelectedExtraFields);
    setShowColumnSelector(false);
  };

  const handleCancelColumnSelection = () => {
    setTempSelectedExtraFields(selectedExtraFields);
    setShowColumnSelector(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLab(null);
    setProductos([]);
  };

  return (
    <div className="min-h-screen bg-sky-900 flex flex-col">
      <header className="bg-sky-800 shadow-lg p-4 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white hover:text-gray-200 transition-colors px-4 py-2 rounded-lg hover:bg-sky-700"
        >
          <ArrowLeft size={24} className="mr-2" />
          <span className="font-medium">Volver</span>
        </button>
      </header>
      <div className="flex-1 p-4">
        <h1 className="text-3xl font-bold text-white mb-6">Laboratorios</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar laboratorio..."
          value={search}
          onChange={handleSearch}
          className="bg-zinc-100 rounded-lg p-2 text-gray-950 w-full max-w-xs shadow-md"
        />
      </div>

      {loading ? (
        <div className="text-center text-white">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {laboratorios.map((lab) => (
            <div
              key={lab.id_laboratorio}
              className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transform hover:scale-105 transition-all cursor-pointer"
              onClick={() => handleViewDetails(lab.id_laboratorio)}
            >
              <h3 className="text-2xl font-semibold text-indigo-900 mb-2">{lab.nombre}</h3>
              <p className="text-gray-600">ID: {lab.id_laboratorio}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-indigo-900 text-white rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-white">Página {currentPage} de {totalPages}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-indigo-900 text-white rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
      </div>

      {/* Modal for laboratory details */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b bg-indigo-900 text-white">
              <h2 className="text-xl font-bold">
                Detalles del Laboratorio: {laboratorios.find(lab => lab.id_laboratorio === selectedLab)?.nombre}
              </h2>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-200 text-2xl"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Filters and controls */}
              <div className="mb-4 flex flex-wrap gap-4 items-center relative">
                <div className="relative w-full sm:max-w-xs">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchDetails}
                    onChange={(e) => setSearchDetails(e.target.value)}
                    className="bg-zinc-100 rounded-lg p-2 text-gray-950 w-full shadow-md pr-8 text-sm"
                  />
                  {searchDetails && (
                    <button
                      onClick={() => setSearchDetails("")}
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
                  <option value="cum">CUM</option>
                  <option value="codigo_barras">Código de Barras</option>
                </select>

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

                <button
                  onClick={() => setShowColumnSelector(true)}
                  className="px-4 py-2 rounded-lg bg-indigo-900 hover:bg-indigo-700 text-white shadow-md"
                >
                  Seleccionar columnas
                </button>
              </div>

              {/* Column selector modal */}
              {showColumnSelector && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
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

              {/* Pagination */}
              <div className="flex justify-between items-center mb-4 text-sm">
                <button
                  onClick={() => setCurrentPageDetails((prev) => Math.max(prev - 1, 1))}
                  className={`py-2 px-3 bg-indigo-900 hover:bg-gray-400 text-white rounded-md ${currentPageDetails === 1 ? "invisible" : ""}`}
                  style={{ width: "100px" }}
                >
                  Anterior
                </button>
                <div className="flex-grow text-center text-black">
                  Página {currentPageDetails} de {totalPagesDetails}
                </div>
                <button
                  onClick={() => setCurrentPageDetails((prev) => Math.min(prev + 1, totalPagesDetails))}
                  className={`py-2 px-3 bg-indigo-900 hover:bg-gray-400 text-white rounded-md ${currentPageDetails === totalPagesDetails ? "invisible" : ""}`}
                  style={{ width: "100px" }}
                >
                  Siguiente
                </button>
              </div>

              {/* Products table */}
              {loadingDetails ? (
                <div className="text-center text-black">Cargando...</div>
              ) : (
                <div className="overflow-x-auto shadow-lg rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="p-3 border-b text-center text-white bg-indigo-900">
                      <tr>
                        <th className="p-2">CUM</th>
                        <th className="p-2">Descripción</th>
                        {selectedExtraFields.includes("presentacion") && (
                          <th className="p-2">Presentación</th>
                        )}
                        <th className="p-2">Concentración</th>
                        <th className="p-2">Precio Unidad</th>
                        <th className="p-2">Precio Presentación</th>
                        {selectedExtraFields.includes("registro_sanitario") && (
                          <th className="p-2">Registro Sanitario</th>
                        )}
                        {selectedExtraFields.includes("regulacion") && (
                          <th className="p-2">Regulación</th>
                        )}
                        {selectedExtraFields.includes("codigo_barras") && (
                          <th className="p-2">Código de Barras</th>
                        )}
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
                            <td className="p-2 text-center">{producto.concentracion}</td>
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
                          <td
                            colSpan={
                              6 +
                              (selectedExtraFields.includes("presentacion") ? 1 : 0) +
                              (selectedExtraFields.includes("registro_sanitario") ? 1 : 0) +
                              (selectedExtraFields.includes("regulacion") ? 1 : 0) +
                              (selectedExtraFields.includes("codigo_barras") ? 1 : 0)
                            }
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Laboratorios;
