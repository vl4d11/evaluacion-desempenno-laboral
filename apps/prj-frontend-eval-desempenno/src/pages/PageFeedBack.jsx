import { useLocation } from "react-router-dom";

const PageFeedBack = () => {
  const location = useLocation();
  const usuario = location.state?.value;

  return (
    <label className="flex flex-col gap-2 mb-4 text-4xl">
      <span className="font-normal">pagina de FEEDBACK...</span>
      <p className="text-2xl">Este es el usuario: {usuario}</p>
    </label>
  );
};

export default PageFeedBack;
