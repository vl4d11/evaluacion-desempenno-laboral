const Info = ({
  mensaje = "",
  className = "",
}) => {
  if (!mensaje?.trim()) return null;

  const texto = mensaje.replace(/\[\[NL\]\]/g, "\n");

  return (
    <div
      className={`
        mt-3
        w-full
        rounded-xl
        border
        border-sky-300
        bg-sky-50
        px-4
        py-3
        shadow-xs
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="shrink-0 w-8 h-8 text-blue-600"
        >
          <path
            fillRule="evenodd"
            d="M2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75 2.25 17.385 2.25 12Zm9-4.125a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM12 10.5a.75.75 0 0 1 .75.75v4.125a.75.75 0 0 1-1.5 0V11.25A.75.75 0 0 1 12 10.5Z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm md:text-base leading-relaxed text-sky-900 whitespace-pre-line">
            {texto}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Info;
