import { useState, useEffect, useCallback, useMemo, memo, useRef, forwardRef, useImperativeHandle } from "react";
import Loader from "./Loader";
import { useTablaVirtualizadaCustom } from "../hooks/useTablaVirtualizadaCustom";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

const Fila = memo(
  ({
    virtualRow,
    filaFiltrada,
    isEven,
    isSelected,
    effectiveWidth,
    cabeceraFiltrada,
    onClick,
    onDoubleClick,
    listaLength,
    showRowNumber,
    rowNumber,
    opcionesRadio,
    onObsClick,
    radioState,
    onRadioChange,
    rowKey,
    tieneError,
    disabled,
  }) =>
  (
    <div
      data-row-index={virtualRow.index}
      onClick={disabled ? undefined : onClick}
      onDoubleClick={disabled ? undefined : onDoubleClick}
      className={`
        absolute left-0 flex border-b border-gray-200 transition-colors duration-150
        ${disabled ? "opacity-60 pointer-events-none" : "cursor-pointer"}
        ${isSelected ? "bg-indigo-200" : isEven ? "bg-white" : "bg-gray-50"}
        hover:bg-indigo-100 active:bg-indigo-300
      `}
      style={{
        transform: `translateY(${virtualRow.start}px)`,
        width: `${effectiveWidth}px`,
      }}
    >
      {showRowNumber && (
        <div
          className="px-2 py-2 flex justify-center items-center"
          style={{ minWidth: "60px", flexShrink: 0 }}
        >
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
            {rowNumber}
          </span>
        </div>
      )}
      {filaFiltrada.map((val, j) => (
        <div
          key={j}
          className="
            px-2
            py-2
            text-left
            whitespace-normal
            wrap-break-word
            text-sm lg:text-base
            leading-tight
          "
          style={{
            minWidth: `${cabeceraFiltrada[j][1]}px`,
            flexShrink: 1,
            maxWidth: `${cabeceraFiltrada[j][1]}px`,
          }}
        >
          {val}
        </div>
      ))}
      {opcionesRadio &&
        opcionesRadio.map((opt) => (
          <div
            key={opt.value}
            className="px-2 py-2 flex justify-center items-center"
            style={{ flex: 1 }}
          >
            <input
              type="radio"
              name={`radio-group-${rowKey}`}
              value={opt.value}
              disabled={disabled}
              checked={radioState?.[rowKey]?.value === opt.value}
              onChange={() => onRadioChange?.(rowKey, opt.value, opt.score)}
              className="
                w-5 h-5
                appearance-none
                border-2 border-gray-400
                rounded-md
                bg-white
                cursor-pointer
                transition-all
                duration-150
                checked:bg-blue-600
                checked:border-blue-600
                hover:border-blue-400
                focus:ring-2 focus:ring-blue-300
              "
            />
          </div>
        ))}
      <div
        className="px-2 py-2 flex justify-center items-center"
        style={{ flex: 1 }}
      >
        <button
          className={`
            w-6 h-6 flex items-center justify-center text-xs font-bold rounded
            transition-colors duration-150
            ${tieneError
              ? "bg-red-100 text-red-700 border border-red-600 hover:bg-red-200"
              : "text-blue-600 border border-blue-500 hover:bg-blue-100 active:bg-blue-200"
            }
          `}
          onClick={(e) => {
            e.stopPropagation();
            if (disabled) return;
            onObsClick?.(virtualRow.index);
          }}
        >
          ...
        </button>
      </div>
    </div>
  ),
);

