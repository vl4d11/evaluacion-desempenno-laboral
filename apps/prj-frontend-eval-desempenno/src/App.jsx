import { useEffect } from "react";
import { MenuTriggerProvider } from "./context/MenuTriggerContext";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./components/AppRouter";

export default function App() {
  useEffect(() => {
    sessionStorage.removeItem("auth");
  }, []);

  return (
    <AuthProvider>
      <MenuTriggerProvider>
        <AppRouter basePath="/evaluacion/desempenno" />
      </MenuTriggerProvider>
    </AuthProvider>
  );
}
