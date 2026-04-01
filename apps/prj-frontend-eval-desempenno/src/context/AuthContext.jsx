import { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuth, setIsAuth] = useState(() => {
    const auth = sessionStorage.getItem("auth");
    return auth === "ok";
  });

  const [usuario, setUsuario] = useState(() => {
    const user = sessionStorage.getItem("usuario");
    return user ? JSON.parse(user) : null;
  });

  const login = (data = {}) => {
    const user = data.usuario ?? null;

    sessionStorage.setItem("auth", "ok");
    sessionStorage.setItem("usuario", JSON.stringify(user));

    setIsAuth(true);
    setUsuario(user);
  };

  const logout = () => {
    sessionStorage.removeItem("auth");
    sessionStorage.removeItem("usuario");

    setIsAuth(false);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ isAuth, usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