export const BaseTablaMatrizLikert = forwardRef(function BaseTablaMatrizLikert({
  configTable,
  onSelect,
  onObsClick,
  rowsPerPage = 20,
  showRowNumber = false,
  opcionesRadio = [],
  onChangeRespuesta,
  erroresObs = {},
  respuestas = {},
  disabled = false,
  initialValues = [],
}, ref) {
  const {
    title = "",
    isPaginar = false,
    listaDatos = [],
    offsetColumnas = 0,
  } = configTable ?? {};

  const rowsOriginal = listaDatos ?? [];

  const opcionesRadioParsed = useMemo(() => {
    if (!Array.isArray(opcionesRadio) || opcionesRadio.length === 0) return null;
    return opcionesRadio.map((item) => {
      const [label, value] = item.split("|");
      return { label, value, score: value };
    });
  }, [opcionesRadio]);

  const dataRows = useMemo(() => {
    return listaDatos && listaDatos.length > 2 ? listaDatos.slice(2) : [];
  }, [listaDatos]);

  // .... inicio de paginacion ....
  const [page, setPage] = useState(1);
  const [containerWidth, setContainerWidth] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [radioState, setRadioState] = useState({});
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (!Array.isArray(initialValues) || initialValues.length === 0) return;
    const nuevoEstado = {};
    initialValues.forEach(item => {
      const [pk, value] = item.split("|");
      if (pk && value) {
        nuevoEstado[pk] = { value, score: value };
      }
    });
    setRadioState(prev => {
      const same =
        Object.keys(prev).length === Object.keys(nuevoEstado).length &&
        Object.keys(nuevoEstado).every(k => prev[k]?.value === nuevoEstado[k]?.value);
      if (same) return prev;
      return nuevoEstado;
    });
    initialValues.forEach(item => {
      const [pk, value] = item.split("|");
      if (pk && value) {
        onChangeRespuesta?.({
          pk,
          value
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  useImperativeHandle(ref, () => ({
    obtenerRadioState: () => {
      return radioState;
    }
  }),[radioState]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const filteredRows = useMemo(() => {
    if (!searchText.trim()) return dataRows;
    const lower = searchText.toLowerCase();
    return dataRows.filter((fila) => fila.toLowerCase().includes(lower));
  }, [dataRows, searchText]);

  const totalRegistrosFiltrados = useMemo(
    () => filteredRows.length,
    [filteredRows],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedRows = filteredRows.slice(start, end);

  const handlePageChange = (event, newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  // ........ fin paginacion ....

  const datosTabla = useMemo(() => {
    const base = isPaginar ? paginatedRows : filteredRows;
    return base.map((fila) => {
      const partes = fila.split("|");
      return {
        completa: partes,
        visible: partes.slice(offsetColumnas),
      };
    });
  }, [isPaginar, paginatedRows, filteredRows, offsetColumnas]);

  const {
    cabeceraFiltrada,
    totalWidth,
    rowVirtualizer,
    scrollBarRef,
    tableContainerRef,
    syncScroll,
  } = useTablaVirtualizadaCustom(datosTabla, rowsOriginal, offsetColumnas);

  // --- NUEVO: calcular ancho dinámico del contenedor ---
  useEffect(() => {
    if (!tableContainerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(tableContainerRef.current);
    return () => observer.disconnect();
  }, [tableContainerRef]);
  // ------------------------------------------------------

  // NOTA: PARA RESALTADO DE LA FILA SELECCIONADA
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (!disabled) {
        if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
        if (
          e.key === "Enter" &&
          document.activeElement === searchInputRef.current
        ) {
          e.stopPropagation();
          e.preventDefault();
          return;
        }
        if (rowVirtualizer.getTotalSize() === 0) return;
        if (e.key === "ArrowDown") {
          setSelectedIndex((prev) => {
            const next =
              prev === null
                ? 0
                : Math.min(prev + 1, rowVirtualizer.getTotalSize() - 1);
            rowVirtualizer.scrollToIndex(next, {
              align: "center",
              behavior: "smooth",
            });
            return next;
          });
          e.preventDefault();
        } else if (e.key === "ArrowUp") {
          setSelectedIndex((prev) => {
            const next = prev === null ? 0 : Math.max(prev - 1, 0);
            rowVirtualizer.scrollToIndex(next, {
              align: "center",
              behavior: "smooth",
            });
            return next;
          });
          e.preventDefault();
        } else if (e.key === "Enter" && selectedIndex != null) {
          const filaSeleccionada = datosTabla[selectedIndex];
          if (filaSeleccionada && onSelect) {
            // propaga el registro al padre
            onSelect(filaSeleccionada.completa);
          }
          e.preventDefault();
        }
      }
    },
    [rowVirtualizer, selectedIndex, datosTabla, onSelect, disabled],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (selectedIndex != null) {
      rowVirtualizer.scrollToIndex(selectedIndex, {
        align: "center",
        behavior: "smooth",
      });
    }
  }, [selectedIndex, rowVirtualizer]);

  if (!Array.isArray(listaDatos) || listaDatos.length === 0) {
    return <Loader />;
  }

  const effectiveWidth =
    containerWidth != null
      ? Math.max(containerWidth - 32, totalWidth)
      : totalWidth;

  return (
    <>
      <div
        ref={tableContainerRef}
        className="
          relative
          overflow-y-auto
          overflow-x-auto
          min-h-0
          bg-white
          shadow-lg
          rounded-lg
          border
          border-gray-200
          outline-none
        "
        style={{
          WebkitOverflowScrolling: "touch"
        }}

        onScroll={() => syncScroll("table")}
        tabIndex={0}
      >
        {/* Título */}
        <div className="
          sticky
          top-0
          left-0
          z-30
          bg-linear-to-r from-blue-400 to-blue-600
          shadow-md
          "
        >
          <h2 className="
            text-left
            text-xl
            text-white
            font-bold
            py-2
            px-4
            "
          >
            {title}{" "}
            <span className="
              ml-2
              text-lg
              text-white
              font-bold
              "
            >
              {`(${totalRegistrosFiltrados} Reg.)`}
            </span>
          </h2>
        </div>

        {/* Cabecera fija */}
        <div
          className="
            sticky
            top-10
            z-20
            flex
            border-b
            border-gray-300
            bg-gray-100
          "
          style={{ width: `${effectiveWidth}px` }}
        >
          {showRowNumber && (
            <div
              className="px-2 py-2 font-semibold text-center"
              style={{ minWidth: "60px", flexShrink: 0 }}
            >
            </div>
          )}
          {cabeceraFiltrada.map((col, id) => (
            <div
              key={id}
              className="
                px-2
                py-2
                font-semibold
                text-left
                whitespace-normal
                wrap-anywhere
                break-all
                text-sm lg:text-base
                leading-tight
              "
              style={{
                minWidth: `${col[1]}px`,
                flexShrink: 1,
                maxWidth: `${col[1]}px`,
              }}
            >
              {col[0]}
            </div>
          ))}
          {opcionesRadioParsed && opcionesRadioParsed.map((opt, i) => (
            <div
              key={`hdr-radio-${i}`}
              className="
                px-2
                py-2
                font-semibold
                text-center
                whitespace-normal
                wrap-break-word
                text-xs lg:text-sm
              "
              style={{ flex: 1, textAlign: "center" }}
            >
              {opt.label}
            </div>
          ))}
          <div
            className="px-2 py-2 font-semibold text-center"
            style={{ flex: 1 }}
          >
            OBS
          </div>
        </div>
        {/* Body virtualizado */}
        <div
          className="relative"
          style={{
            height: isPaginar
              ? `${rowVirtualizer.getVirtualItems().length * 35}px`
              : `${rowVirtualizer.getTotalSize()}px`,
            width: `${effectiveWidth}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const filaItem = datosTabla[virtualRow.index];
            if (!filaItem) return null;
            return (
              <Fila
                key={virtualRow.index}
                virtualRow={virtualRow}
                filaFiltrada={filaItem.visible}
                rowKey={filaItem.completa[0]}
                showRowNumber={showRowNumber}
                rowNumber={
                  (isPaginar ? start : 0) + virtualRow.index + 1
                }
                isEven={virtualRow.index % 2 === 0}
                isSelected={virtualRow.index === selectedIndex}
                effectiveWidth={effectiveWidth}
                cabeceraFiltrada={cabeceraFiltrada}
                opcionesRadio={opcionesRadioParsed}
                radioState={radioState}
                onRadioChange={(rowIdx, value, score) => {
                  setRadioState((prev) => ({
                    ...prev,
                    [rowIdx]: {
                      value,
                      score
                    }
                  }));
                  onChangeRespuesta?.({
                    pk: rowIdx,
                    value,
                    clearError: true
                  });
                }}
                onObsClick={(index) => {
                  const pk = datosTabla[index]?.completa?.[0];
                  onObsClick?.({
                    pk,
                    onSave: (texto) => {
                      onChangeRespuesta?.({
                        pk,
                        observacion: texto
                      });
                    }
                  });
                }}
                onClick={() => {
                  setSelectedIndex(virtualRow.index);
                  rowVirtualizer.scrollToIndex(virtualRow.index, {
                    align: "center",
                    behavior: "smooth",
                  });
                }}
                onDoubleClick={() => {
                  setSelectedIndex(virtualRow.index);
                  if (filaItem && onSelect) {
                    onSelect(filaItem.completa);
                  }
                }}
                listaLength={listaDatos.length}
                tieneError={
                  erroresObs[filaItem.completa[0]] &&
                  !respuestas[filaItem.completa[0]]?.observacion?.trim()
                }
                disabled={disabled}
              />
            );
          })}
        </div>
      </div>

      {/* Barra de scroll sincronizada */}
      <div
        ref={scrollBarRef}
        className="fixed bottom-0 left-0 w-full h-5 overflow-x-auto bg-gray-100 touch-pan-x"
        onScroll={() => syncScroll("bar")}
      >
        <div className="h-1" style={{ width: `${effectiveWidth}px` }}></div>
      </div>

      {isPaginar && (
        <Stack spacing={2} className="mt-4 flex justify-center">
          <Pagination
            count={totalPages}
            page={safePage}
            onChange={handlePageChange}
            shape="rounded"
            color="primary"
          />
        </Stack>
      )}
    </>
  );
});
