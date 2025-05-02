import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, FlaskConical, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Empresa, fetchEmpresas } from "../../services/Empresa/empresasService";
import { fetchLaboratories, Laboratorio } from "../../services/Laboratorio/laboratoriosService";

const EmpresasPage = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [search] = useState("");
  const [currentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [detailSearch, setDetailSearch] = useState("");
  const [labPage, setLabPage] = useState(1);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const itemsPerPage = 9;

  const fetchEmpresasData = useCallback(async (filters: { page: number; limit: number; nombre?: string }) => {
    setLoading(true);
    try {
      const fetchedEmpresas = await fetchEmpresas(filters);
      setEmpresas(fetchedEmpresas.data);
    } catch (error) {
      console.error("Error al obtener empresas:", error);
      setEmpresas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmpresasData({ page: currentPage, limit: itemsPerPage, nombre: search || undefined });
  }, [search, currentPage, fetchEmpresasData]);

  const fetchLaboratoriosData = async (empresaId: number, page: number, searchQuery: string) => {
    try {
      const fetchedLaboratorios = await fetchLaboratories(page, itemsPerPage, searchQuery, empresaId);
      setLaboratorios(fetchedLaboratorios.data);
      setTotalPages(fetchedLaboratorios.totalPages);
    } catch (error) {
      console.error("Error al obtener laboratorios:", error);
    }
  };

  const handleSelectLaboratorios = async (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setActiveModal("laboratorios");
    setLabPage(1);
    fetchLaboratoriosData(empresa.id_empresa, 1, "");
  };

    const handleSelectTarifarios = (empresa: Empresa) => {
      setSelectedEmpresa(empresa);
      setActiveModal('tarifarios');
      setLabPage(1);
    };

  useEffect(() => {
    if (selectedEmpresa) {
      fetchLaboratoriosData(selectedEmpresa.id_empresa, labPage, detailSearch);
    }
  }, [labPage, detailSearch, selectedEmpresa]);

  return (
    <div className="relative p-6 bg-sky-900 min-h-screen flex flex-col">
      <motion.h1
        className="text-3xl font-bold text-white mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Gestión de Empresas
      </motion.h1>

      {loading ? (
        <div className="text-center text-white">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {empresas.length > 0 ? (
              empresas.map((empresa) => (
                <motion.div
                  key={empresa.id_empresa}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white p-4 rounded-2xl shadow-xl"
                >
                  <h2 className="text-xl font-bold text-indigo-900 text-center mb-2">{empresa.nombre}</h2>
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => handleSelectLaboratorios(empresa)}
                      className="bg-indigo-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg shadow"
                    >
                      Ver Laboratorios
                    </button>
                    <button
                      onClick={() => handleSelectTarifarios(empresa)}
                      className="bg-green-600 hover:bg-green-800 text-white px-4 py-2 rounded-lg shadow"
                    >
                      Ver Tarifarios
                    </button>

                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-4 text-white">
                No hay empresas disponibles
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selectedEmpresa && activeModal === "laboratorios" && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={() => setSelectedEmpresa(null)}
          >
            <motion.div
              className="bg-sky-900 p-6 shadow-lg rounded-2xl max-w-4xl w-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Laboratorios de {selectedEmpresa.nombre}</h2>
                <button onClick={() => setSelectedEmpresa(null)} className="text-gray-500 hover:text-gray-800">
                  <X size={24} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Buscar laboratorios..."
                value={detailSearch}
                onChange={(e) => setDetailSearch(e.target.value)}
                className="bg-zinc-100 p-2 rounded-lg w-full mb-4"
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={labPage}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {laboratorios.map((lab, index) => (
                    <motion.div
                      key={lab.id_laboratorio}
                      layout
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.5 }}
                      transition={{ duration: 0.2, ease: "easeOut", delay: index * 0.01 }}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to={`/laboratorio/${lab.id_laboratorio}`}>
                        <motion.div className="bg-white p-6 rounded-xl shadow-xl hover:shadow-2xl transform transition-all cursor-pointer">
                          <FlaskConical className="text-indigo-900" size={32} />
                          <h4 className="text-gray-900 font-semibold text-lg">{lab.nombre}</h4>
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-center items-center mt-6 gap-4">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: labPage > 1 ? 1.1 : 1 }}
                  onClick={() => setLabPage((prev) => Math.max(prev - 1, 1))}
                  disabled={labPage === 1}
                  className={`p-2 rounded-full transition-all ${labPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-white hover:bg-gray-700"
                    }`}
                >
                  <ChevronLeft size={28} />
                </motion.button>

                <motion.span
                  key={labPage}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="text-lg font-semibold text-white"
                >
                  Página {labPage} de {totalPages}
                </motion.span>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: labPage < totalPages ? 1.1 : 1 }}
                  onClick={() => setLabPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={labPage === totalPages}
                  className={`p-2 rounded-full transition-all ${labPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-white hover:bg-gray-700"
                    }`}
                >
                  <ChevronRight size={28} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* This is the same as the previous AnimatePresence, but for the tarifarios modal */}
      <AnimatePresence>
        {selectedEmpresa && activeModal === 'tarifarios' && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              className="bg-sky-900 p-8 shadow-2xl rounded-3xl max-w-6xl w-full relative"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">
                  Tarifarios de {selectedEmpresa.nombre}
                </h2>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-300 hover:text-gray-100 transition"
                >
                  <X size={28} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {selectedEmpresa.tarifarios.map((tarifa, index) => (
                  <motion.div
                    key={tarifa.id_tarifario}
                    className="bg-sky-700 p-4 rounded-xl shadow-md cursor-pointer hover:shadow-lg hover:bg-sky-600"
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.05 }}
                    onClick={() => navigate(`/tarifario/${tarifa.id_tarifario}`)}
                  >
                    <h4 className="text-xl font-semibold text-white mb-2">
                      {tarifa.nombre}
                    </h4>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      
    </div>
  );
};

export default EmpresasPage;
