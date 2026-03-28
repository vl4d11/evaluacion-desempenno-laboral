import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useSessionGuard = () => {
  const navigate = useNavigate();
  //validar sesión al entrar
  useEffect(() => {
    const auth = sessionStorage.getItem("auth");
    if (!auth) {
      //vuelve al login (ruta index del basename)
      navigate("/", { replace: true });
    }
  }, [navigate]);
  //limpiar sesión al refrescar o cerrar pestaña
  useEffect(() => {
    const cleanup = () => {
      sessionStorage.removeItem("auth");
    };
    window.addEventListener("beforeunload", cleanup);
    return () => {
      cleanup();
      window.removeEventListener("beforeunload", cleanup);
    };
  }, []);
};
