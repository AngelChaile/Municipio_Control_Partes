import React from "react";

export default function ExportButton({ onExport }) {
  return (
    <button className="export" onClick={onExport}>
      <i className="fas fa-file-excel"></i>
      Exportar Excel
    </button>
  );
}