import React from "react";

export default function AreaList({ areas, onToggle }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Cod</th>
          <th>Área</th>
          <th>Nivel</th>
          <th>Enviado</th>
          <th>Última</th>
        </tr>
      </thead>
      <tbody>
        {areas.map(area => (
          <tr key={area.id} className={area.enviado ? "green" : "red"}>
            <td>{area.cod}</td>
            <td>{area.nombre}</td>
            <td>{area.nivel}</td>
            <td>
              <input type="checkbox" checked={!!area.enviado} onChange={() => onToggle(area)} />
            </td>
            <td>
              {area.updatedAt ? (area.updatedAt.seconds ? new Date(area.updatedAt.seconds * 1000).toLocaleString() : new Date(area.updatedAt).toLocaleString()) : "—"}
              <div style={{fontSize:12, color:"#444"}}>{area.updatedBy || ""}</div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
