import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginBase from "../components/LoginBase";
import ProtectedRoute from "../components/ProtectedRoute";
import Menu from "../components/Menu";
import LazyPage from "../components/LazyPage";
import pages from "../pages";
import { useData } from "../context/DataProvider";

export default function AppRouter({ basePath = "/" }) {
  const { data } = useData();

  return (
    <Router basename={basePath}>
      <Routes>
        <Route path="/" element={<LoginBase />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/menu/*" element={<Menu />} >
          {data
            .filter((val) => {
              const parts = val.split("|");
              return parts.length === 3 && parts[2].trim() !== "";
            })
            .map((row) => {
              const [path, _, componentName] = row.split("|");
              const ComponentLoader = pages[componentName?.trim()];
              if (!ComponentLoader) {
                console.warn("Página no encontrada:", componentName);
                return null;
              }

              return (
                <Route
                  key={path}
                  path={`${path}-repo`}
                  element={<LazyPage loader={ComponentLoader} />}
                />
              );
            })
          }

          {/* Aqui van las rutas estaticas del import ..
          <Route path="dashboard" element={<Dashboard />} />*/}
          </Route>
        </Route>

        {/* Fallback*/}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
