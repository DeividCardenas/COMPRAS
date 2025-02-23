import { useState, useEffect, useCallback, useRef } from "react";
import { fetchEmpresas, Empresa,  } from "../services/empresasService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const EmpresasPage = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const itemsPerPage = 10;
  const detailRef = useRef<HTMLDivElement>(null);

  const fetchEmpresasData = useCallback(async (filters: { page: number; limit: number; nombre?: string }) => {
    setLoading(true);
    try {
      const fetchedEmpresas = await fetchEmpresas(filters);
      setEmpresas(fetchedEmpresas.data);
      setTotalPages(Math.max(1, Math.ceil(fetchedEmpresas.total / itemsPerPage)));
    } catch (error) {
      console.error("Error al obtener empresas:", error);
      setEmpresas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmpresasData({
      page: currentPage,
      limit: itemsPerPage,
      nombre: search || undefined,
    });
  }, [search, currentPage, fetchEmpresasData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleSelectEmpresa = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (detailRef.current && !detailRef.current.contains(event.target as Node)) {
        setSelectedEmpresa(null);
      }
    };

    if (selectedEmpresa) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedEmpresa]);

  return (
    <div className="relative p-4 bg-sky-900 min-h-screen flex flex-col">
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Buscar empresas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-100 rounded-lg p-2 text-gray-950 w-full shadow-md pr-8 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-950 text-lg"
              aria-label="Borrar búsqueda"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </div>

      {totalPages > 0 ? (
        <div className="flex justify-between items-center mb-4 text-sm w-full">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`py-2 px-3 bg-blue-950 hover:bg-gray-400 text-white rounded-md ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{ width: "100px" }}
            disabled={currentPage === 1}
            aria-label="Página anterior"
          >
            Anterior
          </button>

          <div className="flex-grow text-center text-white">
            Página {currentPage} de {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className={`py-2 px-3 bg-blue-950 hover:bg-gray-400 text-white rounded-md ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{ width: "100px" }}
            disabled={currentPage === totalPages}
            aria-label="Página siguiente"
          >
            Siguiente
          </button>
        </div>
      ) : (
        <div className="text-center text-white">No hay resultados disponibles</div>
      )}

      {loading ? (
        <div className="text-center text-white">Cargando...</div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="p-3 border-b text-center text-white bg-blue-950">
              <tr>
                <th className="p-2">Nombre</th>
                <th className="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-stone-200">
              {empresas.length > 0 ? (
                empresas.map((empresa) => (
                  <tr key={empresa.id_empresa} className="hover:bg-violet-300">
                    <td className="p-2 text-center">{empresa.nombre}</td>
                    <td className="p-2 text-center space-x-2">
                      <button
                        onClick={() => handleSelectEmpresa(empresa)}
                        className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-1 rounded"
                      >
                        Ver Laboratorios
                      </button>
                      <Link
                        to={`/tarifarios/empresa/${empresa.id_empresa}`}
                        className="bg-green-600 hover:bg-green-800 text-white px-4 py-1 rounded"
                      >
                        Ver Tarifarios
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="text-center py-4 text-black">
                    No hay empresas disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedEmpresa && (
        <div ref={detailRef} className="mt-6 p-4 bg-gray-100 shadow-md rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900">
            Laboratorios de {selectedEmpresa.nombre}:
          </h2>
          <ul className="list-disc pl-5 mt-2">
          {selectedEmpresa?.laboratorios?.length > 0 ? (
            selectedEmpresa.laboratorios.map((lab) => (
              <li key={`lab-${lab.id_laboratorio}`} className="text-gray-800">
                <Link
                  to={`/laboratorios/${lab.id_laboratorio}/productos`}
                  className="text-blue-600 hover:underline"
                >
                  {lab.nombre}
                </Link>
              </li>
            ))
          ) : (
            <li className="text-gray-500">Sin laboratorios asociados</li>
          )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EmpresasPage;
