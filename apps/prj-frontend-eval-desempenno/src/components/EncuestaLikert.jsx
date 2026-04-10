import { useMemo, useState } from "react";

const EncuestaLikert = ({
  nro,
  label,
  pks,
  lista = [],
  onObservacion,
  onChangeRespuesta,
  errorObs
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

  const handleObservacion = () => {
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
          className="
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
          "
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
              errorObs && !state.observacion?.trim()
                ? "bg-transparent border-red-500 text-red-600"
                : state.observacion?.trim()
                ? "bg-sky-100 border-sky-400 text-sky-700"
                : "bg-transparent border-indigo-400 text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100"
            }
          `}
        >
          Observación
        </button>

      </div>
    </div>
  );
};

export default EncuestaLikert;
