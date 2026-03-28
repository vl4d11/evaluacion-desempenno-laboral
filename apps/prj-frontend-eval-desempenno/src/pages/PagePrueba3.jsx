import { useLocation } from "react-router-dom";
import Card from "../components/Card"
import Input from "../components/Input"
import TextArea from "../components/TextArea";
import Select from "../components/Select";
import Checkbox from "../components/Checkbox";
import { useState, useEffect, useRef } from "react";

const PageCompetencias = () => {
  const location = useLocation();
  const usuario = location.state?.value;
  const inputRef = useRef([]);
  const descripcionRef = useRef(null)
  const selectRef = useRef(null)
  const chkRef = useRef(null);
  const cardRef = useRef(null);
  const [cambiaTitle, setCambiaTitle] = useState(false)

  const inputs = [0, 1, 2, 3, 4, 5, 6];
  const lista = ["1|maria", "2|juana", "3|Milagros"];


  const verValor = () => {
    console.log(selectRef.current?.getValue());
    console.log(inputRef.current[2]?.getValue());
  };
  const setTrueSelect = () => {
    selectRef.current?.setError(true);
    inputRef.current[3]?.setError(true);
  }
  const setFalseSelect = () => {
    selectRef.current?.setError(false);
    inputRef.current[3]?.setError(false);
  }
  const cambiarValor = () => {
    inputRef.current.forEach(input =>input?.setValue("Juan"));
  };
  const resetBase = () => {
    inputRef.current[0]?.resetBase();
    console.log("")
  };
  const verSiModifico = () => {
    console.log(inputRef.current[0]?.isEqualBase());
  };
  const verCampo = () => {
    console.log("Ver Campo:", inputRef.current[1]?.getCampo());
    console.log("Ver Requerido:", inputRef.current[1]?.getRequired());
  };
  const enfocar = () => {
    inputRef.current[3]?.focus();
  };

  const verValores = () => {
    console.log("valor 3:", inputRef.current[3]?.getValue());
  };

  const cambiarTituloCard = () => {
    inputRef.current[0]?.setEnabled(true)
    inputRef.current[3].setHidden(false);
    if (cambiaTitle) {
      cardRef.current.setTitle("nueva TITULO HOY");
      setCambiaTitle(false)
    } else {
      cardRef.current.setTitle("TITILEO DE TITLE..");
      setCambiaTitle(true)
    }

  }

  useEffect(() => {
    verValores();
  }, []);

  const labels = {
    3: "Ingrese un Apellido PRONTO:",
  };

  return (
    <>
      <label className="flex flex-col gap-2 mb-4 text-4xl">
        <span className="font-normal">pagina de COMPETENCIAS...</span>
        <p className="text-2xl">Este es el usuario: {usuario}</p>
      </label>

      <Card title="Usuarios activos" className="w-[100%]">
        {inputs.map(index => (
          <Input
            key={index}
            span={6}
            type={"1"}
            ref={el => (inputRef.current[index] = el)}
            label={labels[index] ?? "Ingrese un Nombre:"}
            valorInicial={{ valor: "dato inicio", campo: "12.34", tipo_dato: "0", max: "5", required: "1", error: false }}
            labelPosition={0}
            hidden={index === 3 ? true: false}
            // enabled={false}
          />
        ))}

        <Select
          label="Elige una persona"
          ref={selectRef}
          lista={lista}
          value="2"
          valorInicial={{valor: "dato inicio", campo: "12.34",seleccion: "1",error: true }}
          span={12}
          labelPosition={0}
        />

      </Card>

      <Card ref={cardRef} title="Datos del Text Area" layout="flow" className="w-[60%]">
        <TextArea
          label="Descripción"
          value="texto inicial"
          width="50%"
          valorInicial={{max:"10", error: true}}
          ref={descripcionRef}
          labelPosition={0}
        />

        <Checkbox
          ref={chkRef}
          label="COMPETENCIAS :"
          label2="COMPORTAMIENTOS :"
          value={true}
          valorInicial={{ valor: true, campo: "2.43" }}
          onChange={(v) => console.log(v)}
          labelPosition={1}

        />
      </Card>

      <Card title="Usuarios activos" layout="flex" className="w-[60%]" >

        <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={verValor}>getValue</button>
        <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={cambiarValor}>cambiar valor</button>
        <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={resetBase}>resetBase</button>
        <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={verSiModifico}>True/False inicial</button>
        <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={verCampo}>Ver campo</button>
        <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={enfocar}>focus</button>
        <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={setTrueSelect}>Select error TRUE</button>
        <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={setFalseSelect}>Select error FALSE</button>
        <button className="px-4 py-2 rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer" onClick={cambiarTituloCard}>CAMBIA TITLE</button>

      </Card>

    </>

  );
};

export default PageCompetencias;
