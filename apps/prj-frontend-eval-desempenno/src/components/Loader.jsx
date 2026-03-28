const Loader = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/70 z-50">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="mt-4 text-blue-600 font-semibold text-lg animate-pulse">
        Cargando...
      </span>
    </div>
  );
};

export default Loader;
