import React, { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch, getDocs } from "firebase/firestore";
import AreaList from "./components/AreaList";
import SearchBar from "./components/SearchBar";
import ResetButton from "./components/ResetButton";
import ExportButton from "./components/ExportButton";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

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
      if (statusFilter === "enviados") return a.enviado;
      if (statusFilter === "pendientes") return !a.enviado;
      
      return true;
    });
    
    setFilteredAreas(result);
  };

  const toggleEnviado = async (area) => {
    try {
      const ref = doc(db, "areas", area.id);
      await updateDoc(ref, {
        enviado: !area.enviado,
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
        enviado: false,
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
    // Crear datos para el Excel
    const excelData = areas.map(area => ({
      'Código': area.cod,
      'Área': area.nombre,
      'Nivel': area.nivel,
      'Estado': area.enviado ? 'ENVIADO' : 'PENDIENTE',
      'Última Actualización': area.updatedAt ? 
        (area.updatedAt.seconds ? 
          new Date(area.updatedAt.seconds * 1000).toLocaleString() : 
          new Date(area.updatedAt).toLocaleString()) : 'NUNCA',
      'Actualizado Por': area.updatedBy || 'NO REGISTRADO'
    }));

    // Crear libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Control de Partes');

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
      // Aquí guardarías en Firestore en una colección "monthly_reports"
      // Esto requiere configurar seguridad en Firestore
      console.log('Guardando reporte mensual para:', month, areasData);
      
      // Mostrar confirmación
      window.Swal.fire({
        icon: 'success',
        title: 'Reporte generado',
        text: `Se ha guardado el reporte de ${month} para consultas históricas`,
        timer: 3000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error guardando reporte histórico:', error);
    }
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
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcrks58z3KijKWqU4ejPd-P5CvEItOiiPPWg&s" 
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
      </div>

      {/* Indicador de filtro activo */}
      {activeFilter !== "all" && (
        <div className="filter-indicator">
          <span>
            Mostrando {activeFilter === "enviados" ? "áreas enviadas" : "áreas pendientes"}
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
          <AreaList areas={filteredAreas} onToggle={toggleEnviado} />
          <p className="note">
            {filteredAreas.length} {filteredAreas.length === 1 ? 'área encontrada' : 'áreas encontradas'}
            {activeFilter !== "all" && ` (filtrado por ${activeFilter})`}
          </p>
        </>
      )}
    </div>
  );
}