import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import Loader from "./Loader";
import { useTablaVirtualizadaCustom } from "../hooks/useTablaVirtualizadaCustom";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

const Fila = memo(
  ({
    virtualRow,
    filaFiltrada,
    filaCompleta,
    isEven,
    isSelected,
    effectiveWidth,
    cabeceraFiltrada,
    onClick,
    onDoubleClick,
    selectedRadio,
    handleRadioClick,
    selectedChecked,
    handleCheckDelete,
    listaLength,
    isEditing,
    onDownload,
    onUpload,
  }) => {
    const [, , existeArchivo, , esSubido] = filaCompleta ?? [];
    const tieneArchivo = existeArchivo === "1";
    const puedeSubir = esSubido === "1";

    return (
      <div
        data-row-index={virtualRow.index}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={`
          absolute
          left-0
          flex
          h-[35px]
          items-center
          border-b
          border-gray-200
          cursor-pointer
          transition-colors
          duration-150
          ${isSelected
            ?"bg-indigo-200"
            : isEven
              ? "bg-white"
              : "bg-gray-50"
          }
          hover:bg-indigo-100
          active:bg-indigo-300
        `}
        style={{
          transform: `translateY(${virtualRow.start}px)`,
          width: `${effectiveWidth}px`,
        }}
      >
        {filaFiltrada.map((val, j) => (
          <div
            key={j}
            className="px-2 py-2 text-left"
            style={{
              minWidth: `${cabeceraFiltrada[j][1]}px`,
              flexShrink: 0,
            }}
          >
            {val}
          </div>
        ))}
        {onDownload && (
          <div
            className="px-2 py-2 text-center"
            style={{ minWidth: "110px", flexShrink: 0 }}
          >
            <button
              className="text-blue-600 hover:underline font-medium"
              onClick={(e) => {
                e.stopPropagation();
                onDownload?.(filaCompleta);
              }}
            >
              {tieneArchivo ? "Descargar": "Pendiente" }
            </button>
          </div>
        )}
        {onUpload && (
          <div
            className="px-2 py-2 text-center"
            style={{ minWidth: "110px", flexShrink: 0 }}
          >
            <button
              className="text-green-600 hover:underline font-medium"
              onClick={(e) => {
                e.stopPropagation();
                onUpload?.(filaCompleta);
              }}
            >
              {puedeSubir ? "Subir": "Pendiente" }
            </button>
          </div>
        )}
        {isEditing && (
          <div className="px-2 py-2 text-center" style={{ minWidth: "80px" }}>
            <input
              type="radio"
              name="editarFila"
              value={virtualRow.index}
              checked={selectedRadio === virtualRow.index}
              onChange={() => { }}
              onClick={() => handleRadioClick(virtualRow.index)}
              className="h-4 w-4 appearance-none border border-gray-300 rounded-sm checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        {isEditing && (
          <div className="px-2 py-2 text-center" style={{ minWidth: "80px" }}>
            <input
              type="checkbox"
              name={`eliminarFila-${virtualRow.index}`}
              value={virtualRow.index}
              checked={
                selectedChecked.includes(virtualRow.index) &&
                virtualRow.index < listaLength
              }
              onChange={() => { }}
              onClick={() => handleCheckDelete(virtualRow.index)}
              className="h-4 w-4 appearance-none border border-gray-300 rounded-sm checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
    );
  }
)

export const BaseTablaMatrizDownUp = ({
  configTable,
  handleRadioClick,
  handleCheckDelete,
  isEditing,
  onSelect,
  onDownload,
  onUpload,
}) => {
  const { title, isPaginar, listaDatos, offsetColumnas } = configTable;

  const rowsOriginal = listaDatos;
  const [selectedRadio, setSelectedRadio] = useState(null);

  const dataRows = useMemo(() => {
    return listaDatos && listaDatos.length > 2 ? listaDatos.slice(2) : [];
  }, [listaDatos]);

  // .... inicio de paginacion ....
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;
  const [containerWidth, setContainerWidth] = useState(null);
  const [userChecked, setUserChecked] = useState([]);
  const [searchText, setSearchText] = useState("");
  const searchInputRef = useRef(null);

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

  const selectedChecked = useMemo(() => {
    if (!listaDatos || listaDatos.length === 0) return [];

    return datosTabla.reduce((acc, d, relIndex) => {
      const partes = d?.completa;
      if (partes && partes[7] === "0") acc.push(relIndex);
      return acc;
    }, []);
  }, [listaDatos, datosTabla]);

  const handleRadioClickInterno = useCallback(
    (index) => {
      setSelectedRadio((prevRadio) => {
        const newRadio = prevRadio === index ? null : index;
        const filaSeleccionada = datosTabla[index];
        if (filaSeleccionada && newRadio !== null) {
          const completaConIndex = [...filaSeleccionada.completa, index];
          handleRadioClick?.(completaConIndex);
        } else {
          handleRadioClick?.(null);
        }
        return newRadio;
      });
    },
    [datosTabla, handleRadioClick],
  );

  const handleCheckDeleteInterno = useCallback(
    (index) => {
      setUserChecked((prev) => {
        const already = prev.includes(index);
        const next = already
          ? prev.filter((i) => i !== index)
          : [...prev, index];
        const isChecked = already ? 0 : 1;
        // Si marcamos el checkbox para 'index' y ese index estaba seleccionado por radio, quitar el radio
        if (!already && selectedRadio === index) {
          setSelectedRadio(null);
          handleRadioClick?.(null);
        }

        const headerOffset =
          listaDatos && dataRows ? listaDatos.length - dataRows.length : 2;
        const pageStart = isPaginar ? start : 0;
        const originalIndex = headerOffset + pageStart + index;

        const filaSeleccionada = datosTabla[index];
        if (filaSeleccionada) {
          // const filaConIndex = [...filaSeleccionada.completa, isChecked, index];
          handleCheckDelete?.({
            fila: filaSeleccionada.completa,
            index: originalIndex,
            checked: isChecked,
          });
        } else {
          handleCheckDelete?.(null);
        }
        return next;
      });
    },
    [
      datosTabla,
      dataRows,
      listaDatos,
      start,
      isPaginar,
      handleCheckDelete,
      selectedRadio,
      handleRadioClick,
    ],
  );

  const {
    totalRegistros,
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
          onSelect(filaSeleccionada.completa); // propaga el registro al padre
        }
        e.preventDefault();
      }
    },
    [rowVirtualizer, selectedIndex, datosTabla, onSelect],
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

  if (!listaDatos || listaDatos.length <= 1) {
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
          bg-white
          shadow-lg
          rounded-lg
          border
          border-gray-200
          outline-none
          h-[60vh]
          sm:h-[65vh]
          lg:h-[70vh]
        "
        onScroll={() => syncScroll("table")}
        tabIndex={0}
      >
        {/* Título */}
        <div className="
          sticky
          top-0
          left-0
          z-30
          bg-white
          shadow-md
          "
        >
          <h2 className="
            text-left
            text-xl
            text-green-700
            font-bold
            py-2
            px-4
            "
          >
            {title}{" "}
            <span className="
              ml-2
              text-sm
              font-medium
              text-gray-500
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
          {cabeceraFiltrada.map((col, id) => (
            <div
              key={id}
              className="
                px-2
                py-2
                font-semibold
                text-left
              "
              style={{
                minWidth: `${col[1]}px`,
                flexShrink: 0,
              }}
            >
              {col[0]}
            </div>
          ))}
          {onDownload && (
            <div
              className="px-2 py-2 font-semibold text-center text-green-700"
              style={{ minWidth: "110px", flexShrink: 0 }}
            >
              DESCARGAR
            </div>
          )}
          {onUpload && (
            <div
              className="px-2 py-2 font-semibold text-center text-green-700"
              style={{ minWidth: "110px", flexShrink: 0 }}
            >
              SUBIR
            </div>
          )}
          {isEditing && (
            <>
              <div
                className="px-2 py-2 font-semibold text-center text-blue-600"
                style={{ minWidth: "80px" }}
              >
                EDITAR
              </div>
              <div
                className="px-2 py-2 font-semibold text-center text-blue-600"
                style={{ minWidth: "80px" }}
              >
                ELIMINAR
              </div>
            </>
          )}
        </div>
        {/* Body virtualizado */}
        <div
          className="relative"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
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
                filaCompleta={filaItem.completa}
                isEven={virtualRow.index % 2 === 0}
                isSelected={virtualRow.index === selectedIndex}
                effectiveWidth={effectiveWidth}
                cabeceraFiltrada={cabeceraFiltrada}
                selectedRadio={selectedRadio}
                handleRadioClick={handleRadioClickInterno}
                selectedChecked={[...new Set([...selectedChecked, ...userChecked])]}
                handleCheckDelete={handleCheckDeleteInterno}
                onDownload={onDownload}
                onUpload={onUpload}
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
                isEditing={isEditing}
              />
            );
          })}
        </div>
      </div>

      {/* Barra de scroll sincronizada */}
      <div
        ref={scrollBarRef}
        className="fixed bottom-0 left-0 w-full h-5 overflow-x-auto bg-gray-100"
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
};
