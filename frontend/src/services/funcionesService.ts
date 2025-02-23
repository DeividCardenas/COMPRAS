import axiosInstance from "./axiosInstance";

export const downloadReporte = async (): Promise<void> => {
  try {
    const response = await axiosInstance.get("generar-reporte", {
      responseType: "blob", // Asegurar formato binario
    });

    // Verificar cabecera Content-Disposition
    let fileName = "reporte_productos.xlsx";
    const contentDisposition = response.headers["content-disposition"];
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match?.[1]) {
        fileName = match[1];
      }
    }

    // Crear URL para el blob
    const blob = new Blob([response.data], { type: response.headers["content-type"] });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();

    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al descargar el reporte:", error);
    throw new Error("No se pudo descargar el reporte");
  }
};
