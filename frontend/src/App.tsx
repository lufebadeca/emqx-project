import { Routes, Route, Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useSocket } from "./context/SocketContext";
import Dashboard from "./pages/Dashboard";
import DeviceForm from "./pages/DeviceForm";
import sharkieImg from "./public/sharkie.png";

export default function App() {
  const { connected } = useSocket();

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <img src={sharkieImg} alt="" className="h-10 w-auto object-contain" />
            Sharkie IoT
          </Link>
          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-1.5 text-xs ${connected ? "text-emerald-400" : "text-red-400"}`}>
              <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400" : "bg-red-400"}`} />
              {connected ? "Conectado" : "Desconectado"}
            </span>
            <Link
              to="/devices/new"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-3 py-1.5 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </Link>
          </div>
        </div>
      </nav>

      {/* Routes */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices/new" element={<DeviceForm />} />
          <Route path="/devices/:id/edit" element={<DeviceForm />} />
        </Routes>
      </main>
    </div>
  );
}
