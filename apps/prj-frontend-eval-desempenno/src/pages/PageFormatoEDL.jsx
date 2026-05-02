import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useLocation } from "react-router-dom";
import CryptoJS from "crypto-js";

import { useFetch } from "../hooks/useFetch";
import useLazyFetch from "../hooks/useLazyFetch";
import { useWidthMap } from "../hooks/useWidthMap";

import Card from "../components/Card"
import Input from "../components/Input"
import TextArea from "../components/TextArea";
import Select from "../components/Select";
import Checkbox from "../components/Checkbox";
import Radio from "../components/Radio"
import { BaseTablaMatrizBase } from "../components/BaseTablaMatrizBase";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AlertDialog } from "../components/AlertDialog";


const PageFormatoEDL = () => {
  const API_RESULT_LISTAR = "/llamada/fetch/listaFormatoEv";
  const API_RESULT_MANTEN = "/llamada/fetch/grabar_formatoEval"
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
  const { runFetch } = useLazyFetch();

  const [isLoading, setIsLoading] = useState(false);
  const [malResult, setMalResult] = useState("")
  const [sentOK, setsentOK] = useState(true);

  const [configTable, setConfigTable] = useState(null);
  const [listaData, setListaData] = useState([]);

  const [mapaListas, setMapaListas] = useState({});
  const [isGrabarDisabled, setIsGrabarDisabled] = useState(true);
  const STEP = Object.freeze({
    CAB_DET: 0,
    SOLO_CAB: 1,
    SOLO_DET: 2,
  });
  const [showModalDetalle, setShowModalDetalle] = useState(
    { open: false, title: "" }
  );
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
  const [filaSeleccionadaConIndex, setFilaSeleccionadaConIndex] = useState(null);
  const [alertState, setAlertState] = useState({
    visible: false,
    message: "",
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
  }, []);

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

  const safe = (v) =>
    (v ?? '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const buildHashString = (...vals) => vals.join("|");

  const esperarRenderCompleto = () =>
    new Promise((resolve) =>
      requestAnimationFrame(() =>
        requestAnimationFrame(resolve)
      )
    );

  const obtenerCambiosDetalle = () => {
    if (!listaData || listaData.length === 0) return [];
    const resultado = [];

    for (let i = 2; i < listaData.length; i++){
      const item = listaData[i]
      const [hash, pk, pkPadre, codComp, porc, disp] = item.split("|");
      const values = [
        safe(pk),
        safe(pkPadre),
        safe(codComp),
        safe(porc),
        safe(disp),
      ];

      const hashCompara = CryptoJS.MD5(buildHashString(...values))
        .toString(CryptoJS.enc.Hex);

      if (hash !== hashCompara) {
        resultado.push(values.join("|"));
      }
    }
    return resultado;
  }

  const openModal = (title) => {
    setShowModalDetalle({ open: true, title });
  };

  const closeModal = () => {
    setShowModalDetalle(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (!malResult) return;
    const timer = setTimeout(() => {
      setMalResult("");
    }, 2000);
    return () => clearTimeout(timer);
  }, [malResult]);

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

  useEffect(() => {
    if (!showModalDetalle.open || !isEditModeRef.current) return;
    const metaLista = metaListaFormatDetail.split("|");

    metaLista.forEach((idxRef, i) => {
      const idx = Number(idxRef);
      if (!idx) return;
      const value = detalleSeleccionado?.[i];
      if (value !== undefined) {
        const ref = currentRef.current[idx];
        if (!ref) return;

        let valTmp
        valTmp =
          ref?.getTipoCtl?.() === "3"
            ? value === "1"
              ? true
              : value === "0"
                ? false
                : Boolean(value)
            : value;

        if (idxRef === "15" && valTmp !== "") {
          const num = Number(valTmp);
          if (!isNaN(num) && num % 1 !== 0) {
            valTmp = String(Math.round(num * 100))
          }
        }


        ref?.setValue?.(valTmp);
        if (typeof ref?.setValor === "function") {
          ref.setValor(valTmp);
        } else {
          ref.valor = valTmp;
        }
      }
    });
  }, [showModalDetalle, detalleSeleccionado, metaListaFormatDetail]);

  // const mapa = mapaListas?.[42]
  // useEffect(() => {
  //   console.log("listaData REAL:", mapa)
  // },[mapa])

  const forEachRef = (refArray, callback) => {
    Object.values(refArray.current).forEach((ref) => {
      if (ref) callback(ref);
    });
  };

  const transformarValor = (grupo, val, nroRef, grabar = false) => {
    let value =
      typeof val === "string"
        ? val.trim()
        : typeof val === "boolean"
          ? val ? "1" : "0"
          : val ?? "";

    if (value === "") return "";

    if (grabar) {
      const debeMultiplicar =
        (grupo === "1" && ["4", "6"].includes(nroRef)) ||
        (grupo === "4" && ["15"].includes(nroRef));

      if (debeMultiplicar) {
        const num = Number(value);
        return isNaN(num) ? value : (num / 100).toFixed(2);
      }
    }
    return value;
  };

  const snapshotFormRef_ByGrupo = (refArray, grupo, esNuevo, pks = {}, grabar = false) => {
    const dataCampoPlano = [];
    const dataValorPlano = [];

    const dataValorCompleta = []
    const dataCampoCtrl = [];
    const dataValorCtrl = [];
    let pasa = true;
    let pkIndex = 0;

    forEachRef(refArray, (ref) => {
      const grupoRef =
        typeof ref?.getGrupo === "function"
          ? ref.getGrupo()
          : ref.grupo;

      if (grupo && grupoRef !== grupo) return;
      const isControl = typeof ref?.getValue === "function";

      if (!isControl) {
        const campo = ref.campo;
        if (!campo) return;
        if (esNuevo && pks.length > pkIndex) {
          ref.valor = pks[pkIndex++];
        }
        const value = ref.valor ?? "";
        dataCampoPlano.push(campo);
        dataValorPlano.push(value);

        dataValorCompleta.push(value)
        return;
      }

      ref.setError(false);
      const required = ref.getRequired?.();
      const isEqual = ref.isEqualBase?.();
      const nroRef = ref.getNroRef?.();
      const campo = ref.getCampo?.();
      const val = ref.getValue?.();
      if (!campo) return;

      const value = transformarValor(grupoRef, val, nroRef, grabar);

      if (required === "1" && value === "") {
        ref.setError(true);
        pasa = false;
      }
      if (esNuevo) {
        dataCampoCtrl.push(campo);
        dataValorCtrl.push(value);
      } else {
        if (!isEqual) {
          dataCampoCtrl.push(campo);
          dataValorCtrl.push(value);
        }
      }

      dataValorCompleta.push(value)
    });

    return {
      dataCampoPlano,
      dataValorPlano,
      dataCampoCtrl,
      dataValorCtrl,
      pasa,
      dataValorCompleta
    };
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
    return;
  }

  const setLimpiarCtls = () => {
    forEachRef(currentRef, (ref) => {
      if (!ref) return;
      if (typeof ref.setValue === "function") {
        const tipo = ref.getTipoCtl?.();
        ref.setValue(["3", "4"].includes(tipo) ? "1" : "");
        ref.setError(false);
      }
      if ("valor" in ref) {
        ref.valor = "";
      }
    });
    setListaData([])
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

  const handleFilaSeleccionada = ({ fila, index }) => {

    console.log("fila seleccionada:", fila)

    setFilaSeleccionadaConIndex({ fila, index });
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

            if (ref.getNroRef() === "17") {
              console.log("mensaje:",valTmp)
            }

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
            String(Math.round(Number(por) *100)),
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
      openModal("Editar");
    }
  }

  const handleNuevoDetalle = () => {
    isEditModeRef.current = false;
    setDetalleSeleccionado(null);
    snapshotFormRef_Clean(currentRef, "4");
    openModal("Nuevo");
  }

  const buildFila = (data, lista14, esNuevo = true, hashOriginal = "") => {
    const transforms = {
      0: () => [esNuevo ? "" : hashOriginal],
      1: (_, __, datos) =>
        datos.map((item, i) =>
          i === 3 && item !== ""
            ? (Number(item) / 100).toFixed(2)
              : item
        ),
      2: (item) => [lista14
          .find(p => p.split("|")[0] === item)
          ?.split("|")[1] ?? ""],
      3: (item) => [item],
      4: (item) => [item === "1" ? "SI" : "NO"],
    };

    return data
      .flatMap((item, idx, datos) => transforms[idx]?.(item, idx, datos) ?? [])
      .join("|");
  };

  const handleAceptarModal = () => {
    const NUEVO_DETALLE = !isEditModeRef.current;
    const titulo = cardRef.current[1].getTitle();
    const NUEVO_GLOBAL = titulo.toUpperCase().startsWith("NUEVO");

    const indice = currentRef.current[1].valor
    const pks = [null, indice]
    const {
      dataCampoPlano,
      dataValorPlano,
      dataCampoCtrl,
      dataValorCtrl,
      pasa,
      dataValorCompleta
    } = snapshotFormRef_ByGrupo(currentRef, "4", NUEVO_DETALLE, pks);

    if (!pasa) return;
    if (dataCampoCtrl.length === 0) {
      setAlertState({
        visible: true,
        message: "NO existen Datos modificados...",
      });
      return;
    }

    closeModal();
    const dataValor = [...dataValorPlano, ...dataValorCtrl]
    const filaNuevo = buildFila(dataValor, mapaListas?.[14], true);

    const hashOriginal =  filaSeleccionadaConIndex?.fila[0]
    const filaEdit = buildFila(
      dataValorCompleta,
      mapaListas?.[14],
      false,
      hashOriginal
    );

    const updateState = (extraConfig = {}, buildLista) => {
      setListaData(prev => {
        const nuevaLista = buildLista(prev);
        setConfigTable({
          ...configTableBase,
          offsetColumnas: 6,
          ...extraConfig,
          listaDatos: nuevaLista,
        });
        return nuevaLista;
      });
    };

    if (NUEVO_DETALLE) {
      if (NUEVO_GLOBAL) cardRef.current[2]?.setHidden(true);
      updateState(
        {
          title: "Detalle Formato de Evaluación Desempeño :",
          isPaginar: false,
        },
        (prevLista) => {
          let nuevaLista;
          if ((prevLista ?? []).length <= 2) {
            let labelGrillaDeta = (prevLista ?? []).slice(0, 2);

            if (labelGrillaDeta.length === 0 && NUEVO_GLOBAL) {
              labelGrillaDeta = mapaListas?.[42]?.slice(1, 3) ?? [];
            }

            nuevaLista = NUEVO_GLOBAL
              ? [...labelGrillaDeta, filaNuevo]
              : [filaNuevo];
          } else {
            nuevaLista = [
              ...(prevLista ?? []),
              filaNuevo
            ];
          }
        return nuevaLista;
      });
    } else {
      const fila = filaEdit;
      const idFila = fila.split("|")[1];

      updateState(
        {
          title: "Detalle Formato de Evaluación Desempeño :",
          isPaginar: false,
        },
        (prevLista) =>
          (prevLista ?? []).map((row, idx) => {
            const rowId = row.split("|")[1];
            if (idFila) {
              return rowId === String(idFila) ? fila : row;
            } else if (filaSeleccionadaConIndex?.index !== undefined) {
              return idx === filaSeleccionadaConIndex.index ? fila : row;
            }
            return row;
        })
      );
    }
  }

  const getCamposPorGrupo = (refArray, grupo) => {
    const campos = [];
    forEachRef(refArray, (ref) => {
      const grupoRef =
        typeof ref?.getGrupo === "function" ? ref.getGrupo() : ref.grupo;
      if (grupo && grupoRef !== grupo) return;
      const isControl = typeof ref?.getValue === "function";
      let campo;
      if (isControl) {
        campo = ref.getCampo?.()
      } else {
        campo = ref.campo
      }
      if(campo) campos.push(campo)
    });
    return [campos.length, ...campos].join("|");
  };

  const snapshotSimpleByGrupo = (refArray, grupo, clave = "", asignar = false) => {
    const valores = [];

    forEachRef(refArray, (ref) => {
      const grupoRef =
        typeof ref?.getGrupo === "function"
          ? ref.getGrupo()
          : ref.grupo;

      if (grupo && grupoRef !== grupo) return;
      const isControl = typeof ref?.getValue === "function";
      let value;
      let posicion;

      if (isControl) {
        const val = ref.getValue?.();
        value =
          typeof val === "string"
            ? val.trim()
            : typeof val === "boolean"
              ? val ? "1" : "0"
              : val ?? "";

        posicion = Number(ref.getPosi?.() ?? 0);

        if (asignar && typeof ref?.setValor === "function") {
          ref.setValor(value);
        }

      } else {

        if (ref.grupo === "1" && Number(ref.nroRef) === 1) {
          ref.valor = clave
        }

        value = ref.valor ?? ""
        posicion = Number(ref.posicion ?? 0);
      }
      valores.push({ posicion, value });
    });

    return valores
      .sort((a,b)=> a.posicion - b.posicion)
      .map(v=>v.value)
      .join("|");
  };

  const handleApiEnvio = async (datosEnv, step) => {
    if (isLoading) return;
    setIsLoading(true);
    setMalResult("");

    console.log("Datos Enviar al backend:", datosEnv)

    const titulo = cardRef.current[1].getTitle();
    const NUEVO = titulo.toUpperCase().startsWith("NUEVO");
    const formData = new FormData();
    formData.append("data", datosEnv);
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
        setSelected(null)
        cardRef.current[1].setTitle("Editar Formato de Evaluación :")

        console.log("Rpsta del API:", result)

        if (NUEVO) {
          console.log("STEP.CAB_DET", step)

          const listaResult = result.split("|")
          const clave = listaResult[0]
          const listaDetalle = listaResult.slice(1)

          await esperarRenderCompleto();
          const listaCabecera = snapshotSimpleByGrupo(currentRef, "1", clave, true)

          console.log("listaCabecera", listaCabecera)

          const lsGrl = listaData.slice(2).map((item, idx) => {
            const partes = item.split("|");
            const pk = safe(listaDetalle[idx] ?? "");
            const pkPadre = safe(clave);
            const codComp = safe(partes[3]);
            const porc = safe(partes[4]);
            const disp = safe(partes[5]);
            const values = [pk, pkPadre, codComp, porc, disp];
            const hash = CryptoJS.MD5(buildHashString(...values)).toString(CryptoJS.enc.Hex);
            partes[0] = hash;
            partes[1] = pk;
            partes[2] = pkPadre;
            return partes.slice(0, 6).join("|");
          })

          setMapaListas(prev => ({
            ...prev,
            41: [...(prev[41] ?? []), listaCabecera],
            42: [...(prev[42] ?? []), ...lsGrl]
          }));

          const listaActual = configTable?.listaDatos ?? [];
          let idxLs = 0;

          const nuevaLista = listaActual.map((row, index) => {
            if (index < 2) return row;
            const partes = row.split("|");

            if (!partes[1] && lsGrl[idxLs]) {
              const nuevasPartes = lsGrl[idxLs++].split("|");
              for (let i = 0; i < 6; i++) {
                partes[i] = nuevasPartes[i];
              }
              return partes.join("|");
            }nuevaLista
            return row;
          });

          setListaData(nuevaLista);
          setConfigTable({
            ...configTableBase,
            title: "Detalle Formato de Evaluación Desempeño :",
            isPaginar: false,
            offsetColumnas: 6,
            listaDatos: nuevaLista
          });

        } else {
          if (step === STEP.SOLO_CAB) {
            console.log("EDITAR STEP.SOLO_CAB", step)

            await esperarRenderCompleto();
            const listaCabecera = snapshotSimpleByGrupo(currentRef, "1", result, true)

            setMapaListas(prev => ({
              ...prev,
              41: (prev[41] ?? []).map(item => {
                const key = item.split("|")[0];
                return key === String(result) ? listaCabecera : item;
              }),
            }));
          }
          if (step === STEP.SOLO_DET) {
            console.log("EDITAR STEP.SOLO_DET", step)

            const listaResult = result.split("|")
            const existingPk = new Set(
              listaData.slice(2).map(item => safe(item.split("|")[1]))
            );
            const usados = new Set();
            const nuevosPkQueue = listaResult
              .map(r => safe(r))
              .filter(r => r !== "");

            const listaTemp = listaData.slice(0, 2)
            const listaTempFiltrado = listaData.slice(2).map((item) => {
              const partes = item.split("|");
              const pkActual = safe(partes[1]);
              const nuevoPk = safe(nuevosPkQueue[0] ?? "");
              if (pkActual !== "") {
                return item;
              }
              if (!nuevoPk) {
                return item;
              }
              if (existingPk.has(nuevoPk) || usados.has(nuevoPk)) {
                return item;
              }
              const pkPadre = safe(partes[2]);
              const codComp = safe(partes[3]);
              const porc = safe(partes[4]);
              const disp = safe(partes[5]);
              const values = [nuevoPk, pkPadre, codComp, porc, disp];
              const hash = CryptoJS.MD5(buildHashString(...values)).toString(CryptoJS.enc.Hex);
              partes[0] = hash;
              partes[1] = nuevoPk;
              usados.add(nuevoPk);
              nuevosPkQueue.shift();
              return partes.join("|");
            })
            listaTemp.push(...listaTempFiltrado)
            setListaData(listaTemp)


            const lsGrl = listaTempFiltrado.map(item =>
              item.split("|").slice(0, 6).join("|")
            );

            const mapLsGrl = new Map(
              lsGrl.map(r => {
                const p = r.split("|");
                return [safe(p[1]), r];
              })
            );
            const setPkPadre = new Set(
              lsGrl.map(r => safe(r.split("|")[2]))
            );
            const setPkHijo = new Set(listaResult.map(r => safe(r)));
            const nuevosItems = [];

            // NOTA: TAMBIEN ACA PUEDE EXISTS CAB_DET
            // =====================================

            setMapaListas(prev => {
              const lista42 = prev[42] ?? [];
              const actualizados = lista42.map(item => {
                const partes = item.split("|");
                const pk = safe(partes[1]);
                const pkPadre = safe(partes[2]);
                if (setPkPadre.has(pkPadre) && setPkHijo.has(pk)) {
                  const nuevo = mapLsGrl.get(pk);
                  if (nuevo) return nuevo;
                }
                return item;
              });
              for (const [pk, value] of mapLsGrl.entries()) {
                const existe = lista42.some(item => {
                  const p = item.split("|");
                  return safe(p[1]) === pk;
                });
                if (!existe) {
                  nuevosItems.push(value);
                }
              }
              return {
                ...prev,
                42: [...actualizados, ...nuevosItems],
              };
            });
          }
          if (step === STEP.CAB_DET) {

            console.log("EDITAR STEP.CAB_DET", step)
          }
        }
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

  const handleRecopilaPreGrabar = async () => {
    const titulo = cardRef.current[1].getTitle();
    const NUEVO = titulo.toUpperCase().startsWith("NUEVO");
    const indice = currentRef.current[1].valor
    const pks = [indice]

    await esperarRenderCompleto();
    const {
      dataCampoPlano,
      dataValorPlano,
      dataCampoCtrl,
      dataValorCtrl,
      pasa
    } = snapshotFormRef_ByGrupo(currentRef, "1", NUEVO, pks, true);

    if (!pasa) {
      return;
    } else if (dataCampoCtrl.length === 0) {

      const cambioDetalle = obtenerCambiosDetalle();
      if (cambioDetalle.length > 0) {

        const listaDetalleEnviar = "~".concat([
          usuario.split("|")[0],
          getCamposPorGrupo(currentRef, "4"),
          cambioDetalle.join("|")
        ].join("|"));

        setShowConfirm({
          visible: true,
          message: "¿Cambios en detalle, Deseas Guardar ?",
          onConfirm: () => {
            handleApiEnvio(listaDetalleEnviar, STEP.SOLO_DET);
          }
        })

      } else {
        setAlertState({
          visible: true,
          message: "NO existen Datos modificados...",
        });
      }

    } else {
      if (NUEVO && listaData?.length === 0) {
        setAlertState({
          visible: true,
          message: "Debe almenos tener un registro de Detalle...",
        });
      } else {
        const dataCampo = dataCampoPlano.concat(dataCampoCtrl).join("|")
        const dataValor = dataValorPlano.concat(dataValorCtrl).join("|")

        const listaCabecera =
          [usuario.split("|")[0], dataCampo, dataValor].join("|")

        if (NUEVO) {
          const listaDetalle = listaData
            .slice(2)
            .flatMap(item => item.split("|").slice(1, 6))
            .join("|");

          const listaDetalleEnviar =
            [getCamposPorGrupo(currentRef, "4"), listaDetalle].join("|")

          const dataEnviar =
            [listaCabecera, listaDetalleEnviar].join("~")

          setShowConfirm({
            visible: true,
            message: "¿Deseas Guardar la Informacion ?",
            onConfirm: () => {
              handleApiEnvio(dataEnviar, STEP.CAB_DET);
            }
          })

        } else {

          const cambioDetalle = obtenerCambiosDetalle();
          if (cambioDetalle.length > 0) {
            const listaDetalleEnviar =
              [getCamposPorGrupo(currentRef, "4"), cambioDetalle].join("|")
            const dataEnviar =
              [listaCabecera, listaDetalleEnviar].join("~")

            setShowConfirm({
              visible: true,
              message: "¿Cambios en Cabecera y Detalle, Deseas Guardar ?",
              onConfirm: () =>{
                handleApiEnvio(dataEnviar, STEP.CAB_DET);
              }
            })

          } else {
            const dataEnviar = listaCabecera.concat("~");
            setShowConfirm({
              visible: true,
              message: "¿Cambios solo en Cabecera, Deseas Guardar ?",
              onConfirm: () => {
                handleApiEnvio(dataEnviar, STEP.SOLO_CAB);
              }
            });
          }
        }
      }
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

  const renderCardDetalle = () =>
    informacion
      .map((item) => {
        const [grupo, posicion] = item.metadata[6]?.split(".") ?? [];
        return { ...item, grupo, posicion };
      })
      .filter((item) => item.grupo === "4")
      .map((item, idx) => renderCampo(item, idx));


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
            handleRecopilaPreGrabar();
          }}
          >
            {isLoading ? "Guardando..." : "Grabar"}
          </button>
          <button className="px-8 py-2 rounded-md shadow-sm bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer"
            onClick={()=>setLimpiarCtls()}
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
            enabled={!["1"].includes(refId)}
            className={widthMap[ancho]}
            ref={(el) => (cardRef.current[refId] = el)}
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

      {configTableFinal?.listaDatos?.length ? (
          <BaseTablaMatrizBase
            configTable={configTableFinal}
            handleRadioClick={() => {}}
            handleCheckDelete={() => {}}
            isEditing={false}
            onSelectWithIndex={handleFilaSeleccionada}
          />
        ): null
      }

      {showModalDetalle.open && cardDetalleConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-[60vw] max-w-300  h-[40vh] flex flex-col">
            <div className="overflow-auto flex-1">
              <Card
                title={[showModalDetalle.title, cardDetalleConfig?.title].filter(Boolean).join(" ")}
                layout="grid-justify"
                hidden={false}
                enabled={true}
                className={`${cardDetalleWidth} p-4 [&>*:last-child]:mb-0`}
                ref={(el) => (cardRef.current[cardDetalleConfig.refId] = el)}
              >
                {renderCardDetalle()}
              </Card>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t">
              <button
                className="px-4 py-2 bg-gray-200 rounded-md"
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-indigo-500 text-white rounded-md"
                onClick={handleAceptarModal}
              >
                Agregar
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

export default PageFormatoEDL;
