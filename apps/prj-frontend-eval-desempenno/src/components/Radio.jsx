import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { gridSpan } from "../utils/gridSpan";

const Radio = forwardRef(function Radio(
  {
    label,
    value = "",
    name,
    checkedValue,
    valorInicial,
    onChange,
    className = "",
    labelPosition = 0,
    enabled = true,
    span = 24,
    hidden = false,
    labelFullWidth = false,
  },
  ref
) {

  const inputRef = useRef(null);
  const vi = valorInicial ?? {};
  const initialValue = useRef({ ...vi });

  const [checked, setChecked] = useState(
    checkedValue === (value ?? vi.valor)
  );

  const [error, setError] = useState(valorInicial?.error ?? false);
  const [enabledState, setEnabledState] = useState(enabled);
  const [hiddenState, setHiddenState] = useState(hidden);

  useEffect(() => {
    setEnabledState(enabled);
  }, [enabled]);

  useEffect(() => {
    setHiddenState(hidden);
  }, [hidden]);

  useEffect(() => {
    setChecked(checkedValue === value);
  }, [checkedValue, value]);

  const handleChange = () => {
    setChecked(true);
    onChange?.(value);
  };

  useImperativeHandle(ref, () => ({
    getValue: () => checked ? value : null,
    getCampo: () => initialValue.current?.campo ?? "",
    getRequired: () => initialValue.current?.required ?? "",
    getTipoCtl: () => initialValue.current?.tipo_ctl ?? "",
    getGrupo: () => initialValue.current?.grupo ?? "",
    getNroRef: () => initialValue.current?.nro_ref ?? "",
    setValue: (v) => setChecked(v === value),
    setValor: (v) => {
      initialValue.current.valor = v;
    },
    setError: (v) => setError(v),
    setEnabled: (v) => { setEnabledState(!!v) },
    setHidden: (v) => { setHiddenState(!!v) },
    resetBase: () => { initialValue.current = { valor: null } },
    focus: () => inputRef.current?.focus(),
    isEqualBase: () =>
      value === (initialValue.current?.valor ?? null),
    isHidden: () => hiddenState,
    isEnabled: () => enabledState,
  }));

  return (
    <div className={`${gridSpan(span)} min-w-0 flex flex-row items-center ${hiddenState ? "hidden" : ""} ${className ?? ""}`}>
      <div className="flex flex-col">

        {labelPosition === 0 && (
          <label className="font-bold mb-1">
            {label}
          </label>
        )}

        <div
          className={
            labelPosition === 1
              ? labelFullWidth
                ? "flex flex-col md:flex-row items-start md:items-center gap-2 min-w-0"
                : "grid md:grid-cols-[minmax(0,100px)_1fr] items-center gap-2"
              : "grid"
          }
        >

          {labelPosition === 1 && (
            <div
              className={`font-bold ${labelFullWidth ? "w-full md:flex-1 min-w-0" : "wrap-break-word"}`}
            >
              {label}
            </div>
          )}

          <div className="flex items-center gap-3 w-full">

            <label
              className={`flex items-center gap-2 w-full select-none
                ${enabledState ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
            >

              <input
                ref={inputRef}
                type="radio"
                name={name}
                value={value}
                checked={checked}
                disabled={!enabledState}
                onChange={handleChange}
                className="sr-only peer"
              />

              <div
                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                ${checked
                  ? "border-sky-500"
                  : "border-gray-400"}
                peer-focus:ring-2 peer-focus:ring-sky-300`}
              >
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-200
                  ${checked ? "bg-sky-500" : "bg-transparent"}`}
                />
              </div>

              {labelPosition !== 1 && (
                <span className="font-bold">
                  {label}
                </span>
              )}

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

export default Radio;
