import React, { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function HistoricalReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

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
        ...doc.data() 
      }));
      
      setReports(reportsData);
      setLoading(false);
    } catch (error) {
      console.error('Error cargando reportes históricos:', error);
      setLoading(false);
    }
  };

  const exportReportToExcel = (report) => {
    const excelData = report.areasPendientes.map(area => ({
      'Código': area.cod,
      'Área': area.nombre,
      'Última Actualización': area.updatedAt,
      'Actualizado Por': area.updatedBy
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Pendientes_${report.month}`);
    
    XLSX.writeFile(workbook, `areas_pendientes_${report.month.replace(/\s+/g, '_')}.xlsx`);
  };

  if (loading) {
    return (
      <div className="historical-reports">
        <h3>Cargando reportes históricos...</h3>
      </div>
    );
  }

  return (
    <div className="historical-reports">
      <h3>Reportes Históricos - Áreas Pendientes</h3>
      
      {reports.length === 0 ? (
        <p>No hay reportes históricos disponibles.</p>
      ) : (
        <div className="reports-list">
          {reports.map(report => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <h4>{report.month}</h4>
                <span className="report-date">
                  {report.timestamp?.toDate?.().toLocaleDateString() || 'Fecha no disponible'}
                </span>
              </div>
              
              <div className="report-stats">
                <span className="stat total">Total: {report.totalAreas}</span>
                <span className="stat enviados">Enviados: {report.enviados}</span>
                <span className="stat pendientes">Pendientes: {report.pendientes}</span>
              </div>
              
              <div className="report-actions">
                <button 
                  className="btn-view"
                  onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                >
                  {selectedReport?.id === report.id ? 'Ocultar' : 'Ver Detalles'}
                </button>
                
                <button 
                  className="btn-export"
                  onClick={() => exportReportToExcel(report)}
                >
                  <i className="fas fa-download"></i> Exportar
                </button>
              </div>
              
              {selectedReport?.id === report.id && (
                <div className="report-details">
                  <h5>Áreas que no enviaron partes:</h5>
                  <ul>
                    {report.areasPendientes.map((area, index) => (
                      <li key={index}>
                        <strong>{area.cod}</strong> - {area.nombre}
                        <br/>
                        <small>Última actualización: {area.updatedAt}</small>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}