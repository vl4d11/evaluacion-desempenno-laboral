import { useState, useCallback } from "react";

const useNumericInput = (initialValue = "", tipoDato = "0") => {
  const [value, setValue] = useState(initialValue);

  const onChange = useCallback((e) => {
    let next = e.target.value;
    if (tipoDato === "3") {
      next = next.toUpperCase();
    }

    const patterns = {
      //permite caracteres alfanumericos limitados
      "0": /^[\w\s.,;:!?()\-]*$/,
      // numeros enteros
      "1": /^\d*$/,
      // numeros decimales
      "2": /^\d*(\.\d{0,4})?$/,
      //solo mayusculas limitado
      "3": /^[A-Z\s.,;:!?()\-]*$/
    };

    if (patterns[tipoDato]?.test(next)) {
      setValue(next);
    }
  }, [tipoDato]);

  return {
    value,
    onChange,
    setValue,
  };
};

export default useNumericInput;
