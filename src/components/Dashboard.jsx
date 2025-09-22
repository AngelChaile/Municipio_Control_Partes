import React from "react";

export default function Dashboard({ areas, activeFilter, onFilterClick }) {
  if (!areas || areas.length === 0) {
    return (
      <div className="dashboard">
        <h2>Control de Tarjetas</h2>
        <p>No hay datos disponibles todavía.</p>
      </div>
    );
  }

  const recibidos = areas.filter((a) => a.recibido).length;
  const pendientes = areas.length - recibidos;

  return (
    <div className="dashboard">
      <h2>Resumen de Estado</h2>
      <div className="stats-grid">
        <div 
          className={`stat-card recibidos ${activeFilter === "recibidos" ? "active" : ""}`}
          onClick={() => onFilterClick("recibidos")}
          style={{ cursor: "pointer" }}
        >
          <i className="fas fa-check-circle"></i>
          <h3>recibidos</h3>
          <p>{recibidos}</p>
        </div>
        <div 
          className={`stat-card pendientes ${activeFilter === "pendientes" ? "active" : ""}`}
          onClick={() => onFilterClick("pendientes")}
          style={{ cursor: "pointer" }}
        >
          <i className="fas fa-clock"></i>
          <h3>Pendientes</h3>
          <p>{pendientes}</p>
        </div>
        <div 
          className={`stat-card total ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => onFilterClick("all")}
          style={{ cursor: "pointer" }}
        >
          <i className="fas fa-layer-group"></i>
          <h3>Total Áreas</h3>
          <p>{areas.length}</p>
        </div>
      </div>
    </div>
  );
}