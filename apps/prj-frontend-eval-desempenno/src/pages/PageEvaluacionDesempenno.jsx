import { useState, useRef, useEffect, useMemo, useCallback } from "react"

import { useFetch } from "../hooks/useFetch";
import useLazyFetch from "../hooks/useLazyFetch";

import { BaseTablaMatrizLikert } from "../components/BaseTablaMatrizLikert";
import { useWidthMap } from "../hooks/useWidthMap";
import Card from "../components/Card"
import Select from "../components/Select";
import { AlertDialog } from "../components/AlertDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";
import EncuestaLikert from "../components/EncuestaLikert";
import useIsMobile from "../hooks/useIsMobile";
import useAuth from "../hooks/useAuth";
import { useNavigateTo } from "../utils/useNavigateTo";
import { clearFetchCache } from "../hooks/useFetch";

const PageEvaluacionDesempenno = () => {
  const posID = sessionStorage.getItem("posID") ?? "";
  const API_RESULT_MANTEN = "/llamada/fetch/grabar_encuestaEvaLab"

  const API_RESULT_LISTAR = useMemo(() => {
    return `/llamada/fetch/listalikert?dato=${encodeURIComponent(posID)}`;
  }, [posID]);

  const { usuario, logout } = useAuth();
  const navigateTo = useNavigateTo();
  const tablaRef = useRef(null);
  const cardRef = useRef(null);
  const selectRef = useRef(null);
  const cardLitaRef = useRef([]);
  const currentRef = useRef([]);
  const { runFetch } = useLazyFetch();
  const { data, loading, error } = useFetch(API_RESULT_LISTAR);

  const [isLoading, setIsLoading] = useState(false);
  const [malResult, setMalResult] = useState("")
  const [sentOK, setsentOK] = useState(true);

  const widthMap = useWidthMap();
  const [showObsModal, setShowObsModal] = useState(false);
  const [obsData, setObsData] = useState(null);
  const [obsText, setObsText] = useState("");
  const [predata, setPredata] = useState("");
  const [respuestas, setRespuestas] = useState({});
  const [resetKey, setResetKey] = useState(0);
  const [erroresObs, setErroresObs] = useState({});
  const [alertState, setAlertState] = useState({
    visible: false,
    message: "",
    onClose: null,
  });
  const [showConfirm, setShowConfirm] = useState({
    visible: false,
    message: "",
    onConfirm: null,
  });


  const preData = typeof data?.[0] === "string" ? data?.[0]?.split("~") : [];
  const infoMeta = preData?.[0]?.split("|") ?? [];
  const info = preData?.[1]?.split("|") ?? [];

  const informacion = (infoMeta ?? []).map((meta, idx) => ({
    data: (info ?? [])[idx] ?? "",
    metadata: (meta ?? "").split("*"),
  }));

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

  const [usuarioID, unico, nombre] = usuario?.split("|") ?? "";

  const preguntas = useMemo(() => {
    return mapaListas?.[41]?.slice(2) ?? [];
  }, [mapaListas]);

  useEffect(() => {
    informacion.forEach((item) => {
      const meta = item.metadata;
      const idx = Number(meta[5]);
      const tipo = meta[4];
      if (tipo === "0" && !currentRef.current[idx]) {
        const [grupo, posicion] = meta[6]?.split(".") ?? [];
        currentRef.current[idx] = {
          campo: meta[0],
          grupo,
          posicion,
          valor: item.data,
          nroRef:idx
        };
      }
    });
  }, [informacion]);

  const [proyecto, setProyecto] = useState(() => {
    return informacion[5]?.data ?? "";
  });

  const isEvaluador = useMemo(() => {
    return informacion[6]?.data ?? "";
  }, [informacion]);

  const forEachRef = (refArray, callback) => {
    Object.values(refArray.current).forEach((ref) => {
      if (ref) callback(ref);
    });
  };

  useEffect(() => {
    if (!malResult) return;
    const timer = setTimeout(() => {
      setMalResult("");
    }, 2000);
    return () => clearTimeout(timer);
  }, [malResult]);

  const snapshotFormRef_Cabeceras = (refArray, grupo) => {
    const dataCampo = []
    const dataValor = []
    if (!refArray?.current) return;
    forEachRef(refArray, (ref) => {
      if (grupo && ref.grupo !== grupo) return;
      if ("campo" in ref) {
        dataCampo.push(ref.campo)
        if ([6, 7, 8].includes(ref.nroRef)) {
          ref.valor = "";
        } else {
          dataValor.push(ref.valor)
        }
      }
    });
    const size = dataCampo.length
    dataCampo.unshift(size)
    const dataCampoString = dataCampo.join("|")
    const dataValorString = dataValor.join("|")
    return {
      dataCampoString,
      dataValorString
    }
  };

  const limpiarControles = useCallback(() => {
    setRespuestas({})
    setErroresObs({})
    setResetKey(prev => prev + 1)
  }, []);

  const isMobile = useIsMobile(768, limpiarControles);

  if (Array.isArray(data) && data[0] === "0") {
    console.log("no hay datos..");
    return (
      <div className="text-center text-gray-600 py-10">
        No Se le ha asignado una Evaluación de Desempeño Laboral
      </div>
    );
  }

  const handleChangeRespuesta = ({ pk, value, observacion, clearError }) => {
    setRespuestas(prev => ({
      ...prev,
      [pk]: {
        ...prev[pk],
        ...(value !== undefined && { value }),
        ...(observacion !== undefined && { observacion })
      }
    }));
    if (clearError) {
      const opcionesRaw = mapaListas?.[35] ?? [];
      if (opcionesRaw.length) {
        const opciones = opcionesRaw.map(item => {
          const [, v] = item.split("|");
          return v?.trim();
        });
        const primera = opciones[0];
        const ultima = opciones[opciones.length - 1];
        const esExtremo = value === primera || value === ultima;

        setErroresObs(prev => ({
          ...prev,
          [pk]: esExtremo
        }));
      }
    }
  };

  const validarObservaciones = (resultadoCompleto, mapaListas) => {
    const errores = {};
    const opcionesRaw = mapaListas?.[35] ?? [];
    if (!opcionesRaw.length) return errores;

    const opciones = opcionesRaw.map(item => {
      const [, value] = item.split("|");
      return value?.trim();
    });

    const primera = opciones[0];
    const ultima = opciones[opciones.length - 1];

    resultadoCompleto.forEach(item => {
      const { pk, value, observacion } = item;
      const esExtremo = value === primera || value === ultima;
      const sinObs = !observacion || observacion.trim() === "";

      if (esExtremo && sinObs) {
        errores[pk] = true;
      }
    });
    return errores;
  };

  const handleFilaSeleccionada = (fila) => {
    console.log("fila:", fila)
  }

  const handleObservacion = ({pk, onSave}) => {
    setObsData({ pk, onSave });
    setObsText(respuestas[pk]?.observacion ?? "");
    setShowObsModal(true);
  }

  const buildResultadoCompleto = (preguntas, respuestas) => {
    return preguntas.map((item, idx) => {
      const [pk] = item.split("|")
      const r = respuestas[pk] ?? {}
      return {
        pk,
        nro: idx + 1,
        value: r.value ?? "",
        observacion: r.observacion ?? ""
      }
    });
  }

  const llamadaAPI = async (datosEnv) => {
    if (isLoading) return;
    setIsLoading(true);
    setMalResult("");

    const formData = new FormData();
    formData.append("data", datosEnv);
    try {
      const result = await runFetch(API_RESULT_MANTEN, {
        method: "POST",
        body: formData,
      });

      if (typeof result === "string" &&
        !result.toLowerCase().startsWith("error")) {
        setsentOK(true)

        setAlertState({
          visible: true,
          message: "SE ACTUALIZO LA INFORMACION...",
          onClose: () => handleLogout()
        });

      } else {
        setsentOK(false)
        setMalResult("No se pudo Guardar la informacion...");
      }
    } catch (err) {
      console.error("Error tecnico:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleGrabar = () => {
    const resultadoCompleto = buildResultadoCompleto(preguntas, respuestas)

    const errores = validarObservaciones(resultadoCompleto, mapaListas)
    setErroresObs(errores);
    if (Object.keys(errores).length > 0) {
      setAlertState({
        visible: true,
        message: "Debe ingresar observaciones obligatorias..."
      });
      return;
    }

    const vacio = resultadoCompleto.find(item => !item.value);
    if (vacio) {
      setAlertState({
        visible: true,
        message: (
          <div className="
            bg-blue-100
            text-blue-800
            px-4
            py-2
            rounded
            inline-block
            "
          >
            Debe responder la pregunta{" "}
            <span className="font-bold text-red-800">{vacio.nro}</span>
          </div>
        )
      });
      return;
    }

    let { dataCampoString, dataValorString } =
      snapshotFormRef_Cabeceras(currentRef, "1");

    if (isEvaluador === "1" && predata !== "") {
      dataValorString = predata
    }

    const clean = (txt) => txt?.replace(/\|/g, " ")?.trim() ?? "";

    const resultadoPlano = resultadoCompleto
      .map(({ pk, value, observacion }) =>
        `${dataValorString}|${pk}|${value}|${clean(observacion)}`
      )
      .join("|");

    const resultFinal = [
      usuarioID ?? "",
      dataCampoString ?? "",
      resultadoPlano ?? ""
    ].join("|");

    setShowConfirm({
      visible: true,
      message: "¿Deseas Guardar sus Respuestas... ?",
      onConfirm: () => {
        llamadaAPI(resultFinal);
      }
    })
  }

  const handleLogout = () => {
    clearFetchCache();
    logout();
    navigateTo.replace("/");
  };

  const handleLimpiar = () => {
    limpiarControles()
  }

  const handleChangeSelect = (valor, label, item) => {
    const valores = "|".concat(valor.replaceAll("*", "|"))
    const nuevoProy = item.split("|")[2]
    setPredata(valores)
    if (nuevoProy !== "") {
      setProyecto(nuevoProy)
    }

    console.log("item", nuevoProy )
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

  const renderCampo = (item, idx) => {
    const meta = item.metadata;
    const tipo = meta[4];
    const grupo = item.grupo;
    const posicion = item.posicion;
    const getBool = (v, def) => (v ? v === "1" : def);
    if (tipo === "0") {
      return null;
    }

    const valorInicialBase = {
      valor: item.data,
      campo: meta[0],
      required: meta[1],
      max: meta[2],
      tipo_dato: meta[3],
      tipo_ctl: tipo,
      nro_ref: meta[5],
      grupo,
      posicion,
    };

    const baseProps = {
      ref: (el) => (currentRef.current[Number(meta[5])] = el),
      label: meta[7],
      labelPosition: Number(meta[9] ?? 0),
      enabled: getBool(meta?.[10], true),
      hidden: getBool(meta?.[11], false)
    };

    switch (tipo) {
      case "1": // Input
      case "2": {// Date
        const inputType = tipo === "2" && "2" || "1";
        return (
          <Input
            key={idx}
            type={inputType}
            {...baseProps}
            valorInicial={{
              ...valorInicialBase
            }}
            span={Number(meta[8] ?? 8)}
            value={item.data}
          />
        )
      };

      case "4": // Select
        return (
          <Select
            key={idx}
            {...baseProps}
            valorInicial={{
              ...valorInicialBase,
              seleccion : meta[12]
            }}
            span={Number(meta[8] ?? 8)}
            lista={mapaListas[meta[5]]}
            value={item.data}
            onChange={(v, lbl, filaReg) => handleChangeSelect(meta[5], v, lbl, filaReg)}
          />
        );

      default:
        return null;
    }
  };

  const staticCards = {
    "3": (
      <div className="flex flex-col gap-1">
        <div>
          <span className="font-normal">PROYECTO :</span>{" "}
          <span className="font-bold">{proyecto}</span>
        </div>
        {isEvaluador === "0"
          ? (
            <div>
              <span className="font-normal">COLABORADOR :</span>{" "}
              <span className="font-bold">{nombre}</span>
            </div>
          )
          : null
        }
        {isEvaluador === "1"
          ? (
            <div>
              <Select
                ref={selectRef}
                label="Seleccione un Colaborador:"
                valorInicial={{
                  posicion:"0"
                }}
                span={10}
                lista={mapaListas?.[9]}
                value={1}
                onChange={(v, lbl, filaReg) => handleChangeSelect(v, lbl, filaReg)}
              />
            </div>
          )
          : null
        }
      </div>
    )
  }

  return (
    <>
      {mapaListas[22]?.map((row) => {
        const [refId, title, ancho] = row.split("|");
        return (
          <Card
            key={refId}
            title={title}
            layout={refId === "3" ? "flex" : "grid"}
            hidden={["2", "4"].includes(refId)}
            enabled={!["1"].includes(refId)}
            className={widthMap[ancho]}
            ref={(el) => { if (el) cardLitaRef.current[refId] = el; }}
          >
            {staticCards[refId] ??
              informacion
                .map((item) => {
                    const [grupo, posicion] = item.metadata[6]?.split(".") ?? [];
                    return {...item, grupo, posicion};
                  })
                .filter((item) => item.grupo === refId)
                .map((item, idx) => renderCampo(item, idx))
            }
          </Card>
        );
      })}

      {isMobile ? (
        preguntas.length ? (
          preguntas.map((item, idx) => {
            const partes = item.split("|");
            const pks = partes[0] ?? idx;
            const texto = partes[1] ?? "";
            return (
              <EncuestaLikert
                key={`${pks}-${resetKey}`}
                nro={idx + 1}
                label={texto}
                pks={pks}
                lista={mapaListas?.[35]}
                onObservacion={handleObservacion}
                onChangeRespuesta={handleChangeRespuesta}
                errorObs={erroresObs[pks]}
              />
            )
          })
        ):null
      ):(
        configTable?.listaDatos?.length ? (
          <BaseTablaMatrizLikert
            key={resetKey}
            ref={tablaRef}
            configTable={configTable}
            isEditing={false}
            rowsPerPage={10}
            showRowNumber={true}
            opcionesRadio={mapaListas?.[35]}
            onSelect={handleFilaSeleccionada}
            onObsClick={handleObservacion}
            onChangeRespuesta={handleChangeRespuesta}
            erroresObs={erroresObs}
            respuestas={respuestas}
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
          onClick={handleLimpiar}
        >
          Limpiar
        </button>
        {malResult && (
          <p className={`text-center
            ${sentOK
              ? "text-green-800 text-lg font-semibold"
              : "text-red-600 text-sm"
            }`}
          >
            {malResult}
          </p>
        )}
        {unico === "1" ? (
          <button className="px-8 py-2 rounded-md shadow-sm bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer"
            onClick={handleLogout}
          >
            SALIR
          </button>
          ):null
        }
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
              value={obsText}
              onChange={(e) => setObsText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation();
                  e.preventDefault();
                }
              }}
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 text-white rounded-md bg-blue-500 hover:bg-blue-300"
                onClick={() => {
                  obsData?.onSave?.(obsText);
                  setShowObsModal(false);
                  setObsText("")
                }}
              >
                Aceptar
              </button>
              <button
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                onClick={() => {
                  setShowObsModal(false);
                  setObsText("");
                }}
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
          onClose={() => {
            alertState.onClose?.();
            setAlertState({ visible: false, message: "", onClose: null });
          }}
        />
      )}
      {showConfirm.visible && (
        <ConfirmDialog
          message={showConfirm.message}
          onConfirm={() => {
            showConfirm.onConfirm?.();
            setShowConfirm({ visible: false, message: "", onConfirm: null });
          }}
          onCancel={() =>
            setShowConfirm({ visible: false, message: "", onConfirm: null })
          }
        />
      )}


    </>
  );
};

export default PageEvaluacionDesempenno;
