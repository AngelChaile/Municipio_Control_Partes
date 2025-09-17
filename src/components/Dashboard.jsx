import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Swal from "sweetalert2";
import StatsCard from "./StatsCard";

const Dashboard = () => {
  // Datos simulados (en tu caso vendrán de Firestore)
  const totalAreas = 500;
  const enviados = 120;
  const pendientes = totalAreas - enviados;

  const data = [
    { name: "Enviados", value: enviados },
    { name: "Pendientes", value: pendientes },
  ];

  const COLORS = ["#B71C1C", "#9E9E9E"]; // rojo y gris

  const handleVaciar = () => {
    Swal.fire({
      title: "¿Vaciar todas las marcas?",
      text: "Esta acción es irreversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#B71C1C",
      cancelButtonColor: "#9E9E9E",
      confirmButtonText: "Sí, vaciar",
      cancelButtonText: "Cancelar",
      background: "#FFFFFF",
      color: "#212121",
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header con logo */}
      <header className="flex items-center justify-between bg-white p-4 shadow rounded-lg mb-6">
        <div className="flex items-center gap-3">
          <img
            src="/logo-moron.png" // reemplaza con la ruta real del logo
            alt="Municipio de Morón"
            className="h-12"
          />
          <h1 className="text-2xl font-bold text-red-800">
            Panel de Control - Partes
          </h1>
        </div>
        <button
          onClick={handleVaciar}
          className="bg-red-700 text-white px-4 py-2 rounded-lg shadow hover:bg-red-800 transition"
        >
          Vaciar marcas
        </button>
      </header>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard title="Total de Áreas" value={totalAreas} color="text-red-800" />
        <StatsCard title="Enviados" value={enviados} color="text-green-600" />
        <StatsCard title="Pendientes" value={pendientes} color="text-yellow-600" />
      </div>

      {/* Gráfico circular */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Estado General
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla de pendientes */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Áreas pendientes
        </h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Área</th>
              <th className="p-2 border">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {/* Ejemplo de datos: en la práctica, se cargan desde Firestore */}
            <tr>
              <td className="p-2 border">SECRETARÍA DE ECONOMÍA</td>
              <td className="p-2 border">Secretaría</td>
            </tr>
            <tr>
              <td className="p-2 border">DIRECCIÓN DE SALUD</td>
              <td className="p-2 border">Dirección</td>
            </tr>
            <tr>
              <td className="p-2 border">DEPENDENCIA DE CULTURA</td>
              <td className="p-2 border">Dependencia</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
