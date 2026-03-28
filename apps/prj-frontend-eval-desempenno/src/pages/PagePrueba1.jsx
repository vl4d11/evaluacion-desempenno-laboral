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

  return (
    <>
      <label className="flex flex-col gap-2 mb-4 text-4xl">
        <span className="font-normal">pagina de COMPETENCIAS...</span>
        <p className="text-2xl">Este es el usuario: {usuario}</p>
      </label>

      <Card title="Usuarios activos" className="w-[100%]">
        <Input
          ref={inputRef}
          label="Ingrese un Nombre:"
          className="col-span-24 md:col-span-16"
          labelPosition={1}
        />
        <Input
          ref={inputRef}
          label="Dato ingreso:"
          className="col-span-24 md:col-span-8"
          // labelPosition={1}
        />
      </Card>

      <Card title="Usuarios activos" layout="flex" className="w-[60%]" >
        <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={verValor}>getValue</button>
        <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={cambiarValor}>setValue</button>
        <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={resetBase}>resetBase</button>
        <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={verSiModifico}>isModified</button>
        <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={enfocar}>focus</button>
      </Card>

      <Card  layout="flex-between" className="w-[60%]" >
        <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={verValor}>getValue</button>
        <button className="px-4 py-2 rounded-md shadow-sm bg-gray-300 text-gray-600  cursor-not-allowed opacity-50" onClick={verValor}>getValue</button>
      </Card>
    </>

  );
};

export default PageCompetencias;
