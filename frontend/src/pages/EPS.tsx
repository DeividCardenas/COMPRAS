import { useState, useEffect, useCallback, useRef } from "react";
import { fetchEPS, EPS } from "../services/epsService"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSearch } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const EPSPage = () => {
  const [epsList, setEpsList] = useState<EPS[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEPS, setSelectedEPS] = useState<EPS | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const fetchEpsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedEps = await fetchEPS({ nombre: search || undefined });
      setEpsList(fetchedEps.eps || []);
    } catch {
      setError("No se pudo cargar la información de las EPS. Intente más tarde.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchEpsData();
  }, [fetchEpsData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setSelectedEPS(null);
      }
    }
    if (selectedEPS) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedEPS]);



  return (
    <div className="min-h-screen bg-sky-900 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl mb-6 relative">
        <input
          type="text"
          placeholder="Buscar EPS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-lg bg-white shadow-lg border border-gray-300 text-gray-900 pl-10"
        />
        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <div className="text-gray-700">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {epsList.length > 0 ? (
            epsList.map((eps) => (
              <button 
                key={eps.id_eps} 
                className="p-5 bg-white shadow-lg rounded-lg flex flex-col items-center cursor-pointer" 
                onClick={() => setSelectedEPS(eps)}
              >
                <h3 className="text-lg font-semibold text-gray-800">{eps.nombre}</h3>
              </button>
            ))
          ) : (
            <div className="text-gray-500">No hay EPS disponibles</div>
          )}
        </div>
      )}

      {selectedEPS && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center p-4">
          <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900">Tarifarios de {selectedEPS.nombre}</h2>
            <ul className="mt-4 list-disc list-inside">
              {selectedEPS.tarifarios.length > 0 ? (
                selectedEPS.tarifarios.map((tarifario) => (
                  <li key={tarifario.id_tarifario} className="text-blue-600 hover:underline">
                    <Link to={`/tarifarios/${tarifario.id_tarifario}/productos`}>{tarifario.nombre}</Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">Sin tarifarios asociados</li>
              )}
            </ul>
            <button onClick={() => setSelectedEPS(null)} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EPSPage;
