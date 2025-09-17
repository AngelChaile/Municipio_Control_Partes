// src/components/Dashboard.jsx
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard({ areas }) {
  if (!areas || areas.length === 0) {
    return (
      <div className="dashboard">
        <h2>Dashboard</h2>
        <p>No hay datos disponibles todavía.</p>
      </div>
    );
  }

  const enviados = areas.filter((a) => a.enviado).length;
  const pendientes = areas.length - enviados;

  const data = [
    { name: "Enviados", value: enviados },
    { name: "Pendientes", value: pendientes },
  ];

  const COLORS = ["#ef4444", "#9ca3af"]; // rojo + gris claro

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="stats">
        <div className="stat-card enviados">
          <h3>Enviados</h3>
          <p>{enviados}</p>
        </div>
        <div className="stat-card pendientes">
          <h3>Pendientes</h3>
          <p>{pendientes}</p>
        </div>
        <div className="stat-card total">
          <h3>Total Áreas</h3>
          <p>{areas.length}</p>
        </div>
      </div>

      <div className="chart">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
