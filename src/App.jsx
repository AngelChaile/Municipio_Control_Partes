import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, writeBatch } from "firebase/firestore";
import { useEffect, useState } from "react";
import AreaList from "./components/AreaList";
import Dashboard from "./components/Dashboard";
import ExportButton from "./components/ExportButton";
import ResetButton from "./components/ResetButton";
import SearchBar from "./components/SearchBar";
import { auth, db } from "./firebase";
import HistoricalReports from "./components/HistoricalReports"; // ← Historico

export default function App() {
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showHistoricalReports, setShowHistoricalReports] = useState(false); // ← NUEVO ESTADO

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
      let userEmail = 'usuario_no_autenticado';

      if (auth && auth.currentUser) {
        userEmail = auth.currentUser.email;
      }

      const ref = doc(db, "areas", area.id);
      await updateDoc(ref, {
        recibido: !area.recibido,
        updatedBy: userEmail, // ← Usa la variable segura
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
      // Verificar si Firebase Auth está disponible y el usuario está autenticado
      let userEmail = 'usuario_no_autenticado';

      if (auth && auth.currentUser) {
        userEmail = auth.currentUser.email;
      } else {
        console.log('⚠️ Usuario no autenticado, guardando con email genérico');
      }

      // Usa 'recibido' en lugar de 'enviado' para coincidir con tus cambios
      const areasPendientes = areasData.filter(area => !area.recibido);
      const now = new Date();
      const monthStr = now.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

      console.log('💾 Guardando reporte para:', monthStr);
      console.log('📊 Datos:', {
        totalAreas: areasData.length,
        recibidos: areasData.filter(a => a.recibido).length,
        pendientes: areasPendientes.length,
        usuario: userEmail
      });

      const docRef = await addDoc(collection(db, "monthly_reports"), {
        month: monthStr,
        timestamp: serverTimestamp(),
        totalAreas: areasData.length,
        recibidos: areasData.filter(a => a.recibido).length,
        pendientes: areasPendientes.length,
        generatedBy: userEmail, // ← Usa la variable segura
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

      console.log('✅ Reporte guardado con ID:', docRef.id);

      // Mostrar confirmación solo si hay usuario autenticado
      if (auth && auth.currentUser) {
        window.Swal.fire({
          icon: 'success',
          title: 'Reporte histórico guardado',
          text: `Se ha guardado el reporte de ${monthStr}`,
          timer: 2000,
          showConfirmButton: false
        });
      }

    } catch (error) {
      console.error('❌ Error guardando reporte histórico:', error);
      // No mostrar error al usuario para no interrumpir la descarga del Excel
    }
  };




  // Y agrega esta función para probar el guardado de reportes nuevo:
  const generateTestReport = async () => {
    const now = new Date();
    const monthStr = now.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

    // Datos de prueba
    const testData = {
      month: monthStr,
      timestamp: new Date(),
      totalAreas: 15,
      recibidos: 10,
      pendientes: 5,
      generatedBy: 'test@municipio.com',
      areasPendientes: [
        { cod: '001', nombre: 'Área de Prueba 1', updatedBy: 'Sistema' },
        { cod: '002', nombre: 'Área de Prueba 2', updatedBy: 'Sistema' },
        { cod: '003', nombre: 'Área de Prueba 3', updatedBy: 'Sistema' },
        { cod: '004', nombre: 'Área de Prueba 4', updatedBy: 'Sistema' },
        { cod: '005', nombre: 'Área de Prueba 5', updatedBy: 'Sistema' }
      ]
    };

    try {
      const docRef = await addDoc(collection(db, "monthly_reports"), testData);
      console.log('✅ Reporte de prueba guardado:', docRef.id);
      window.Swal.fire('Éxito', 'Reporte de prueba generado', 'success');
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };



  // Para reporte historico
  const toggleHistoricalReports = () => {
    console.log('Botón histórico clickeado. Estado actual:', showHistoricalReports);
    setShowHistoricalReports(!showHistoricalReports);
    console.log('Nuevo estado:', !showHistoricalReports);
  };

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

        {/* ← NUEVO BOTÓN Ver Histórico */}
        <button className="historical-btn" onClick={toggleHistoricalReports}>
          <i className="fas fa-history"></i>
          {showHistoricalReports ? 'Volver al Listado' : 'Ver Histórico'}
        </button>


        {// En los controles, agrega este botón temporal para generar reporte de prueba
        }
        <button
          onClick={() => generateTestReport()}
          style={{
            background: '#8b5cf6',
            color: 'white',
            padding: '10px 16px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          <i className="fas fa-vial"></i> Generar Reporte Test
        </button>
        {// Botón para debuggear auth pruebas
        }
        <button
          onClick={() => console.log('Auth state:', auth?.currentUser)}
          style={{
            background: '#6b7280',
            color: 'white',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          <i className="fas fa-bug"></i> Debug Auth
        </button>



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
          {/* MOSTRAR HISTORICO O LISTA DE ÁREAS */}
          {showHistoricalReports ? (
            <HistoricalReports />
          ) : (
            <>
              <AreaList areas={filteredAreas} onToggle={toggleRecibido} />
              <p className="note">
                {filteredAreas.length} {filteredAreas.length === 1 ? 'área encontrada' : 'áreas encontradas'}
                {activeFilter !== "all" && ` (filtrado por ${activeFilter})`}
              </p>
            </>
          )}
        </>
      )}

    </div>
  );
}