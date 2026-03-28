import "../index.css";
import App from "../App";
import { DataProvider } from "../context/DataProvider";

export default function RootWrapper() {
  return (
    <DataProvider>
      <App />
    </DataProvider>
  );
}
