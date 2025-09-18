import React from "react";

export default function AreaList({ areas, onToggle }) {
  if (areas.length === 0) {
    return (
      <div className="table-container">
        <p style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
          No se encontraron áreas que coincidan con los criterios de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Área</th>
            <th>Nivel</th>
            <th>Estado</th>
            <th>Última Actualización</th>
          </tr>
        </thead>
        <tbody>
          {areas.map(area => (
            <tr key={area.id}>
              <td>
                <span style={{ 
                  fontFamily: 'monospace', 
                  fontWeight: '600', 
                  color: '#4b5563' 
                }}>
                  {area.cod}
                </span>
              </td>
              <td>{area.nombre}</td>
              <td>{area.nivel}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={!!area.enviado} 
                    onChange={() => onToggle(area)} 
                  />
                  <span className={`status-badge ${area.enviado ? 'enviado' : 'pendiente'}`}>
                    {area.enviado ? 'Enviado' : 'Pendiente'}
                  </span>
                </div>
              </td>
              <td>
                <div>
                  {area.updatedAt ? (
                    area.updatedAt.seconds ? 
                      new Date(area.updatedAt.seconds * 1000).toLocaleString() : 
                      new Date(area.updatedAt).toLocaleString()
                  ) : "—"}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>
                  {area.updatedBy || ""}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}