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
            <th>Área</th>
            <th>Estado</th>
            <th>Última Actualización</th>
          </tr>
        </thead>
        <tbody>
          {areas.map(area => (
            <tr key={area.id}>
              <td>
                <div>
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>
                    {area.nombre}
                  </div>
                  {<div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>
                     {area.padre }
                  </div>}
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={!!area.recibido} 
                    onChange={() => onToggle(area)} 
                  />
                  <span className={`status-badge ${area.recibido ? 'recibido' : 'pendiente'}`}>
                    {area.recibido ? 'Recibido' : 'Pendiente'}
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