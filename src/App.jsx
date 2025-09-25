import React, { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import AreaList from "./components/AreaList";
import SearchBar from "./components/SearchBar";
import ResetButton from "./components/ResetButton";
import ExportButton from "./components/ExportButton";
import Dashboard from "./components/Dashboard";
// import HistoricalReports from "./components/HistoricalReports"; // Temporalmente comentado

export default function App() {
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  // const [showHistoricalReports, setShowHistoricalReports] = useState(false); // Temporalmente comentado

  useEffect(() => {
    const q = query(collection(db, "areas"), orderBy("nombre"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAreas(docs);
        applyFilters(docs, filter, activeFilter);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching areas:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    applyFilters(areas, filter, activeFilter);
  }, [filter, activeFilter, areas]);

  const applyFilters = (areasList, searchFilter, statusFilter) => {
    let result = areasList.filter((a) => {
      if (searchFilter && !(a.nombre || "").toLowerCase().includes(searchFilter.toLowerCase()) && 
          !(a.cod || "").includes(searchFilter)) {
        return false;
      }
      
      if (statusFilter === "recibidos") return a.recibido;
      if (statusFilter === "pendientes") return !a.recibido;
      
      return true;
    });
    
    setFilteredAreas(result);
  };

  const toggleRecibido = async (area) => {
    try {
      const ref = doc(db, "areas", area.id);
      await updateDoc(ref, {
        recibido: !area.recibido,
        updatedBy: auth.currentUser ? auth.currentUser.email : "anónimo",
        updatedAt: new Date(),
      });
    } catch (e) {
      console.error(e);
      window.Swal.fire('Error', 'Error al actualizar. Revisa permisos de Firestore o tu conexión.', 'error');
    }
  };

  const vaciarTodo = async () => {
    const result = await window.Swal.fire({
      title: '¿Vaciar todas las marcas?',
      text: "Esta acción es irreversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, vaciar todo',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'custom-swal'
      }
    });

    if (!result.isConfirmed) return;

    try {
      const snap = await getDocs(collection(db, "areas"));
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.update(d.ref, {
        recibido: false,
        updatedBy: null,
        updatedAt: null
      }));
      await batch.commit();

      window.Swal.fire('¡Éxito!', 'Las marcas se vaciaron correctamente', 'success');
    } catch (e) {
      console.error(e);
      window.Swal.fire('Error', 'Error al vaciar. Revisa permisos.', 'error');
    }
  };

  const handleFilterClick = (filterType) => {
    setActiveFilter(filterType);
  };

  const exportToExcel = () => {
    const excelData = areas.map(area => ({
      'Código': area.cod,
      'Área': area.nombre,
      'Estado': area.recibido ? 'recibido' : 'PENDIENTE',
      'Última Actualización': area.updatedAt ? 
        (area.updatedAt.seconds ? 
          new Date(area.updatedAt.seconds * 1000).toLocaleString() : 
          new Date(area.updatedAt).toLocaleString()) : 'NUNCA',
      'Actualizado Por': area.updatedBy || 'NO REGISTRADO'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Control de Partes');

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    XLSX.writeFile(workbook, `control_partes_${dateStr}.xlsx`);

    saveMonthlyReport(areas);
  };

  const saveMonthlyReport = async (areasData) => {
    try {
      if (!auth.currentUser) return;

      const areasPendientes = areasData.filter(area => !area.recibido);
      const now = new Date();
      const monthStr = now.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

      await addDoc(collection(db, "monthly_reports"), {
        month: monthStr,
        timestamp: serverTimestamp(),
        totalAreas: areasData.length,
        recibidos: areasData.filter(a => a.recibido).length,
        pendientes: areasPendientes.length,
        generatedBy: auth.currentUser.email,
        areasPendientes: areasPendientes.map(area => ({
          cod: area.cod,
          nombre: area.nombre,
          updatedBy: area.updatedBy || 'Nunca actualizado'
        }))
      });

    } catch (error) {
      console.error('Error guardando reporte histórico:', error);
    }
  };

  // Temporalmente comentado
  // const toggleHistoricalReports = () => {
  //   setShowHistoricalReports(!showHistoricalReports);
  // };

  return (
    <div className="container">
      <Dashboard 
        areas={areas} 
        activeFilter={activeFilter}
        onFilterClick={handleFilterClick}
      />

      <header className="app-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Sistema de Control de Partes Diarios</h1>
            <p className="subtitle">Municipalidad - Gestión de áreas</p>
          </div>
          <div>
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcrks58z3KijKWqU4ejPd-P5CvEItOiiPPWg&s" 
              alt="Logo Municipio" 
              className="logo" 
            />
          </div>
        </div>
      </header>

      <div className="controls">
        <SearchBar value={filter} onChange={setFilter} />
        <ResetButton onReset={vaciarTodo} />
        <ExportButton onExport={exportToExcel} />
        {/* Temporalmente comentado */}
        {/* <button className="historical-btn" onClick={toggleHistoricalReports}>
          <i className="fas fa-history"></i>
          {showHistoricalReports ? 'Ocultar Histórico' : 'Ver Histórico'}
        </button> */}
      </div>

      {activeFilter !== "all" && (
        <div className="filter-indicator">
          <span>
            Mostrando {activeFilter === "recibidos" ? "áreas enviadas" : "áreas pendientes"}
            <button 
              onClick={() => setActiveFilter("all")}
              className="clear-filter"
            >
              <i className="fas fa-times"></i> Mostrar todas
            </button>
          </span>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando áreas...</p>
        </div>
      ) : (
        <>
          <AreaList areas={filteredAreas} onToggle={toggleRecibido} />
          <p className="note">
            {filteredAreas.length} {filteredAreas.length === 1 ? 'área encontrada' : 'áreas encontradas'}
            {activeFilter !== "all" && ` (filtrado por ${activeFilter})`}
          </p>
        </>
      )}

      {/* Temporalmente comentado */}
      {/* {showHistoricalReports && <HistoricalReports />} */}
    </div>
  );
}