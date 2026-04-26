import { useMemo, useState, useEffect } from "react";

const EncuestaLikert = ({
  nro,
  label,
  pks,
  titleGrupo = "",
  lista = [],
  onObservacion,
  onChangeRespuesta,
  errorObs,
  disabled = false,
  initialValues = [],
  mostrarObservacion = true,
}) => {

  const [state, setState] = useState({
    value: "",
    pk: pks,
    observacion: ""
  });

  const opciones = useMemo(() => {
    return lista.map(item => {
      const [text, value] = item.split("|");
      return {
        value: value?.trim(),
        label: text?.trim()
      };
    });
  }, [lista]);

  useEffect(() => {
    if (!Array.isArray(initialValues) || !initialValues.length) return;
    const found = initialValues.find(item => {
      const [pk] = item.split("|");
      return pk === String(pks);
    });
    if (found) {
      const [, value] = found.split("|");
      const cleanValue = value?.trim() ?? "";
      setState(prev => {
        if (prev.value === cleanValue) return prev;
        return {
          ...prev,
          value: cleanValue
        };
      });
      onChangeRespuesta?.({
        pk: pks,
        value: cleanValue,
        clearError: true
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, pks]);

  const handleObservacion = () => {
    if (disabled) return;
    if (!state.value) return;
    if (onObservacion) {
      onObservacion({
        pk: pks,
        onSave: (texto) => {

          setState(prev => ({
            ...prev,
            observacion: texto
          }));

          onChangeRespuesta?.({
            pk: pks,
            observacion: texto
          });
        }
      });
    }
  };

  const handleChange = (e) => {
    if (disabled) return;
    const val = e.target.value;

    setState(prev => ({
      ...prev,
      value: val
    }));

    onChangeRespuesta?.({
      pk: pks,
      value: val,
      clearError: true
    });
  };

  return (
    <div className="block md:hidden w-full px-4 py-3">

      {titleGrupo && (
        <div className="
          mb-3
          px-4
          py-2.5
          rounded-lg
          bg-slate-100
          border
          border-slate-400
          text-base
          font-bold
          text-slate-800
          shadow-sm
        "
        >
          {titleGrupo}
        </div>
      )}

      <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 flex flex-col gap-3">
        <label className="flex items-center gap-2">
          <span className="
            bg-blue-600
            text-white
            text-xs
            font-semibold
            w-6
            h-6
            flex
            items-center
            justify-center
            rounded-full
            shadow-sm
            "
          >
            {nro}
          </span>
          <span className="
            text-left
            font-normal
            text-gray-800
            leading-tight
            text-[15px]
           "
          >
            {label}
          </span>
        </label>

        <select
          value={state.value}
          onChange={handleChange}
          disabled={disabled}
          className={`
            w-full
            border
            border-gray-300
            rounded-lg
            px-3
            py-2
            text-sm
            focus:outline-none
            focus:ring-2
            focus:ring-indigo-500
            ${state.value ? "font-bold text-gray-900" : "text-gray-500"}
            ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
          `}
        >
          <option value="" disabled>
            SELECCIONE...
          </option>
          {opciones.map((opt, idx) => (
            <option key={idx} value={opt.value}>
              {opt.label?.toUpperCase()}
            </option>
          ))}
        </select>

        {mostrarObservacion && (
            <button
              onClick={handleObservacion}
              className={`
                mt-1
                w-full
                border-2
                text-sm
                py-2
                rounded-lg
                transition
                ${
                  disabled
                    ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                    : errorObs && !state.observacion?.trim()
                      ? "bg-transparent border-red-500 text-red-600"
                      : state.observacion?.trim()
                      ? "bg-sky-100 border-sky-400 text-sky-700"
                      : "bg-transparent border-indigo-400 text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100"
                }
              `}
            >
              Observación
            </button>
          )
        }

      </div>
    </div>
  );
};

export default EncuestaLikert;
