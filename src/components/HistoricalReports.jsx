import React from "react";

const HistoricalReports = () => {
  console.log('🔴 HistoricalReports component is RENDERING!');
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      border: '3px solid #f59e0b',
      padding: '30px',
      borderRadius: '15px',
      marginTop: '25px',
      boxShadow: '0 10px 25px rgba(245, 158, 11, 0.2)',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '3rem',
        marginBottom: '15px'
      }}>
        📊
      </div>
      
      <h3 style={{ 
        color: '#92400e', 
        margin: '0 0 15px 0',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        Reportes Históricos - En Desarrollo
      </h3>
      
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '10px',
        border: '2px solid #fbbf24',
        marginBottom: '15px'
      }}>
        <p style={{ 
          margin: '0 0 10px 0', 
          color: '#92400e', 
          fontSize: '1.1rem',
          fontWeight: '500'
        }}>
          <strong>¡Próximamente!</strong>
        </p>
        <p style={{ 
          margin: '0', 
          color: '#b45309', 
          fontSize: '1rem',
          lineHeight: '1.5'
        }}>
          Podrás ver los reportes mensuales de áreas que <strong>NO RECIBIERON</strong> partes.
          <br/>
          <em>Funcionalidad en desarrollo - Estará disponible pronto.</em>
        </p>
      </div>
      
      <button 
        onClick={() => window.location.reload()} // Temporal: recargar para volver
        style={{
          background: '#dc2626',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '500'
        }}
      >
        Volver al Listado Actual
      </button>
    </div>
  );
};

export default HistoricalReports;