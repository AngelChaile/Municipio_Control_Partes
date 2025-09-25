import React, { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const HistoricalReports = () => {
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
                <span className="stat recibidos">Recibidos: {report.recibidos}</span>
                <span className="stat pendientes">Pendientes: {report.pendientes}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoricalReports;