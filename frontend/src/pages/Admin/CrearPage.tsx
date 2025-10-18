import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { addEps, addLaboratorio, addEmpresa, fetchEmpresas, fetchLaboratorios, associateEmpresaLaboratorio, addProducto } from "../../services/Admin/admin.Service";
import { createProveedor } from "../../services/Proveedores/proveedoresService";

const CrearPage: React.FC = () => {
  // Estados para los formularios
  const [epsNombre, setEpsNombre] = useState("");
  const [labNombre, setLabNombre] = useState("");
  const [empresaNombre, setEmpresaNombre] = useState("");
  const [serverErrors, setServerErrors] = useState<string[] | null>(null);
  const [loadingCreate, setLoadingCreate] = useState(false);

  // listas para selects
  const [empresasList, setEmpresasList] = useState<any[]>([]);
  const [laboratoriosList, setLaboratoriosList] = useState<any[]>([]);
  const [selectedLaboratoriosForEmpresa, setSelectedLaboratoriosForEmpresa] = useState<number[]>([]);
  const [selectedEmpresasForLab, setSelectedEmpresasForLab] = useState<number[]>([]);
  const navigate = useNavigate();

  // Handlers para crear EPS
  const handleCrearEps = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerErrors(null);
    try {
      setLoadingCreate(true);
      await addEps({ nombre: epsNombre });
      toast.success('EPS creada exitosamente.');
      setEpsNombre("");
    } catch (err: any) {
      const msg = err?.message || 'Error del servidor al crear EPS';
      toast.error(msg);
      setServerErrors([msg]);
    } finally {
      setLoadingCreate(false);
    }
  };

  useEffect(() => {
    // cargar empresas y laboratorios para selects
    (async () => {
      try {
        const empresasResp = await fetchEmpresas({ page: 1, limit: 100 });
        const empresasArr = Array.isArray((empresasResp as any).data) ? (empresasResp as any).data : [];
        setEmpresasList(empresasArr);
      } catch (err) {
        console.warn('No se pudieron cargar empresas para el formulario', err);
      }

      try {
        const labsResp = await fetchLaboratorios({ page: 1, limit: 200 });
        const labsArr = Array.isArray((labsResp as any).data) ? (labsResp as any).data : [];
        setLaboratoriosList(labsArr);
      } catch (err) {
        console.warn('No se pudieron cargar laboratorios para el formulario', err);
      }
    })();
  }, []);

  // Handlers para crear Laboratorio
  const handleCrearLab = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerErrors(null);
    try {
      setLoadingCreate(true);
      const created = await addLaboratorio({ nombre: labNombre });
      toast.success('Laboratorio creado exitosamente.');
      setLabNombre("");

      // Si hay empresas seleccionadas, asociar este laboratorio a ellas
      if (selectedEmpresasForLab.length > 0 && created?.id_laboratorio) {
        try {
          // associateEmpresaLaboratorio expects id_empresa and array of id_laboratorio
          for (const empId of selectedEmpresasForLab) {
            await associateEmpresaLaboratorio(empId, [created.id_laboratorio]);
          }
          toast.success('Asociación con empresas creada.');
          setSelectedEmpresasForLab([]);
        } catch (assocErr: any) {
          const msg = (assocErr && assocErr.message) || 'No se pudo asociar empresas al laboratorio';
          toast.error(msg);
          setServerErrors([msg]);
        }
      }
    } catch (err: any) {
      const msg = err?.message || 'Error del servidor al crear laboratorio';
      toast.error(msg);
      setServerErrors([msg]);
    } finally {
      setLoadingCreate(false);
    }
  };

  // Handlers para crear Empresa
  const handleCrearEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerErrors(null);
    try {
      setLoadingCreate(true);
      const created = await addEmpresa({ nombre: empresaNombre });
      toast.success('Empresa creada exitosamente.');
      setEmpresaNombre("");

      // Si hay laboratorios seleccionados, asociarlos
      if (selectedLaboratoriosForEmpresa.length > 0 && created?.id_empresa) {
        try {
          await associateEmpresaLaboratorio(created.id_empresa, selectedLaboratoriosForEmpresa);
          toast.success('Asociación con laboratorios creada.');
          setSelectedLaboratoriosForEmpresa([]);
        } catch (assocErr: any) {
          const msg = (assocErr && assocErr.message) || 'No se pudo asociar laboratorios a la empresa';
          toast.error(msg);
          setServerErrors([msg]);
        }
      }
    } catch (err: any) {
      const msg = err?.message || 'Error del servidor al crear empresa';
      toast.error(msg);
      setServerErrors([msg]);
    } finally {
      setLoadingCreate(false);
    }
  };

  // Estados para crear producto
  const [cum, setCum] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [concentracion, setConcentracion] = useState("");
  const [presentacion, setPresentacion] = useState("");
  const [registroSanitario, setRegistroSanitario] = useState("");
  const [idLaboratorioProducto, setIdLaboratorioProducto] = useState<number | "">("");
  const [precioUnidad, setPrecioUnidad] = useState<number | "">("");
  const [precioPresentacion, setPrecioPresentacion] = useState<number | "">("");
  const [ivaProducto, setIvaProducto] = useState<number | "">("");
  const [regulacionProducto, setRegulacionProducto] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  // Estados para crear proveedor
  const [provLaboratorio, setProvLaboratorio] = useState("");
  const [provTipo, setProvTipo] = useState("");
  const [provTitular, setProvTitular] = useState("");
  const [provDireccion, setProvDireccion] = useState("");
  const [provTelefono, setProvTelefono] = useState("");
  const [provEmail, setProvEmail] = useState("");

  const handleCrearProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerErrors(null);
    try {
      setLoadingCreate(true);
      const payload = {
        cum,
        descripcion,
        concentracion,
        presentacion,
        registro_sanitario: registroSanitario,
        id_laboratorio: Number(idLaboratorioProducto),
        precio_unidad: Number(precioUnidad),
        precio_presentacion: Number(precioPresentacion),
        iva: Number(ivaProducto),
        regulacion: regulacionProducto || null,
        codigo_barras: codigoBarras,
      };
  await addProducto(payload);
      toast.success('Producto creado correctamente');
      // reset product form
      setCum(''); setDescripcion(''); setConcentracion(''); setPresentacion(''); setRegistroSanitario(''); setIdLaboratorioProducto(''); setPrecioUnidad(''); setPrecioPresentacion(''); setIvaProducto(''); setRegulacionProducto(''); setCodigoBarras('');
    } catch (err: any) {
      const msg = err?.message || 'Error al crear producto';
      toast.error(msg);
      setServerErrors([msg]);
    } finally {
      setLoadingCreate(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-center text-indigo-900 mb-6">
          Crear Entidades
        </h1>
        <div className="flex justify-center mb-6">
          <button
            onClick={() => navigate("/Admin")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
          >
            Volver atrás
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column: EPS, Laboratorio, Empresa stacked */}
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-lg">
              <h2 className="text-xl font-semibold mb-2 text-green-700">Crear EPS</h2>
              <form onSubmit={handleCrearEps} className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Nombre de la EPS"
                  value={epsNombre}
                  onChange={(e) => setEpsNombre(e.target.value)}
                  required
                  className="border border-gray-300 rounded-md p-2"
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2 transition"
                  disabled={loadingCreate}
                >
                  {loadingCreate ? 'Creando...' : 'Crear EPS'}
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-lg">
              <h2 className="text-xl font-semibold mb-2 text-rose-600">Crear Proveedor</h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setServerErrors(null);
                try {
                  setLoadingCreate(true);
                  const payload = {
                    laboratorio: provLaboratorio,
                    tipo: provTipo,
                    titular: provTitular,
                    direccion: provDireccion,
                    telefono: provTelefono,
                    email: provEmail,
                  };
                  await createProveedor(payload);
                  toast.success('Proveedor creado correctamente');
                  // reset fields
                  setProvLaboratorio(''); setProvTipo(''); setProvTitular(''); setProvDireccion(''); setProvTelefono(''); setProvEmail('');
                } catch (err: any) {
                  const msg = err?.message || 'Error al crear proveedor';
                  toast.error(msg);
                  setServerErrors([msg]);
                } finally {
                  setLoadingCreate(false);
                }
              }} className="flex flex-col gap-2">
                <input type="text" placeholder="Laboratorio" value={provLaboratorio} onChange={(e) => setProvLaboratorio(e.target.value)} required className="border p-2 rounded" />
                <input type="text" placeholder="Tipo" value={provTipo} onChange={(e) => setProvTipo(e.target.value)} required className="border p-2 rounded" />
                <input type="text" placeholder="Titular" value={provTitular} onChange={(e) => setProvTitular(e.target.value)} required className="border p-2 rounded" />
                <input type="text" placeholder="Dirección (opcional)" value={provDireccion} onChange={(e) => setProvDireccion(e.target.value)} className="border p-2 rounded" />
                <input type="text" placeholder="Teléfono (opcional)" value={provTelefono} onChange={(e) => setProvTelefono(e.target.value)} className="border p-2 rounded" />
                <input type="email" placeholder="Email (opcional)" value={provEmail} onChange={(e) => setProvEmail(e.target.value)} className="border p-2 rounded" />
                <div className="flex justify-end">
                  <button type="submit" disabled={loadingCreate} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded">{loadingCreate ? 'Creando...' : 'Crear Proveedor'}</button>
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-lg">
              <h2 className="text-xl font-semibold mb-2 text-yellow-700">Crear Laboratorio</h2>
              <form onSubmit={handleCrearLab} className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Nombre del Laboratorio"
                  value={labNombre}
                  onChange={(e) => setLabNombre(e.target.value)}
                  required
                  className="border border-gray-300 rounded-md p-2"
                />
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Asociar con empresas (opcional)</label>
                  <select multiple value={selectedEmpresasForLab.map(String)} onChange={(e) => {
                    const options = Array.from(e.target.selectedOptions).map(o => Number(o.value));
                    setSelectedEmpresasForLab(options);
                  }} className="border p-2 rounded h-36">
                    {empresasList.map(emp => (
                      <option key={emp.id_empresa} value={emp.id_empresa}>{emp.nombre}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-md px-4 py-2 transition"
                  disabled={loadingCreate}
                >
                  {loadingCreate ? 'Creando...' : 'Crear Laboratorio'}
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-lg">
              <h2 className="text-xl font-semibold mb-2 text-purple-700">Crear Empresa</h2>
              <form onSubmit={handleCrearEmpresa} className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Nombre de la Empresa"
                  value={empresaNombre}
                  onChange={(e) => setEmpresaNombre(e.target.value)}
                  required
                  className="border border-gray-300 rounded-md p-2"
                />
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Asociar laboratorios (opcional)</label>
                  <select multiple value={selectedLaboratoriosForEmpresa.map(String)} onChange={(e) => {
                    const options = Array.from(e.target.selectedOptions).map(o => Number(o.value));
                    setSelectedLaboratoriosForEmpresa(options);
                  }} className="border p-2 rounded h-36">
                    {laboratoriosList.map((lab) => (
                      <option key={lab.id_laboratorio} value={lab.id_laboratorio}>{lab.nombre}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-md px-4 py-2 transition"
                  disabled={loadingCreate}
                >
                  {loadingCreate ? 'Creando...' : 'Crear Empresa'}
                </button>
              </form>
            </div>
          </div>

          {/* Right column: Producto (and messages/errors) */}
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-lg">
              <h2 className="text-xl font-semibold mb-2 text-indigo-700">Crear Producto</h2>
              <form onSubmit={handleCrearProducto} className="grid grid-cols-1 gap-3">
                <input type="text" placeholder="CUM" value={cum} onChange={(e) => setCum(e.target.value)} required className="border p-2 rounded" />
                <input type="text" placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required className="border p-2 rounded" />
                <input type="text" placeholder="Concentración" value={concentracion} onChange={(e) => setConcentracion(e.target.value)} required className="border p-2 rounded" />
                <input type="text" placeholder="Presentación" value={presentacion} onChange={(e) => setPresentacion(e.target.value)} required className="border p-2 rounded" />
                <input type="text" placeholder="Registro sanitario" value={registroSanitario} onChange={(e) => setRegistroSanitario(e.target.value)} required className="border p-2 rounded" />
                <select value={String(idLaboratorioProducto)} onChange={(e) => setIdLaboratorioProducto(e.target.value ? Number(e.target.value) : "")} required className="border p-2 rounded">
                  <option value="">Seleccione Laboratorio</option>
                  {laboratoriosList.map((lab) => (
                    <option key={lab.id_laboratorio} value={lab.id_laboratorio}>{lab.nombre}</option>
                  ))}
                </select>
                <input type="number" placeholder="Precio unidad" value={precioUnidad as any} onChange={(e) => setPrecioUnidad(e.target.value ? Number(e.target.value) : "")} required className="border p-2 rounded" />
                <input type="number" placeholder="Precio presentación" value={precioPresentacion as any} onChange={(e) => setPrecioPresentacion(e.target.value ? Number(e.target.value) : "")} required className="border p-2 rounded" />
                <input type="number" placeholder="IVA" value={ivaProducto as any} onChange={(e) => setIvaProducto(e.target.value ? Number(e.target.value) : "")} required className="border p-2 rounded" />
                <input type="text" placeholder="Regulación (opcional)" value={regulacionProducto} onChange={(e) => setRegulacionProducto(e.target.value)} className="border p-2 rounded" />
                <input type="text" placeholder="Código de barras" value={codigoBarras} onChange={(e) => setCodigoBarras(e.target.value)} required className="border p-2 rounded" />
                <div className="flex justify-end">
                  <button type="submit" disabled={loadingCreate} className="bg-indigo-600 text-white px-4 py-2 rounded">
                    {loadingCreate ? 'Creando...' : 'Crear Producto'}
                  </button>
                </div>
              </form>

              {/* mensajes mostrados vía toast */}

              {serverErrors && serverErrors.length > 0 && (
                <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                  <ul className="list-disc pl-6">
                    {serverErrors.map((err, idx) => <li key={idx}>{err}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearPage;
