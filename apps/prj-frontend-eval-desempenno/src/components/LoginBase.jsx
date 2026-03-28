import { useState, useEffect } from "react";
import { useData } from "../context/DataProvider";
import { useNavigateTo } from "../utils/useNavigateTo";
import useAuth from "../hooks/useAuth";

function LoginBase() {
  const { login, error } = useData();
  const { login: loginAuth, isAuth } = useAuth();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ usuario: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigateTo = useNavigateTo();

  const ASSETS_BASE = import.meta.env.VITE_API_BASE ?? "";

  useEffect(() => {
    if (isAuth) {
      navigateTo.go("/menu", { replace: true });
    }
  }, [isAuth, navigateTo]);

  const handleLogin = async () => {
    if (isLoading) return;
    let newErrors = { usuario: "", password: "" };
    if (usuario.trim() === "") {
      newErrors.usuario = "Ingrese un usuario";
    }
    if (password.trim() === "") {
      newErrors.password = "Ingrese una contraseña";
    }
    setErrors(newErrors);

    if (!newErrors.usuario && !newErrors.password) {
      try {
        const result = await login(usuario, password);
        if (result.ok) {
          loginAuth();
          navigateTo.go("/menu");
        } else {
          console.log("Error:", result.error);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-slate-100 text-slate-900 antialiased h-screen overflow-hidden">
      <div className="h-full w-full p-4 md:p-6 lg:p-8">
        <div className="h-full w-full flex flex-col lg:flex-row overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl bg-white">
          {/* LEFT PANEL */}
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden h-full">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
              style={{
                backgroundImage: `url(${ASSETS_BASE}/images/Collage-Practicantes-Caraz-2026.png)`
              }}
            />
            <div className="absolute inset-0 bg-linear-to-br from-black/80 via-black/40 to-black/30" />

            <div className="relative z-10 flex flex-col justify-between p-16 text-white w-full h-full">
              <div />

              <div className="space-y-6">
                <h2 className="text-5xl font-extrabold leading-tight">
                  Sistema de Evaluación de Desempeño Laboral.
                </h2>

                <div className="pt-8 flex gap-3">
                  <div className="h-1.5 w-16 rounded-full bg-white" />
                  <div className="h-1.5 w-4 rounded-full bg-white/30" />
                  <div className="h-1.5 w-4 rounded-full bg-white/30" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div
            className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 overflow-y-auto"
            style={{
              background:
                "linear-gradient(135deg, #f8fafc 0%, #e5e7eb 60%, #cbd5e1 100%)",
            }}
          >
            <div className="w-full max-w-md text-center">
              <div className="flex justify-center mb-10">
                <img
                src={`${ASSETS_BASE}/images/Logo-Sierra-Sun.svg`}
                  alt="Sierra Sun Group"
                  className="h-16 w-auto object-contain"
                />
              </div>

              <h1 className="text-4xl font-bold mb-3">Sierra Sun Group.</h1>
              <p className="text-slate-500 mb-10">Mineria sostenible</p>

              {/* SOLO MOBILE */}
              <h2 className="block lg:hidden text-2xl font-extrabold text-slate-800 mb-8 leading-snug">
                Sistema de Evaluación de Desempeño Laboral
              </h2>

              <div className="space-y-4 text-left">
                {/* EMAIL */}
                <div className="bg-slate-50 p-5 rounded-2xl border">
                  <label className="text-xs uppercase text-slate-400">
                    Usuario:
                  </label>
                  <input
                    type="text"
                    value={usuario}
                    onChange={e => setUsuario(e.target.value)}
                    placeholder="ingrese el usuario"
                    className={`w-full bg-transparent text-lg outline-none ${
                      errors.usuario
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                </div>
                {errors.usuario && (
                  <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
                    {errors.usuario}
                  </div>
                )}

                {/* PASSWORD */}
                <div className="bg-slate-50 p-5 rounded-2xl border">
                  <label className="text-xs uppercase text-slate-400">
                    Password:
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleLogin();
                      }
                    }}
                    placeholder="••••••••"
                    className={`w-full bg-transparent text-lg outline-none ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                </div>
                {errors.password && (
                  <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
                    {errors.password}
                  </div>
                )}

                {error && (
                  <p className="text-red-700 text-lg text-center">{error}</p>
                )}
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className={`w-full bg-primary
                    text-white
                    font-bold
                    py-5
                    rounded-full
                    mt-6
                    flex
                    items-center
                    justify-center
                    gap-3
                    ${isLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-600"}`}
                >
                  {isLoading ? "Ingresando..." : (
                      <>
                        <span className="material-symbols-outlined"></span>
                        Ingresar
                      </>
                    )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginBase;
