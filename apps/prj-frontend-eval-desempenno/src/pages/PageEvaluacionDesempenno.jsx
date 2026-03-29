import { useState, useRef, useEffect, useMemo } from "react"
import { useLocation } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { BaseTablaMatrizLikert } from "../components/BaseTablaMatrizLikert";
import Card from "../components/Card"
import Select from "../components/Select";
import { AlertDialog } from "../components/AlertDialog";
import EncuestaLikert from "../components/EncuestaLikert";
import useIsMobile from "../hooks/useIsMobile";

const PageEvaluacionDesempenno = () => {
  const API_RESULT_LISTAR = "/llamada/fetch/listalikert";
  const location = useLocation();
  const usuario = location.state?.value;
  const tablaRef = useRef(null);
  const cardRef = useRef(null);
  const selectRef = useRef(null);
  const { data, loading, error } = useFetch(API_RESULT_LISTAR);
  const [isLoading, setIsLoading] = useState(false);
  const [showObsModal, setShowObsModal] = useState(false);
  const [obsData, setObsData] = useState(null);
  const [alertState, setAlertState] = useState({
    visible: false,
    message: "",
  });

  // const preData = typeof data?.[0] === "string" ? data?.[0]?.split("~") : [];
  // const infoMeta = preData?.[0]?.split("|") ?? [];
  // const info = preData?.[1]?.split("|") ?? [];

  // const informacion = (infoMeta ?? []).map((meta, idx) => ({
  //   data: (info ?? [])[idx] ?? "",
  //   metadata: (meta ?? "").split("*"),
  // }));

  const listasData = useMemo(() => {
    return (data ?? []).slice(1);
  }, [data]);

  const mapaListas = useMemo(() => {
    if (!listasData?.length) return {};
    return listasData.reduce((acc, entry) => {
      const [itemKey, ...opciones] = entry.split("~");
      acc[itemKey] = opciones;
      return acc;
    }, {});
  }, [listasData]);

  const configTable = useMemo(() => {
    if (!mapaListas?.[41]) return;
    return ({
      title: "Lista de Comportamientos para el examen a rendir",
      isPaginar: true,
      listaDatos: mapaListas[41],
      offsetColumnas: 1,
    });
  }, [mapaListas]);

  const preguntas = useMemo(() => {
    return mapaListas?.[41]?.slice(2) ?? [];
  }, [mapaListas]);

  const isMobile = useIsMobile(768);

  const handleFilaSeleccionada = (fila) => {
    console.log("fila:")
  }

  const handleObservacion = (data) => {
      setObsData(data);
      setShowObsModal(true);

      console.log("data", data)
  }

  const handleGrabar = () => {
    setAlertState({
      visible: true,
      message: "Datos modificados...",
    });
  }

  if (loading) {
    return <div>Cargando datos...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (!data) {
    return <div>No hay datos disponibles</div>;
  }

  return (
    <>
      <Card ref={cardRef} title="" layout="flex" className="w-full md:w-[60%]">
        <label className="flex flex-col gap-2 mb-4 text-4xl">
          <span className="font-normal">Evaluacion de Desempeño de...</span>
        </label>
        <Select
          label="Seleccione un colaborador:"
          ref={selectRef}
          lista={mapaListas?.[17]}
          value="2"
          valorInicial={{valor: "dato inicio", campo: "12.34",seleccion: "1" }}
          span={12}
          labelPosition={0}
        />
      </Card>

      {isMobile ? (
        preguntas.length ? (
          preguntas.map((item, idx) => {
            const partes = item.split("|");
            const pks = partes[0] ?? idx;
            const texto = partes[1] ?? "";
            return (
              <EncuestaLikert
                key={pks}
                nro={idx + 1}
                label={texto}
                pks={pks}
                lista={mapaListas?.[35]}
                onObservacion={handleObservacion}
              />
            )
          })
        ):null
      ):(
        configTable?.listaDatos?.length ? (
          <BaseTablaMatrizLikert
            ref={tablaRef}
            configTable={configTable}
            isEditing={false}
            rowsPerPage={10}
            showRowNumber={true}
            opcionesRadio={mapaListas?.[35]}
            onSelect={handleFilaSeleccionada}
            onObsClick={handleObservacion}
          />
        ): null
      )}

      <Card ref={cardRef} title="" layout="flex" className="w-full md:w-[40%] mt-4">
        <button
          disabled={isLoading}
          className={`px-8 py-2 rounded-md shadow-sm text-white
            ${isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-500 hover:bg-indigo-600 cursor-pointer"
            }`}
          onClick={handleGrabar}
        >
          {isLoading ? "Guardando..." : "Grabar"}
        </button>
        <button className="px-8 py-2 rounded-md shadow-sm bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer"
          onClick={()=>console.log("limpiar..")}
        >
          Limpiar
        </button>
      </Card>

      {showObsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[500px] max-w-[90%]">

            <h2 className="text-lg font-semibold mb-2">
              Observación
            </h2>

            <textarea
              className="w-full border rounded-md p-2 mb-4 resize-none"
              rows={6}
              placeholder="Ingrese observación..."
              defaultValue=""
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 text-white rounded-md bg-blue-500 hover:bg-blue-300"
                onClick={() => setShowObsModal(false)}
              >
                Aceptar
              </button>
              <button
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowObsModal(false)}
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {alertState.visible && (
        <AlertDialog
          message={alertState.message}
          onClose={() => setAlertState({ visible: false, message: "" })}
        />
      )}


    </>
  );
};

export default PageEvaluacionDesempenno;
