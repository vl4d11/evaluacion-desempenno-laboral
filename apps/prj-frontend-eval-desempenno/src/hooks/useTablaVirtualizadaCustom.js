/* eslint-disable react-hooks/incompatible-library */
// @react-compiler disable
import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

export const useTablaVirtualizadaCustom = (
  rows,
  rowsOriginal,
  offsetColumnas,
) => {
  const scrollBarRef = useRef(null);
  const tableContainerRef = useRef(null);

  // Total de registros (excluyendo cabeceras)
  const totalRegistros =
    rowsOriginal && rowsOriginal.length > 2 ? rowsOriginal.length - 2 : 0;

  const titulo = useMemo(
    () =>
      rowsOriginal && rowsOriginal.length > 1 ? rowsOriginal[0].split("|") : [],
    [rowsOriginal],
  );

  // Cabecera
  const cabecera = useMemo(() => {
    if (rowsOriginal && rowsOriginal.length > 1) {
      return rowsOriginal[1].split("|").map((val, i) => {
        const ancho = Number(val);
        return [titulo[i], ancho];
      });
    }
    return [];
  }, [rowsOriginal, titulo]);

  const cabeceraFiltrada = useMemo(() => {
    return cabecera.slice(offsetColumnas);
  }, [cabecera, offsetColumnas]);

  const totalWidth = useMemo(
    () => cabeceraFiltrada.reduce((acc, col) => acc + col[1], 0),
    [cabeceraFiltrada],
  );

  const virtualCount =
    rowsOriginal && rows.length === rowsOriginal.length
      ? Math.max(0, rows.length - 2)
      : rows.length;

  // Virtualizador
  const rowVirtualizer = useVirtualizer({
    count: virtualCount,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 35,
    measureElement: null,
    overscan: 10,
  });

  // Scroll sincronizado
  const syncScroll = (source) => {
    if (!tableContainerRef.current || !scrollBarRef.current) return;
    window.requestAnimationFrame(() => {
      if (source === "table") {
        scrollBarRef.current.scrollLeft = tableContainerRef.current.scrollLeft;
      } else {
        tableContainerRef.current.scrollLeft = scrollBarRef.current.scrollLeft;
      }
    });
  };

  return {
    totalRegistros,
    titulo,
    cabeceraFiltrada,
    totalWidth,
    rowVirtualizer,
    scrollBarRef,
    tableContainerRef,
    syncScroll,
  };
};
