import { useLocation } from "react-router-dom";
import Card from "../components/Card"
import Input from "../components/Input"
import TextArea from "../components/TextArea";
import Select from "../components/Select";
import Checkbox from "../components/Checkbox";
import { useState, useEffect, useRef, useMemo } from "react";
import { useFetch } from "../hooks/useFetch";
import useLazyFetch from "../hooks/useLazyFetch";
import { useWidthMap } from "../hooks/useWidthMap";
import { BaseTablaMatrizBase } from "../components/BaseTablaMatrizBase";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AlertDialog } from "../components/AlertDialog";

const PageCompetencias = () => {
  const API_RESULT_LISTAR = "/llamada/fetch/listaCompetencias";
  const API_RESULT_MANTEN = "/llamada/fetch/mante_competencia"
  const location = useLocation();
  const usuarioMatriz = location.state?.value;
  const currentRef = useRef([]);
  const cardRef = useRef([]);
  const chkRef = useRef(null);
  const { data, loading, error } = useFetch(API_RESULT_LISTAR);
  const { runFetch } = useLazyFetch();
  const widthMap = useWidthMap();
  const [listaData, setListaData] = useState([]);
  const [configTable, setConfigTable] = useState({});
  const [alertState, setAlertState] = useState({
    visible: false,
    message: "",
  });
  const [showConfirm, setShowConfirm] = useState({
    visible: false,
    message: "",
    onConfirm: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingFila, setLoadingFila] = useState(false);
  const [malResult, setMalResult] = useState("")
  const [sentOK, setsentOK] = useState(true);
  const [mapaListas, setMapaListas] = useState({});

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

  const usuario = usuarioMatriz?.split("|")?.[0]

  useEffect(() => {
    if (!listasData?.length) return;
    const nuevoMapa = listasData.reduce((acc, entry) => {
      const [itemKey, ...opciones] = entry.split("~");
      acc[itemKey] = opciones;
      return acc;
    }, {});
    setMapaListas(nuevoMapa);
  }, [listasData]);

  const metaListaCompetencias = mapaListas?.[40]?.slice(0,1);
  const metaListaComportamiento = mapaListas?.[41]?.slice(0, 1);
  const lista2 = mapaListas?.[2];

  useEffect(() => {
    informacion.forEach((item) => {
      const meta = item.metadata;
      const tipo = meta[4];
      if (tipo === "0" && !currentRef.current[meta[5]]) {
        currentRef.current[meta[5]] = {
          campo: meta[0],
          grupo: meta[6],
          valor: item.data
        };
      }
    });
  }, [informacion]);

  useEffect(() => {
    if (!malResult) return;
    const timer = setTimeout(() => {
      setMalResult("");
    }, 2000);
    return () => clearTimeout(timer);
  }, [malResult]);

  useEffect(() => {
    if (currentRef.current?.[2]) {
      currentRef.current[2].setLista(lista2 ?? []);
    }
  }, [lista2]);

  const setErrorAllRefs = () => {
    Object.values(currentRef.current).forEach((ref) => {
      if (ref && typeof ref.setError === "function") {
        ref.setError(false);
      }
    });
  };

  const seteosIniciales = () => {
    const listaTmp = [];
    setListaData(listaTmp);
    setConfigTable((prev) => ({
      ...prev,
      listaDatos: listaTmp,
    }));
    currentRef.current[3]?.setValue("")
    currentRef.current[4]?.setValue("")
    setErrorAllRefs()
  }

  const handleSwitcher = (estado) => {
    seteosIniciales();
    if (estado) {
      cardRef.current[1].setTitle("NUEVO Comportamiento :")
      cardRef.current[3].setTitle("Lista de Comportamientos :")
      currentRef.current[5]?.setValue("CM")
      currentRef.current[8]?.setHidden(false)
      currentRef.current[2]?.setHidden(false)
      currentRef.current[3]?.setHidden(true)
      currentRef.current[2]?.setValue("")
    } else {
      cardRef.current[1].setTitle("NUEVA Competencia :")
      cardRef.current[3].setTitle("")
      currentRef.current[5]?.setValue("CO")
      currentRef.current[8]?.setHidden(true)
      currentRef.current[2]?.setHidden(true)
      currentRef.current[3]?.setHidden(false)

      const listaTmp = mapaListas[40].slice(1);
      setListaData(listaTmp);
      setConfigTable((prev) => ({
        ...prev,
        title: "Lista de Competencias :",
        isPaginar: false,
        listaDatos: listaTmp,
        offsetColumnas: 4,
      }));
    }
  }

  const handleChangeSelect = (campo, valor, label) => {
    if (campo === "2") {
      if (chkRef.current.getValue()) {
        cardRef.current[1].setTitle("NUEVO Comportamiento :")
      }
      const comportamientos = mapaListas?.[41]?.slice(1) ?? [];
      const header = comportamientos.slice(0, 2);

      const filtrado = comportamientos.slice(2).filter(row => {
        const cols = row.split("|");
        return cols[1] === valor;
      });

      if (filtrado.length > 0) {
        cardRef.current[3].setTitle("")
        currentRef.current[4].setValue("")
        const listaTmp = [...header,...filtrado];

        setListaData(listaTmp);
        setConfigTable((prev) => ({
          ...prev,
          title: `Lista de Comportamientos de ${label}`,
          isPaginar: false,
          listaDatos: listaTmp,
          offsetColumnas: 5,
        }));
      } else {
        cardRef.current[3].setTitle("Lista de Comportamientos :")
        seteosIniciales();
      }
    }
  }

  const handleFilaSeleccionada = async (fila) => {
    if (loadingFila) return;
    setLoadingFila(true);

    await new Promise(requestAnimationFrame)

    const isComportamiento = chkRef.current.getValue()
    let metaLista = []

    if (isComportamiento) {
      cardRef.current[1].setTitle("EDITAR Comportamiento :")
      metaLista = metaListaComportamiento?.[0]?.split("|") ?? []
    } else {
      cardRef.current[1].setTitle("EDITAR Competencia :")
      metaLista = metaListaCompetencias?.[0]?.split("|") ?? []
    }

    metaLista.forEach((idxRef, i) => {
      const idx = Number(idxRef);
      if (!idx) return;
      const value = fila?.[i];
      if (value !== undefined) {
        const ref = currentRef.current[idx];
        if (!ref) return;

        const valTmp = ref?.getTipoCtl?.() === "3"
          ? (value === "1" ? true : value === "0" ? false : Boolean(value))
          : value;
        ref?.setValue?.(valTmp);

        if (typeof ref?.setValor === "function") {
          ref.setValor(valTmp);
        } else if (ref) {
          ref.valor = valTmp;
        }
      }
    });
    setLoadingFila(false);
  }

  const filtrarCampos = (dataCampo, dataValor) => {
    const camposExcluir = new Set();

    currentRef.current.forEach(ref => {
      if (!ref) return;
      if (typeof ref?.isHidden !== "function") return;
      const hidden = !!ref.isHidden();
      if (hidden) {
        const campo = ref?.getCampo?.();
        if (campo) {
          camposExcluir.add(campo);
        }
      }
    });

    const nuevoCampo = [];
    const nuevoValor = [];

    if (!camposExcluir.size) {
      return { dataCampo, dataValor };
    }

    dataCampo.forEach((campo, i) => {
      if (!camposExcluir.has(campo)) {
        nuevoCampo.push(campo);
        nuevoValor.push(dataValor[i]);
      }
    });

    return {
      dataCampo: nuevoCampo,
      dataValor: nuevoValor
    };
  };

  const handleGrabar = async () => {
    await new Promise(requestAnimationFrame);

    const titulo = cardRef.current[1].getTitle();
    const NUEVO = titulo.startsWith("NUEV");
    const nroEl = currentRef.current.length;
    let dataCampo = [];
    let dataValor = [];
    let pasa = true;
    let campoPlano = "";
    let valorPlano = "";

    const isProcesable = (ref) => {
      const hidden = !!ref.isHidden?.();
      const enabled = !!ref.isEnabled?.();
      if (hidden) return false;
      if (!NUEVO) {
        if (!enabled) return false;
      }
      return true;
    };

    for (let idx = 0; idx < nroEl; idx++) {
      const ref = currentRef.current[idx];
      if (!ref) continue;
      if (typeof ref?.getValue !== "function") {
        campoPlano = ref.campo;
        if (!NUEVO) {
          valorPlano = ref.valor;
        }
        continue;
      }
      if (!isProcesable(ref)) continue;
      ref.setError(false);

      const required = ref.getRequired?.();
      const isEqual = ref.isEqualBase?.();
      const campo = ref.getCampo?.();
      const val = ref.getValue?.();
      const value = typeof val === "string" ? val.trim()
        : typeof val === "boolean" ? (val ? "1" : "0") : val ?? ""

      if (!campo) continue;
      if (required === "1" && value === ""){
        ref.setError(true);
        pasa = false;
      }
      if (NUEVO) {
        dataCampo.push(campo)
        dataValor.push(value)
      } else {
        if (!isEqual) {
          dataCampo.push(campo)
          dataValor.push(value)
        }
      }
    };

    const result = filtrarCampos(dataCampo, dataValor);
    dataCampo = result.dataCampo;
    dataValor = result.dataValor;

    if (!pasa) {
      return;
    } else if (pasa && dataCampo.length > 0) {
      dataCampo.unshift(campoPlano)
      dataValor.unshift(valorPlano)
      const dataCampoEnviar = dataCampo.join("|")
      const dataValorEnviar = dataValor.join("|")
      const dataEnviar =
        usuario + '|' + dataCampoEnviar + '|' + dataValorEnviar

      setShowConfirm({
        visible: true,
        message: "¿Deseas Guardar la Informacion ?",
        onConfirm: () => handleApiEnvio(dataEnviar)
      })
    } else {
      setAlertState({
        visible: true,
        message: "NO existen Datos modificados...",
      });
    }
  }

  const handleApiEnvio = async (datosEnvio) => {
    if (isLoading) return;
    setIsLoading(true);
    setMalResult("");

    const titulo = cardRef.current[1].getTitle();
    const NUEVO = titulo.startsWith("NUEV");
    const formData = new FormData();
    formData.append("data", datosEnvio);
    try {
      const result = await runFetch(API_RESULT_MANTEN, {
        method: "POST",
        body: formData,
      });

      if (typeof result === "string" &&
        !result.toLowerCase().startsWith("error")) {
        cardRef.current[3].setTitle("")
        setsentOK(true)
        setMalResult("SE ACTUALIZO LA INFORMACION...");

        // COMPORTAMIENTO
        if (chkRef.current.getValue()) {
          let listaTmp = [];
          const idCompetencia = currentRef.current[2].getValue()
          const disponible = currentRef.current[7].getValue() ? "1" : "0"
          const idGrupo = currentRef.current[6].getValue()
          const idGrado = currentRef.current[8].getValue()
          const descripcion = currentRef.current[4].getValue()
          const descGrado = currentRef.current[8].getLabel()
          const descGrupo = currentRef.current[6].getLabel()
          const descdispon = currentRef.current[7].getValue() ? "SI" : "NO"
          const label = currentRef.current[2].getLabel()
          const fila = [
            result,
            idCompetencia,
            disponible,
            idGrupo,
            idGrado,
            descripcion,
            descGrado,
            descGrupo,
            descdispon
          ].join("|");

          if (NUEVO) {
            setMapaListas(prev => ({
              ...prev,
              41: [...(prev?.[41] ?? []), fila]
            }));

            const comportamientos = (mapaListas?.[41] ?? []).slice(1);
            const header = comportamientos.slice(0, 2);

            listaTmp = listaData.length
              ? [...listaData, fila]
              : [...header, fila];

          } else {
            setMapaListas(prev => ({
              ...prev,
              41: (prev?.[41] ?? []).map(row => {
                const id = row.split("|")[0];
                return id === String(result) ? fila : row;
              })
            }));

            listaTmp = (listaData ?? []).map(row => {
              const id = row.split("|")[0];
              return id === String(result) ? fila : row;
            });
          }

          setListaData(listaTmp);
          setConfigTable((prev) => ({
            ...prev,
            title: `Lista de Comportamientos de ${label}`,
            isPaginar: false,
            listaDatos: listaTmp,
            offsetColumnas: 5,
          }));

          currentRef.current[4].setValue("")
          cardRef.current[1].setTitle("NUEVO Comportamiento :")
        } else {
          // COMPETENCIAS
          let listaTmpCompetencias = [];
          const nombreCompetencia2 = currentRef.current[3].getValue()
          const disponible2 = currentRef.current[7].getValue() ? "1" : "0"
          const grupoId2 = currentRef.current[6].getValue()
          const descripcion2 = currentRef.current[4].getValue()
          const nombreGrupo2 = currentRef.current[6].getLabel()
          const descdispon2 = currentRef.current[7].getValue() ? "SI" : "NO"
          const filaCompe = [
            result,
            descripcion2,
            disponible2,
            grupoId2,
            nombreCompetencia2,
            nombreGrupo2,
            descdispon2
          ].join("|");

          if (NUEVO) {
            setMapaListas(prev => ({
              ...prev,
              40: [...(prev?.[40] ?? []), filaCompe]
            }));

            const competencias = (mapaListas?.[40] ?? []).slice(1);
            const header = competencias.slice(0, 2);

            listaTmpCompetencias = listaData.length
              ? [...listaData, filaCompe]
              : [...header, filaCompe];
          } else {
            setMapaListas(prev => ({
              ...prev,
              40: (prev?.[40] ?? []).map(row => {
                const id = row.split("|")[0];
                return id === String(result) ? filaCompe : row;
              })
            }));

            listaTmpCompetencias = (listaData ?? []).map(row => {
              const id = row.split("|")[0];
              return id === String(result) ? filaCompe : row;
            });
          }

          setListaData(listaTmpCompetencias);
          setConfigTable((prev) => ({
            ...prev,
            title: "Lista de Competencias :",
            isPaginar: false,
            listaDatos: listaTmpCompetencias,
            offsetColumnas: 4,
          }));

          currentRef.current[3].setValue("")
          currentRef.current[4].setValue("")
          cardRef.current[1].setTitle("NUEVA Competencia :")

          actualizaLista(filaCompe)
        }

      } else {
        setsentOK(false)
        setMalResult("No se pudo Guardar la informacion...");
      }
    } catch (err) {
      console.error("Error tecnico:", err);
    } finally{
      setIsLoading(false);
    }
  }

  const actualizaLista = (fila) => {
    const [id, , flag, , nuevoTexto] = fila.split("|")

    setMapaListas(prev => {
      const lista = prev[2] ?? []
      let existe = false

      const nuevaLista = lista
        .filter(item => {
          const [itemId] = item.split("|")
          return !(itemId === id && flag === "0")
        })
        .map(item => {
          const [itemId, itemTexto] = item.split("|")
          if (itemId === id) {
            existe = true
            if (itemTexto.trim() !== nuevoTexto.trim()) {
              return `${id}|${nuevoTexto}`;
            }
          }
          return item;
        });

      if (!existe && flag === "1") {
        const nuevoItem = `${id}|${nuevoTexto}`;
        const index = nuevaLista.findIndex(item => {
          const [, texto] = item.split("|");
          return texto.localeCompare(nuevoTexto, "es", { sensitivity: "base" }) > 0;
        });
        if (index === -1) {
          nuevaLista.push(nuevoItem);
        } else {
          nuevaLista.splice(index, 0, nuevoItem);
        }
      }
      return {
        ...prev,
        2: nuevaLista
      }
    });
  }

  const handleLimpiar = () => {
    currentRef.current[2]?.setValue("")
    currentRef.current[3]?.setValue("")
    currentRef.current[4]?.setValue("")
    currentRef.current[6]?.setValue("EA")
    currentRef.current[7]?.setValue(true)
    setMalResult("");
    if (chkRef.current.getValue()) {
      seteosIniciales()
      cardRef.current[1].setTitle("NUEVO Comportamiento :")
    } else {
      setErrorAllRefs()
      cardRef.current[1].setTitle("NUEVA Competencia :")
    }
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
    };

    const baseProps = {
      ref: (el) => (currentRef.current[meta[5]] = el),
      label: meta[7],
      labelPosition: Number(meta[9] ?? 0),
      enabled: getBool(meta?.[10], true),
      hidden: getBool(meta?.[11], false)
    };

    switch (tipo) {
      case "1": // Input
        return (
          <Input
            key={idx}
            {...baseProps}
            valorInicial={{
              ...valorInicialBase
            }}
            span={Number(meta[8] ?? 8)}
            value={item.data}
          />
        );

      case "3": // Checkbox
        return (
          <Checkbox
            key={idx}
            {...baseProps}
            valorInicial={{
              ...valorInicialBase
            }}
            value={item.data === "" || item.data === "1"}
          />
        );

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
            onChange={(v, lbl) => handleChangeSelect(meta[5], v, lbl)}
          />
        );

      case "5": // TextArea
        return (
          <TextArea
            key={idx}
            {...baseProps}
            valorInicial={{
              ...valorInicialBase
            }}
            width={meta[8] ? `${meta[8]}%` : "100%"}
            value={item.data}
          />
        );

      default:
        return null;
    }
  };

  const staticCards = {
    "2": (
        <>
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
        </>
      )
  };

  return (
    <>
      <Card title="" layout="grid" className="w-[40%]" >
        <Checkbox
          ref={chkRef}
          label="MANTENIMIENTO DE COMPORTAMIENTOS :"
          label2="MANTENIMIENTO DE COMPETENCIAS :"
          value={true}
          labelFullWidth={true}
          onChange={(v) => handleSwitcher(v)}
          labelPosition={1}
        />
      </Card>

      {mapaListas[22]?.map((row) => {
        const [refId, title, ancho] = row.split("|");
        return (
          <Card
            key={refId}
            title={title}
            layout={refId === "2" ? "flex" : "grid"}
            className={widthMap[ancho]}
            ref={(el) => (cardRef.current[refId] = el)}
          >
            {staticCards[refId] ??
                informacion
                  .filter((item) => item.metadata[6] === refId)
                  .map((item, idx) => renderCampo(item, idx))
            }
          </Card>
        );
      })}

      {configTable?.listaDatos?.length ? (
        <BaseTablaMatrizBase
            configTable={configTable}
            handleRadioClick={() => {}}
            handleCheckDelete={() => {}}
            isEditing={false}
            onSelect={handleFilaSeleccionada}
          />
        ): null
      }

      {alertState.visible && (
        <AlertDialog
          message={alertState.message}
          onClose={() => setAlertState({ visible: false, message: "" })}
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

export default PageCompetencias;
