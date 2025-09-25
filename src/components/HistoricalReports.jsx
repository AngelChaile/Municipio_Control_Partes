import React, { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const HistoricalReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    loadHistoricalReports();
  }, []);

  const loadHistoricalReports = async () => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "monthly_reports"), orderBy("timestamp", "desc"))
      );
      
      const reportsData = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      }));
      
      setReports(reportsData);
      setLoading(false);
    } catch (error) {
      console.error('Error cargando reportes históricos:', error);
      setLoading(false);
    }
  };

  const getUniqueMonths = () => {
    const months = reports.map(report => report.month);
    return [...new Set(months)]; // Remover duplicados
  };

  if (loading) {
    return (
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '15px',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#3b82f6', marginBottom: '15px' }}></i>
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Cargando reportes históricos...</p>
      </div>
    );
  }

  const uniqueMonths = getUniqueMonths();
  const selectedReport = reports.find(report => report.month === selectedMonth) || 
                        (reports.length > 0 && !selectedMonth ? reports[0] : null);

  return (
    <div style={{
      background: 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ 
        color: '#1f2937', 
        margin: '0 0 25px 0',
        fontSize: '1.5rem',
        fontWeight: '600',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '10px'
      }}>
        📊 Reportes Históricos - Áreas sin Partes Recibidos
      </h3>

      {/* Selector de Mes */}
      <div style={{ marginBottom: '25px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: '500',
          color: '#374151'
        }}>
          Seleccionar Mes:
        </label>
        <select 
          value={selectedMonth || ''}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem',
            backgroundColor: 'white'
          }}
        >
          <option value="">-- Selecciona un mes --</option>
          {uniqueMonths.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>

      {/* Información del Mes Seleccionado */}
      {selectedReport ? (
        <div>
          <div style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '2px solid #bae6fd'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#0369a1' }}>
              Resumen del Mes: {selectedReport.month}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                  {selectedReport.totalAreas}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Áreas</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                  {selectedReport.recibidos || selectedReport.enviados || 0}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Partes Recibidos</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
                  {selectedReport.pendientes}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Sin Recepción</div>
              </div>
            </div>
          </div>

          {/* Lista de Áreas sin Recepción */}
          <div>
            <h5 style={{ margin: '0 0 15px 0', color: '#374151' }}>
              Áreas que NO enviaron partes ({selectedReport.areasPendientes?.length || 0}):
            </h5>
            <div style={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}>
              {selectedReport.areasPendientes && selectedReport.areasPendientes.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                  {selectedReport.areasPendientes.map((area, index) => (
                    <li key={index} style={{
                      padding: '12px 15px',
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white'
                    }}>
                      <div>
                        <strong style={{ color: '#1f2937' }}>{area.nombre}</strong>
                        <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '2px' }}>
                          Código: {area.cod}
                        </div>
                      </div>
                      <span style={{
                        background: '#fef2f2',
                        color: '#dc2626',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        Sin recepción
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  No hay áreas sin recepción para este mes.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ 
          background: '#fef3c7', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #f59e0b'
        }}>
          <p style={{ margin: 0, color: '#92400e' }}>
            {reports.length === 0 
              ? 'No hay reportes históricos disponibles.' 
              : 'Selecciona un mes para ver el reporte.'}
          </p>
        </div>
      )}

      {/* Información adicional */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px',
        background: '#f8fafc',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: '#64748b'
      }}>
        <strong>Nota:</strong> Los reportes se generan automáticamente al exportar a Excel.
        Cada mes se guarda un histórico de las áreas que no recibieron partes.
      </div>
    </div>
  );
};

export default HistoricalReports;