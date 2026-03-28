import { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuth, setIsAuth] = useState(false);

  const login = () => {
    sessionStorage.setItem("auth", "ok");
    setIsAuth(true);
  };

  const logout = () => {
    sessionStorage.removeItem("auth");
    setIsAuth(false);
  };

  return (
    <AuthContext.Provider value={{ isAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
