/*eslint-disable*/
import { createContext, useContext, useState } from "react";

const DataContext = createContext();

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export const DataProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const login = async (usuario, clave) => {
    try {
      const formData = new FormData();
      formData.append("data1", usuario);
      formData.append("data2", clave);

      // console.log("Usuario enviado:", usuario);
      // console.log("Clave enviada:", clave);

      const response = await fetch(`${API_BASE}/llamada/fetch/acceso`, {
        method: "POST",
        body: formData,
      });

      // console.log("Response status:", response.status);

      if (!response.ok) {
        setError(`Error HTTP: ${response.status}`);
        setData([]);
        return { ok: false, error: `Error HTTP: ${response.status}` };
      }

      const textData = await response.text();

      // console.log("Respuesta del servidor:", textData);

      if (textData === "warning") {
        setError("Usuario o clave incorrecto");
        setData([]);
        return { ok: false, error: "Usuario o clave incorrecto" };
      }
      if (textData.toLowerCase().startsWith("error")) {
        setError("Servidor fuera de linea");
        setData([]);
        return { ok: false, error: "Servidor fuera de linea" };
      }

      const rows = textData.trim().split("~");
      setError(null);
      setData(rows);
      return { ok: true, data: rows };
    } catch (err) {
      console.error("Error en DataProvider:", err);
      setError("Error en el provider");
      return { ok: false, error: "Error en el provider" };
    }
  };

  return (
    <DataContext.Provider value={{ data, error, login }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
