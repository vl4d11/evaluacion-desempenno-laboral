export const AlertDialog = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <p className="text-gray-800 text-center mb-6">{message}</p>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
