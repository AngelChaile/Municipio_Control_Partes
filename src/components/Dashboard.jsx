import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function Dashboard({ areas }) {
  if (!areas || areas.length === 0) {
    return (
      <div className="dashboard">
        <h2>Resumen de Estado</h2>
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

  const COLORS = ["#10b981", "#f59e0b"];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="dashboard">
      <h2>Resumen de Estado</h2>
      <div className="stats-grid">
        <div className="stat-card enviados">
          <i className="fas fa-check-circle"></i>
          <h3>Enviados</h3>
          <p>{enviados}</p>
        </div>
        <div className="stat-card pendientes">
          <i className="fas fa-clock"></i>
          <h3>Pendientes</h3>
          <p>{pendientes}</p>
        </div>
        <div className="stat-card total">
          <i className="fas fa-layer-group"></i>
          <h3>Total Áreas</h3>
          <p>{areas.length}</p>
        </div>
      </div>

     
    </div>
  );
}