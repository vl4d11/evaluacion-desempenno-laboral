import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { gridSpan } from "../utils/gridSpan";

const TextArea = forwardRef(function TextArea(
  {
    label,
    value = "",
    valorInicial,
    onChange,
    className = "",
    labelPosition = 0,
    rows = 6,
    width = "50%",
    enabled = true,
    span = 24,
    hidden = false,
  },
  ref
) {
  const inputRef = useRef(null);
  const initialValue = useRef({ ...(valorInicial ?? {}) });
  const maxLength = valorInicial?.max ?? undefined;
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
    const v = e?.target?.value ?? "";
    onChange?.(v);
  };

  useImperativeHandle(ref, () => ({
    getValue: () => inputRef.current?.value ?? "",
    getCampo: () => initialValue.current?.campo ?? "",
    getRequired: () => initialValue.current?.required ?? "",
    getTipoCtl: () => initialValue.current?.tipo_ctl ?? "",
    getGrupo: () => initialValue.current?.grupo ?? "",
    getNroRef: () => initialValue.current?.nro_ref ?? "",
    setValue: (v) => {
      if (inputRef.current) inputRef.current.value = v ?? "";
    },
    setValor: (v) => {
      initialValue.current.valor = v ?? ""
    },
    setError: (v) => { setError(v) },
    setEnabled: (v) => { setEnabledState(!!v) },
    setHidden: (v) => { setHiddenState(!!v) },
    resetBase: () => { initialValue.current = { valor: "" } },
    focus: () => inputRef.current?.focus(),
    isEqualBase: () =>
      (inputRef.current?.value ?? "").trim().toLowerCase() ===
      (initialValue.current?.valor ?? "").trim().toLowerCase(),
    isHidden: () => hiddenState,
    isEnabled: () => enabledState,
  }));

  return (
    <div
      className={`${gridSpan(span)} min-w-0 w-full flex flex-col ${hiddenState ? "hidden" : ""} ${className ?? ""}`}
      style={{ width }}
    >
      {labelPosition === 0 && (
        <label className="font-bold">{label}</label>
      )}

      <div
        className={
          labelPosition === 1
            ? "grid md:grid-cols-[minmax(0,180px)_1fr] items-center gap-2"
            : "grid"
        }
      >
        {labelPosition === 1 && (
          <label className="font-bold wrap-break-word">{label}</label>
        )}
        <textarea
          ref={inputRef}
          defaultValue={value}
          rows={rows}
          maxLength={maxLength}
          disabled={!enabledState}
          onChange={(e) => {
            const v = e.target.value;
            const numRows = v.split("\n").length;
            if (numRows < 7) {
              handleChange(e);
            } else {
              const limited = v.split("\n").slice(0, 6).join("\n");
              inputRef.current.value = limited;
              handleChange({target: {value: limited}});
            }
          }}
          className={`border rounded px-3 py-2 outline-none resize-none
          ${error ? "border-red-500" : "border-gray-300"}
          ${enabledState
             ? "bg-white text-gray-900"
             : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        />

        {error && (
          <span className="text-red-500 text-sm">{label}</span>
        )}
      </div>
    </div>
  );
});

export default TextArea;
