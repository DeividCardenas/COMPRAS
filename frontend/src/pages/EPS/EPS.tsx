import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Building2, Loader2 } from "lucide-react";
import { EPS, fetchEPS } from "../../services/EPS/epsService";

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
      const uniqueEPS = fetchedEps.eps?.filter((eps, index, self) => eps.id_eps && index === self.findIndex((e) => e.id_eps === eps.id_eps)) || [];
      setEpsList(uniqueEPS);
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
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-2xl mb-6 relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar EPS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 pl-12 rounded-lg bg-white shadow-xl border border-gray-300 text-gray-900 focus:ring-2 focus:ring-sky-500"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
              <X />
            </button>
          )}
        </div>
      </motion.div>

      {/* Mensaje de error */}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <Loader2 className="animate-spin text-white" size={32} />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {epsList.length > 0 ? (
            epsList.map((eps) =>
              eps.id_eps ? (
                <motion.button
                  key={eps.id_eps}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-5 bg-white shadow-xl rounded-lg flex flex-col items-center cursor-pointer transition-transform"
                  onClick={() => setSelectedEPS(eps)}
                >
                  <Building2 size={40} className="text-indigo-900 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800">{eps.nombre}</h3>
                </motion.button>
              ) : null
            )
          ) : (
            <div className="text-gray-500">No hay EPS disponibles</div>
          )}
        </motion.div>
      )}

      {/* Modal de tarifarios */}
      <AnimatePresence>
        {selectedEPS && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-sky-900 p-6 rounded-3xl shadow-2xl max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-white">Tarifarios de {selectedEPS.nombre}</h2>
              <ul className="mt-4 space-y-4">
                {selectedEPS.tarifarios.length > 0 ? (
                  selectedEPS.tarifarios.map((tarifario) =>
                    tarifario.id_tarifario ? (
                      <li
                        key={tarifario.id_tarifario}
                        className="bg-sky-800 p-4 rounded-lg hover:bg-sky-700 transition cursor-pointer"
                      >
                        <Link to={`/tarifario/${tarifario.id_tarifario}`} className="block">
                          <h3 className="text-xl font-semibold text-white mb-1">
                            {tarifario.nombre}
                          </h3>
                        </Link>
                      </li>
                    ) : null
                  )
                ) : (
                  <li className="text-gray-300">Sin tarifarios asociados</li>
                )}
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedEPS(null)}
                className="mt-6 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Cerrar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EPSPage;
