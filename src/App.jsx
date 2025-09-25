import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch, getDocs } from "firebase/firestore";
import AreaList from "./components/AreaList";
import SearchBar from "./components/SearchBar";
import ResetButton from "./components/ResetButton";
import ExportButton from "./components/ExportButton";
import Dashboard from "./components/Dashboard";
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; // Para el reporte mensual
import HistoricalReports from "./components/HistoricalReports" // Nuevo componente para reportes históricos

export default function App() {
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showHistoricalReports, setShowHistoricalReports] = useState(false); // Para mostrar/ocultar reportes históricos

  useEffect(() => {
    const q = query(collection(db, "areas"), orderBy("cod"));
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
      // Filtro de búsqueda
      if (searchFilter && !(a.nombre || "").toLowerCase().includes(searchFilter.toLowerCase()) && 
          !(a.cod || "").includes(searchFilter)) {
        return false;
      }
      
      // Filtro de estado
      if (statusFilter === "recibidos") return a.recibido;
      if (statusFilter === "pendientes") return !a.recibido;
      
      return true;
    });
    
    setFilteredAreas(result);
  };

  const togglerecibido = async (area) => {
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

      window.Swal.fire('¡Listo!', 'Las marcas se vaciaron correctamente', 'success');
    } catch (e) {
      console.error(e);
      window.Swal.fire('Error', 'Error al vaciar. Revisa permisos.', 'error');
    }
  };

  const handleFilterClick = (filterType) => {
    setActiveFilter(filterType);
  };

  const exportToExcel = () => {
    // Crear datos para el Excel
 const excelData = areas.map(area => ({
    'Área': area.nombre,
    'Estado': area.recibido ? 'recibido' : 'PENDIENTE',
    'Última Actualización': area.updatedAt ? 
      (area.updatedAt.seconds ? 
        new Date(area.updatedAt.seconds * 1000).toLocaleString() : 
        new Date(area.updatedAt).toLocaleString()) : '',
    /* 'Actualizado Por': area.updatedBy || '' */
  }));

    // Crear libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Control de Partes Recibidos');

    // Obtener fecha para el nombre del archivo
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const monthStr = now.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

    // Descargar archivo
    XLSX.writeFile(workbook, `control_partes_${dateStr}.xlsx`);

    // También guardar en Firestore para histórico (opcional)
    saveMonthlyReport(monthStr, areas);
  };

const saveMonthlyReport = async (month, areasData) => {
  try {
    // Verificar que el usuario esté autenticado
/*     if (!auth.currentUser) {
      console.log('Usuario no autenticado, no se guarda reporte histórico');
      return;
    } */

    // Filtrar solo las áreas PENDIENTES (que NO enviaron)
    const areasPendientes = areasData.filter(area => !area.recibido);

    const docRef = await addDoc(collection(db, "monthly_reports"), {
      month: month,
      timestamp: serverTimestamp(),
      totalAreas: areasData.length,
      recibidos: areasData.filter(a => a.recibido).length,
      pendientes: areasPendientes.length,
      generatedBy: auth.currentUser.email,
      // Guardar solo las áreas PENDIENTES
      areasPendientes: areasPendientes.map(area => ({
        cod: area.cod,
        nombre: area.nombre,
        updatedBy: area.updatedBy || 'Nunca actualizado',
        updatedAt: area.updatedAt ? 
          (area.updatedAt.seconds ? 
            new Date(area.updatedAt.seconds * 1000).toLocaleString() : 
            new Date(area.updatedAt).toLocaleString()) : 'Nunca'
      }))
    });

    console.log('Reporte mensual guardado con ID:', docRef.id);
    
  } catch (error) {
    console.error('Error guardando reporte histórico:', error);
  }
};

// Nueva función para renderizar el componente de reportes históricos
const toggleHistoricalReports = () => {
  setShowHistoricalReports(!showHistoricalReports);
};

  return (
    <div className="container">
      {/* Dashboard con estadísticas */}
      <Dashboard 
        areas={areas} 
        activeFilter={activeFilter}
        onFilterClick={handleFilterClick}
      />

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Sistema de Control de Partes Diarios</h1>
            <p className="subtitle">Municipalidad - Gestión de áreas</p>
          </div>
          <div>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/7/77/Isologotipo_Municipio_de_Mor%C3%B3n.jpg" 
              alt="Logo Municipio" 
              className="logo" 
            />
          </div>
        </div>
      </header>

      {/* Controles de búsqueda y acciones */}
      <div className="controls">
        <SearchBar value={filter} onChange={setFilter} />
        <ResetButton onReset={vaciarTodo} />
        <ExportButton onExport={exportToExcel} />

{/* Boton para ver historico */}
<button className="historical-btn" onClick={toggleHistoricalReports}>
  <i className="fas fa-history"></i>
  {showHistoricalReports ? 'Ocultar Histórico' : 'Ver Histórico'}
</button>
      </div>

      {/* Indicador de filtro activo */}
      {activeFilter !== "all" && (
        <div className="filter-indicator">
          <span>
            Mostrando {activeFilter === "recibidos" ? "áreas recibidas" : "áreas pendientes"}
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
          <AreaList areas={filteredAreas} onToggle={togglerecibido} />
          <p className="note">
            {filteredAreas.length} {filteredAreas.length === 1 ? 'área encontrada' : 'áreas encontradas'}
            {activeFilter !== "all" && ` (filtrado por ${activeFilter})`}
          </p>
          {showHistoricalReports && <HistoricalReports />} {/* Renderizar reportes históricos si está activado */}
        </>
      )}
    </div>
  );
}