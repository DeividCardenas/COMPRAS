import axios from 'axios';

type CompareOptions = {
  tarifarioIds?: number[];
  epsIds?: number[];
  empresaIds?: number[];
  cum?: string;
};

export const fetchCompareByProducto = async (productoId: number, options?: CompareOptions) => {
  try {
    const params: Record<string, string> = {};
    if (options?.tarifarioIds && options.tarifarioIds.length > 0) params.tarifarioIds = options.tarifarioIds.join(',');
    if (options?.epsIds && options.epsIds.length > 0) params.epsIds = options.epsIds.join(',');
    if (options?.empresaIds && options.empresaIds.length > 0) params.empresaIds = options.empresaIds.join(',');
    if (options?.cum) params.cum = String(options.cum);

    const baseURL = import.meta.env.VITE_API_URL;
    if (!baseURL) throw new Error('VITE_API_URL no está definido');

    const url = `${baseURL}/compare/producto/${productoId}`;
    const resp = await axios.get(url, { params });
    return resp.data;
  } catch (error) {
    throw error;
  }
};
