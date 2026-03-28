import { useLocation } from "react-router-dom";

const PageAsignarEvaluacion = () => {
  const location = useLocation();
  const usuario = location.state?.value;

  return (
    <label className="flex flex-col gap-2 mb-4 text-4xl">
      <span className="font-normal">pagina ASIGNAR EVALUACION...</span>
      <p className="text-2xl">Este es el usuario: {usuario}</p>
    </label>
  );
};

export default PageAsignarEvaluacion;
