import { useMemo } from "react";

const EncuestaLikert = ({ nro, label, pks, lista = [], onObservacion }) => {

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
    if (onObservacion) onObservacion({ nro, pks, label });
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
          defaultValue=""
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
          className="
            mt-1
            w-full
            bg-transparent
            border-2
            border-indigo-400
            text-indigo-600
            text-sm
            py-2
            rounded-lg
            hover:bg-indigo-50
            active:bg-indigo-100
            transition
          "
        >
          Observación
        </button>

      </div>
    </div>
  );
};

export default EncuestaLikert;
