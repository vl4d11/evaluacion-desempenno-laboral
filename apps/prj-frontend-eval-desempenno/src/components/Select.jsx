import {useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { gridSpan } from "../utils/gridSpan";

const Select = forwardRef(function Select(
  {
    label,
    value = "",
    valorInicial = {},
    onChange,
    className = "",
    labelPosition = 0,
    lista,
    optionsProp,
    children,
    enabled = true,
    span = 24,
    hidden = false,
  },
  ref
) {
  const selectRef = useRef(null);
  const initialValue = useRef({ ...(valorInicial ?? {}) });
  const [error, setError] = useState(valorInicial?.error ?? false);
  const [enabledState, setEnabledState] = useState(enabled);
  const [hiddenState, setHiddenState] = useState(hidden);
  const [listaState, setListaState] = useState(lista ?? []);

  // useEffect(() => {
  //   // SOLO DEBUG
  //   window.debugInputs = window.debugInputs || [];
  //   window.debugInputs.push(initialValue);
  // }, []);

  useEffect(() => {
    setListaState(lista ?? []);
  }, [lista]);

  useEffect(() => {
    setEnabledState(enabled);
  }, [enabled]);

  useEffect(() => {
    setHiddenState(hidden);
  }, [hidden]);

  useEffect(() => {
    if (selectRef.current) {
      const current = selectRef.current.value;
      const exists = listaState.some(item => item.split("|")[0] === current);

      if (!exists) {
        selectRef.current.value = "";
      }
    }
  }, [listaState]);

  const handleChange = (e) => {
    const v = e.target.value;
    const lbl = e.target.options[e.target.selectedIndex]?.text ?? "";
    onChange?.(v, lbl);
  };

  useImperativeHandle(ref, () => ({
    getValue: () => selectRef.current?.value ?? "",
    getLabel: () => selectRef.current?.options[selectRef.current?.selectedIndex]?.text ?? "",
    getCampo: () => initialValue.current?.campo ?? "",
    getRequired: () => initialValue.current?.required ?? "",
    getTipoCtl: () => initialValue.current?.tipo_ctl ?? "",
    getGrupo: () => initialValue.current?.grupo ?? "",
    getNroRef: () => initialValue.current?.nro_ref ?? "",
    setValue: (v) => {
      if (selectRef.current) selectRef.current.value = v ?? "";
    },
    setValor: (v) => {
      initialValue.current.valor = v ?? ""
    },
    setLista: (nuevaLista) => {
      setListaState(nuevaLista ?? []);
    },
    setError: (v) => { setError(v) },
    setEnabled: (v) => { setEnabledState(!!v) },
    setHidden: (v) => { setHiddenState(!!v) },
    resetBase: () => { initialValue.current = { valor: "" } },
    focus: () => selectRef.current?.focus(),
    isEqualBase: () =>
      (selectRef.current?.value ?? "").trim().toLowerCase() ===
      (initialValue.current?.valor ?? "").trim().toLowerCase(),
    isHidden: () => hiddenState,
    isEnabled: () => enabledState,
  }));

  const addSeleccione = valorInicial.seleccion === "1";
  const defaultVal = addSeleccione
    ? ""
    : valorInicial.seleccion ?? value ?? "";

  const renderOptions = () => {
    const opts = [];
    if (addSeleccione) {
      opts.push(
        <option key="0" value="">
          SELECCIONE...
        </option>
      );
    }
    if (children) return [...opts, children];
    if (listaState) {
      opts.push(
        ...listaState.map((item) => {
          const [valueOpt, labelOpt] = item.split("|");
          return (
            <option key={valueOpt} value={valueOpt}>
              {labelOpt?.toUpperCase()}
            </option>
          );
        })
      );
    }
    if (optionsProp) {
      opts.push(
        ...optionsProp.map(({ value: val, label: lbl }, idx) => (
          <option key={idx} value={val}>
            {lbl}
          </option>
        ))
      );
    }
    return opts;
  };

  return (
    <div className={`${gridSpan(span)} min-w-0 w-full flex flex-col ${hiddenState ? "hidden" : ""} ${className ?? ""}`}>
      {labelPosition === 0 && <label className="font-bold whitespace-nowrap">{label}</label>}

      <div
        className={
          labelPosition === 1
            ? "grid md:grid-cols-[minmax(0,210px)_1fr] items-center gap-2"
            : "grid"
        }
      >
        {labelPosition === 1 && (
          <label className="font-bold wrap-break-word">{label}</label>
        )}

        <div className="flex-1">
          <select
            ref={selectRef}
            defaultValue={defaultVal}
            onChange={handleChange}
            disabled={!enabledState}
            className={`border rounded px-3 py-2 outline-none w-full
             ${error ? "border-red-500" : "border-gray-300"}
             ${enabledState
                ? "bg-white text-gray-900 cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          >
            {renderOptions()}
          </select>

          {error && (
            <span className="text-red-500 text-sm">{label}</span>
          )}
        </div>
      </div>
    </div>
  );
});

export default Select;
