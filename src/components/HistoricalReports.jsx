import React from "react";

const HistoricalReports = () => {
  return (
    <div className="historical-reports">
      <h3>📊 Reportes Históricos</h3>
      <div style={{ 
        background: '#f0f9ff', 
        padding: '20px', 
        borderRadius: '8px', 
        textAlign: 'center',
        border: '2px dashed #bae6fd'
      }}>
        <i className="fas fa-tools" style={{ fontSize: '2rem', color: '#0ea5e9', marginBottom: '10px' }}></i>
        <p style={{ margin: 0, color: '#0369a1' }}>
          <strong>Funcionalidad en desarrollo</strong><br/>
          Próximamente podrás ver los reportes mensuales de áreas pendientes.
        </p>
      </div>
    </div>
  );
};

export default HistoricalReports;