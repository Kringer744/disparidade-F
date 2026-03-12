import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import BuscaManual from "./pages/BuscaManual";
import Relatorios from "./pages/Relatorios";
import Historico from "./pages/Historico";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/busca" element={<BuscaManual />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
