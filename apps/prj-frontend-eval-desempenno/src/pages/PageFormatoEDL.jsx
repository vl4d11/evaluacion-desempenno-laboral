import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useLocation } from "react-router-dom";
import { useWidthMap } from "../hooks/useWidthMap";
import { useFetch } from "../hooks/useFetch";
import Card from "../components/Card"
import Input from "../components/Input"
import TextArea from "../components/TextArea";
import Select from "../components/Select";
import Checkbox from "../components/Checkbox";
import Radio from "../components/Radio"
import { BaseTablaMatrizBase } from "../components/BaseTablaMatrizBase";

const PageFormatoEDL = () => {
  const API_RESULT_LISTAR = "/llamada/fetch/listaFormatoEv";
  const location = useLocation();
  const usuario = location.state?.value;
  const cardRadioRef = useRef(null);
  const currentRef = useRef([]);
  const cardRef = useRef([]);
  const isEditModeRef = useRef(false);
  const widthMap = useWidthMap();
  const [selected, setSelected] = useState("L");
  const [desmarcarRadios, setDesmarcarRadios] = useState(false);
  const { data, loading, error } = useFetch(API_RESULT_LISTAR);
  const [isLoading, setIsLoading] = useState(false);
  const [configTable, setConfigTable] = useState(null);
  const [listaData, setListaData] = useState([]);
  const [mapaListas, setMapaListas] = useState({});
  const [isGrabarDisabled, setIsGrabarDisabled] = useState(true);
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);


  const preData = typeof data?.[0] === "string" ? data?.[0]?.split("~") : [];
  const infoMeta = preData?.[0]?.split("|") ?? [];
  const info = preData?.[1]?.split("|") ?? [];

  const informacion = (infoMeta ?? []).map((meta, idx) => ({
    data: (info ?? [])[idx] ?? "",
    metadata: (meta ?? "").split("*"),
  }));

  const tipoNumero = (s) => /^-?\d+$/.test(s.trim()) ? "entero" : "decimal";

  const normalizarMapa = useCallback((mapa) => {
    const nuevoMapa = {};
    Object.entries(mapa).forEach(([key, value]) => {
      const keys = tipoNumero(key) === "entero" ? [key] : key.split(".");
      keys.forEach((k) => {
        if (!nuevoMapa[k]) {
          nuevoMapa[k] = [];
        }
        nuevoMapa[k] = [...nuevoMapa[k], ...value];
      });
    });
    return nuevoMapa;
  },[]);

  const listasData = useMemo(() => {
    return (data ?? []).slice(1);
  }, [data]);

  useEffect(() => {
    if (!listasData?.length) return;
    const mapaBase = listasData.reduce((acc, entry) => {
      const [itemKey, ...opciones] = entry.split("~");
      acc[itemKey] = opciones;
      return acc;
    }, {});

    const mapaNormalizado = normalizarMapa(mapaBase);
    setMapaListas(mapaNormalizado);

  }, [listasData, normalizarMapa]);


  const cardDetalleConfig = useMemo(() => {
    const row = mapaListas?.[22]?.find((r) => r.startsWith("4|"));
    if (!row) return null;
    const [refId, title, ancho] = row.split("|");
    return {
      refId,
      title,
      ancho,
    };
  }, [mapaListas]);

  const configTableBase = useMemo(() => {
    if (!mapaListas?.[41]?.length) return null;
    return {
      title: "Lista de Formatos de Evaluación :",
      isPaginar: false,
      listaDatos: mapaListas[41].slice(1),
      offsetColumnas: 4,
    };
  }, [mapaListas]);

  const metaListaFormatoEvDes = mapaListas?.[41]?.[0];
  const metaListaFormatDetail = mapaListas?.[42]?.[0];

  const configTableFinal = configTable ?? configTableBase;
  const cardDetalleWidth = cardDetalleConfig
    ? widthMap[cardDetalleConfig.ancho]
    : "";

  useEffect(() => {
    informacion.forEach((item) => {
      const meta = item.metadata;
      const idx = Number(meta[5]);
      const tipo = meta[4];
      if (tipo === "0" && !currentRef.current[idx]) {
        currentRef.current[idx] = {
          campo: meta[0],
          grupo: meta[6],
          valor: item.data
        };
      }
    });
  }, [informacion]);

  useEffect(() => {
    if (!showModalDetalle || !isEditModeRef.current) return;
    const metaLista = metaListaFormatDetail.split("|");

    metaLista.forEach((idxRef, i) => {
      const idx = Number(idxRef);
      if (!idx) return;
      const value = detalleSeleccionado?.[i];
      if (value !== undefined) {
        const ref = currentRef.current[idx];
        if (!ref) return;
        const valTmp =
          ref?.getTipoCtl?.() === "3"
            ? value === "1"
              ? true
              : value === "0"
              ? false
              : Boolean(value)
            : value;

        ref?.setValue?.(valTmp);
        if (typeof ref?.setValor === "function") {
          ref.setValor(valTmp);
        } else {
          ref.valor = valTmp;
        }
      }
    });
  }, [showModalDetalle, detalleSeleccionado, metaListaFormatDetail]);

  const snapshotFormRef = () => {
    return Object.values(currentRef.current).reduce((acc, ref) => {
      if (!ref) return acc;
      const campo = ref.getCampo?.();
      if (!campo) return acc;
      acc[campo] = {
        value: ref.getValue?.() ?? "",
        tipoCtl: ref.getTipoCtl?.() ?? null,
      };
      return acc;
    }, {});
  };

  const forEachRef = (refArray, callback) => {
    Object.values(refArray.current).forEach((ref) => {
      if (ref) callback(ref);
    });
  };

  const snapshotFormRef_Clean = (refArray, grupo) => {
    if (!refArray?.current) return;
    forEachRef(refArray, (ref) => {
      if (grupo && ref.grupo !== grupo) return;
      if (typeof ref.setValue === "function") {
        const tipo = ref.getTipoCtl?.();
        if (tipo === "4") {
          ref.setValue("1");
        } else if (tipo === "3") {
          ref.setValue(false);
        } else {
          ref.setValue("");
        }
        return;
      }
      if ("valor" in ref) {
        ref.valor = "";
      }
    });
  };


  const handleChangeSelect = (campo, valor, label) => {
    console.log("seleccion:", campo, valor, label)
  }

  const setLimpiarCtls = () => {
    forEachRef(currentRef, (ref) => {
      if (typeof ref.setValue !== "function") return;
      const tipo = ref.getTipoCtl?.();
      ref.setValue(tipo === "4" ? "1" : "");
    });
  };

  const aplicarModo = (esListar) => {
    const nuevaLista = esListar
      ? mapaListas[41].slice(1)
      : [];
    cardRef.current[1]?.setEnabled(!esListar);
    cardRef.current[2]?.setHidden(esListar);
    setIsGrabarDisabled(esListar);

    setListaData(nuevaLista);
    setConfigTable({
      ...configTableBase,
      listaDatos: nuevaLista,
    });
  };

  const handleRadioChange = (value) => {
    setSelected(value);
    if (value === "L") {
      aplicarModo(true);
    }
    if (value === "N") {
      aplicarModo(false);
    }
    cardRef.current[1].setTitle("Nuevo Formato de Evaluación :")
    setLimpiarCtls()
  };

  const logFlatRefs = (grupo) => {
    const resultado = []

    currentRef.current.forEach((ref) => {
      if (!ref) return;
      const hasMethods = Object.keys(ref).some(key => typeof ref[key] === "function");
      if (!hasMethods && ref.grupo === grupo) {
        resultado.push({ campo: ref.campo, valor: ref.valor });
      }
    });
    return resultado;
  };

  const handleFilaSeleccionada = (fila) => {
    const tituloLocal = configTable?.title ?? configTableBase?.title;
    const evalCab = tituloLocal?.startsWith("Lista") ?? false;

    if (evalCab) {
      aplicarModo(false);
      setDesmarcarRadios(true);
      cardRef.current[1].setTitle("Editar Formato de Evaluación :")
      cardRef.current[2]?.setHidden(true);
      const metaLista = metaListaFormatoEvDes.split("|")

      metaLista.forEach((idxRef, i) => {
        const idx = Number(idxRef);
        if (!idx) return;
        const value = fila?.[i];
        if (value !== undefined) {
          const ref = currentRef.current[idx];
          if (!ref) return;
          const valTmp = ref?.getTipoCtl?.() === "3"
            ? value === "1"
              ? true
              : value === "0"
              ? false
              : Boolean(value)
            : value;

          ref?.setValue?.(valTmp);
          if (typeof ref?.setValor === "function") {
            ref.setValor(valTmp);
          } else if (ref) {
            ref.valor = valTmp;
          }
        }
      });

      const labelGrillaDeta = mapaListas?.[42].slice(1, 3)
      const cabeceras = logFlatRefs("1")
      const indiceBuscar = cabeceras[0].valor

      const listaDetalles = mapaListas?.[42]
        .slice(3)
        .filter(item => item.split("|")[2] === indiceBuscar)
        .map(item => {
          const [, , , keyComp, por, dis] = item.split("|")
          const nombreComp = mapaListas?.[14].find(p => p.split("|")[0] === keyComp);
          const nombreCompValue = nombreComp?.split("|")[1] ?? "";
          return [
            item,
            nombreCompValue,
            Number(por) * 100,
            dis === "1" ? "SI" : "NO"
          ].join("|");
        });
      listaDetalles.unshift(...labelGrillaDeta)

      setListaData(listaDetalles);
      setConfigTable({
        ...configTableBase,
        title: "Detalle Formato de Evaluación Desempeño :",
        isPaginar: false,
        listaDatos: listaDetalles,
        offsetColumnas: 6,
      });
    } else {
      // CARGAR EL DETALLE
      isEditModeRef.current = true;
      setDetalleSeleccionado(fila);
      setShowModalDetalle(true);
    }
  }

  const handleNuevoDetalle = () => {
    isEditModeRef.current = false;
    setDetalleSeleccionado(null);
    snapshotFormRef_Clean(currentRef, "4");
    setShowModalDetalle(true);
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

  const renderCardDetalle = () =>
    informacion
      .filter((item) => item.metadata[6] === "4")
      .map((item, idx) => renderCampo(item, idx));

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
      grupo: meta[6],
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
        );}

      case "3": // Checkbox
        return (
          <Checkbox
            key={idx}
            {...{...baseProps, labelWidth: meta[5]?.trim() === "9" ? 210 : 180}}
            valorInicial={{
              ...valorInicialBase
            }}
            span={Number(meta[8] ?? 8)}
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
    "3": (
        <>
        <button
          disabled={isLoading || isGrabarDisabled}
          className={`px-8 py-2 rounded-md shadow-sm text-white
              ${isLoading || isGrabarDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-500 hover:bg-indigo-600 cursor-pointer"
            }`}
          onClick={() => {
            if (isLoading || isGrabarDisabled) return;
            console.log("Grabar..")
          }}
          >
            {isLoading ? "Guardando..." : "Grabar"}
          </button>
          <button className="px-8 py-2 rounded-md shadow-sm bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer"
            onClick={()=>setLimpiarCtls()}
          >
            Limpiar
          </button>

        </>
      )
  };

  return (
    <>
      <Card ref={cardRadioRef} title="" layout="flex" className="w-[30%]">
        <Radio
          name="grupo1"
          value="L"
          checkedValue={desmarcarRadios ? undefined : selected}
          labelPosition={1}
          label="LISTAR"
          onChange={() => {
            setDesmarcarRadios(false);
            setSelected("L");
            handleRadioChange("L");
          }}
        />
        <Radio
          name="grupo1"
          value="N"
          checkedValue={desmarcarRadios ? undefined : selected}
          labelPosition={1}
          label="NUEVO"
          onChange={() => {
            setDesmarcarRadios(false);
            setSelected("N");
            handleRadioChange("N");
          }}
        />
      </Card>

      {mapaListas[22]?.map((row) => {
        const [refId, title, ancho] = row.split("|");
        return (
          <Card
            key={refId}
            title={title}
            layout={refId === "3" ? "flex" : "grid"}
            hidden={["2", "4"].includes(refId)}
            tieneBoton={["1"].includes(refId)}
            onAddClick={handleNuevoDetalle}
            enabled={refId === "1" ? false : true}
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

      {configTableFinal?.listaDatos?.length ? (
          <BaseTablaMatrizBase
            configTable={configTableFinal}
            handleRadioClick={() => {}}
            handleCheckDelete={() => {}}
            isEditing={false}
            onSelect={handleFilaSeleccionada}
          />
        ): null
      }

      {showModalDetalle && cardDetalleConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-[60vw] max-w-[1200px]  h-[40vh] flex flex-col">
            <div className="overflow-auto flex-1">
              <Card
                title={cardDetalleConfig.title}
                layout="grid-justify"
                hidden={false}
                enabled={true}
                className={`${cardDetalleWidth} p-4 [&>*:last-child]:mb-0`}
              >
                {renderCardDetalle()}
              </Card>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t">
              <button
                className="px-4 py-2 bg-gray-200 rounded-md"
                onClick={() => setShowModalDetalle(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-indigo-500 text-white rounded-md"
                onClick={() => {
                  console.log("guardar detalle", snapshotFormRef());
                  setShowModalDetalle(false);
                }}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}



    </>
  );
};

export default PageFormatoEDL;
