import React from "react";

const HistoricalReports = () => {
  return (
    <div className="historical-reports" style={{
      background: '#fffbeb',
      border: '3px solid #f59e0b',
      padding: '20px',
      borderRadius: '12px',
      marginTop: '20px'
    }}>
      <h3 style={{ color: '#92400e', margin: '0 0 15px 0' }}>
        🚧 Reportes Históricos - En Desarrollo
      </h3>
      <div style={{ 
        background: '#fef3c7', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #f59e0b'
      }}>
        <p style={{ margin: 0, color: '#92400e', fontSize: '16px' }}>
          <strong>Próximamente:</strong> Podrás ver los reportes mensuales de áreas que no enviaron partes.
        </p>
        <p style={{ margin: '10px 0 0 0', color: '#b45309', fontSize: '14px' }}>
          Esta funcionalidad estará disponible en la próxima actualización.
        </p>
      </div>
    </div>
  );
};

export default HistoricalReports;