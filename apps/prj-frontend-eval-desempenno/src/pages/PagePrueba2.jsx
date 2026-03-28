import { useLocation } from "react-router-dom";
import Card from "../components/Card"
import Input from "../components/Input"
import { useRef } from "react";

const PageCompetencias = () => {
  const location = useLocation();
  const usuario = location.state?.value;
  const inputRef = useRef(null);

  const verValor = () => {
    console.log(inputRef.current.getValue());
  };
  const cambiarValor = () => {
    inputRef.current.setValue("Juan");
  };
  const resetBase = () => {
    inputRef.current.resetBase();
  };
  const verSiModifico = () => {
    console.log(inputRef.current.isModified());
  };
  const enfocar = () => {
    inputRef.current.focus();
  };

  const cards = [1,2,3,4,5];

  return (
    <>
      <label className="flex flex-col gap-2 mb-4 text-4xl">
        <span className="font-normal">pagina de COMPETENCIAS...</span>
        <p className="text-2xl">Este es el usuario: {usuario}</p>
      </label>

      {cards.map((num) => (
        <Card
          key={num}
          title={`Usuarios activos nro: ${num}`}
          layout="flex"
          className="w-[60%]"
        >
          <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={verValor}>getValue</button>
          <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={cambiarValor}>setValue</button>
          <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={resetBase}>resetBase</button>
          <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={verSiModifico}>isModified</button>
          <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={enfocar}>focus</button>
        </Card>
      ))}
    </>

  );
};

export default PageCompetencias;
