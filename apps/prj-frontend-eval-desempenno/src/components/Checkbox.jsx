import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { gridSpan } from "../utils/gridSpan";

const Checkbox = forwardRef(function Checkbox(
  {
    label,
    label2 = "",
    value = false,
    valorInicial,
    onChange,
    className = "",
    labelPosition = 0,
    enabled = true,
    span = 24,
    hidden = false,
    labelFullWidth = false,
    labelWidth = 180,
  },
  ref
) {

  const inputRef = useRef(null);
  const vi = valorInicial ?? {};
  const initialValue = useRef({ ...vi });

  const [checked, setChecked] = useState(value ?? vi.valor ?? false);
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

  const handleChange = (v) => {
    setChecked(v);
    onChange?.(v);
  };

  useImperativeHandle(ref, () => ({
    getValue: () => checked,
    getCampo: () => initialValue.current?.campo ?? "",
    getRequired: () => initialValue.current?.required ?? "",
    getTipoCtl: () => initialValue.current?.tipo_ctl ?? "",
    setValue: (v) => setChecked(!!v),
    setValor: (v) => {
      initialValue.current.valor = (v === "1" || v === 1 || v === true);
    },
    setError: (v) => setError(v),
    setEnabled: (v) => { setEnabledState(!!v) },
    setHidden: (v) => { setHiddenState(!!v) },
    resetBase: () => { initialValue.current = { valor: false } },
    focus: () => inputRef.current?.focus(),
    isEqualBase: () =>
      Boolean(checked) === Boolean(initialValue.current?.valor ?? false),
    isHidden: () => hiddenState,
    isEnabled: () => enabledState,
  }));

  return (
    <div className={`${gridSpan(span)} min-w-0 w-full flex flex-col ${hiddenState ? "hidden" : ""} ${className ?? ""}`}>
      <div className="flex flex-col">
        {labelPosition === 0 && (
          <label className="font-bold">
            {label2 !== "" ? (checked ? label : label2) : `${label} ${checked ? " SI" : " NO"}`}
          </label>
        )}

        <div
          className={
            labelPosition === 1
            ? labelFullWidth
              ? "flex flex-col md:flex-row items-start md:items-center gap-2 min-w-0"
              : `grid md:grid-cols-[minmax(0,${labelWidth}px)_1fr] items-center gap-2`
            : "grid"
          }
        >
          {labelPosition === 1 && (
            <label
              className={
              `font-bold ${labelFullWidth ? "w-full md:flex-1 min-w-0" : "wrap-break-word"}`
              }
              style={labelFullWidth ? { display: "flex", alignItems: "center" } : {}}
            >
              {label2 !== "" ? (checked ? label : label2) : `${label} ${checked ? " SI" : " NO"}`}
            </label>
          )}

          <div className="flex items-center gap-3">
            <label className={`relative inline-flex items-center select-none ${enabledState ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}>

              <input
                ref={inputRef}
                type="checkbox"
                checked={checked}
                disabled={!enabledState}
                onChange={(e) => handleChange(e.target.checked)}
                className="sr-only peer"
              />

              {/* Track */}
              <div
                className={`w-14 h-6 rounded-full transition-all duration-300
                ${checked
                  ? "bg-sky-400 shadow-inner"
                  : "bg-gray-300"}
                peer-focus:ring-2 peer-focus:ring-sky-300`}
              />

              {/* Knob */}
              <div
                className={`absolute left-[2px] top-[2px]
                w-5 h-5 bg-white rounded-full shadow-md
                transition-transform duration-300
                ${checked ? "translate-x-8" : ""}`}
              />

            </label>

            {error && (
              <span className="text-red-500 text-sm">{label}</span>
            )}

          </div>
        </div>
      </div>
    </div>
  );
});

export default Checkbox;
