import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import useNumericInput from "../hooks/useNumericInput";
import { gridSpan } from "../utils/gridSpan";

const Input = forwardRef(function Input(
  {
    label,
    type = "1",
    value = "",
    valorInicial,
    onChange,
    className = "",
    labelPosition = 0,
    enabled = true,
    span = 24,
    hidden = false,
    labelWidth = 180,
  },
  ref
) {
  const inputRef = useRef(null);
  const vi = valorInicial ?? {};
  const initialValue = useRef({ ...vi });

  const numericInput = useNumericInput(value ?? vi.valor ?? "", vi.tipo_dato ?? "0");
  const usarHook = type === "1" && !!vi.tipo_dato?.trim();
  const maxLength = type === "1" && vi.max ? Number(vi.max) : undefined;
  const [error, setError] = useState(valorInicial?.error ?? false);
  const [enabledState, setEnabledState] = useState(enabled);
  const [hiddenState, setHiddenState] = useState(hidden);

  // useEffect(() => {
  //   // SOLO DEBUG
  //   window.debugInputs = window.debugInputs || [];
  //   window.debugInputs.push(initialValue);
  // }, []);

  useEffect(() => {
    setEnabledState(enabled);
  }, [enabled]);

  useEffect(() => {
    setHiddenState(hidden);
  }, [hidden]);

  const handleChange = (e) => {
    const v = e.target.value;
    onChange?.(v);
  };

  const handleNumericChange = (e) => {
    numericInput.onChange(e);
    onChange?.(e.target.value);
  };

  let tipo = ""
  switch (type) {
    case "1":
      tipo = "text";
      break;
    case "2":
      tipo = "date";
      break;
    default:
      tipo = ""
  }

  useImperativeHandle(ref, () => ({
    getValue: () => inputRef.current?.value ?? "",
    getCampo: () => initialValue.current?.campo ?? "",
    getRequired: () => initialValue.current?.required ?? "",
    getTipoCtl: () => initialValue.current?.tipo_ctl ?? "",
    getGrupo: () => initialValue.current?.grupo ?? "",
    getNroRef: () => initialValue.current?.nro_ref ?? "",
    setValue: (v) => {
      const val = v ?? "";
      if (usarHook) {
        numericInput.setValue(val);
      }
      if (inputRef.current) {
        inputRef.current.value = val;
      }
    },
    setValor: (v) => {
      initialValue.current.valor = v ?? ""
    },
    setEnabled: (v) => { setEnabledState(!!v) },
    setHidden: (v) => { setHiddenState(!!v) },
    setError: (v) => { setError(v) },
    resetBase: () => { initialValue.current = {valor: "" } },
    focus: () => inputRef.current?.focus(),
    isEqualBase: () =>
      (inputRef.current?.value ?? "").trim().toLowerCase() ===
      (initialValue.current?.valor ?? "").trim().toLowerCase(),
    isHidden: () => hiddenState,
    isEnabled: () => enabledState,
  }));

  return (
    <div className={`${gridSpan(span)} min-w-0 w-full flex flex-col ${hiddenState ? "hidden" : ""} ${className ?? ""}`}>
      {labelPosition === 0 && (
        <label className="font-bold">{label}</label>
      )}

      <div
        className={
          labelPosition === 1
            ? `grid md:grid-cols-[minmax(0,${labelWidth}px)_1fr] items-center gap-2`
            : "grid"
        }
      >
        {labelPosition === 1 && (
          <label className="font-bold wrap-break-word">{label}</label>
        )}

        <div className="flex-1">
          <input
            ref={inputRef}
            type={tipo}
            disabled={!enabledState}
            data-placeholder={type === 2 ? "dd/mm/yyyy" : ""}
            value={usarHook ? numericInput.value : undefined}
            defaultValue={!usarHook ? value : undefined}
            onChange={usarHook ? handleNumericChange : handleChange}
            maxLength={maxLength}
            className={`border rounded px-3 py-2 outline-none w-full
             ${error ? "border-red-500" : "border-gray-300"}
             ${enabledState
                ? "bg-white text-gray-900 cursor-text"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          />
          {error && (
            <span className="text-red-500 text-sm">{label}</span>
          )}
        </div>
      </div>
    </div>
  );
});

export default Input;
