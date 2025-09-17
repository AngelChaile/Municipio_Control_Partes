// App.jsx
import React, { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch, getDocs } from "firebase/firestore";
import AreaList from "./components/AreaList";
import SearchBar from "./components/SearchBar";
import ResetButton from "./components/ResetButton";
import Dashboard from "./components/Dashboard"; // <- agregamos el Dashboard

export default function App() {
  const [areas, setAreas] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "areas"), orderBy("cod"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAreas(docs);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching areas:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

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
      alert("Error al actualizar. Revisa permisos de Firestore o tu conexión.");
    }
  };

  const vaciarTodo = async () => {
    if (!window.confirm("¿Vaciar todas las marcas? Esta acción es irreversible.")) return;
    try {
      const snap = await getDocs(collection(db, "areas"));
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.update(d.ref, { enviado: false, updatedBy: null, updatedAt: null }));
      await batch.commit();
    } catch (e) {
      console.error(e);
      alert("Error al vaciar. Revisa permisos.");
    }
  };

  const filtered = areas.filter((a) => {
    if (!filter) return true;
    return (a.nombre || "").toLowerCase().includes(filter.toLowerCase()) || (a.cod || "").includes(filter);
  });

  return (
    <div className="container">
      {/* Dashboard con estadísticas */}
      <Dashboard areas={areas} />

      {/* Lista de Áreas */}
      <header>
        <div class="header-content">
          <div>
            <h1>Sistema de Control de Partes Diarios</h1>
            <div class="date-display" id="currentDate"></div>
          </div>
          <img src="/favicon.png" alt="Logo Municipio" class="logo" />
        </div>
      </header>
      {/* <h1 style={{ marginTop: "20px" }}>Control de Partes — Municipio</h1> */}
      <div className="controls">
        <SearchBar value={filter} onChange={setFilter} />
        <ResetButton onReset={vaciarTodo} />
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <AreaList areas={filtered} onToggle={toggleEnviado} />
          <p style={{ marginTop: 12 }}>
            <em>Nota: los cambios se sincronizan en tiempo real entre usuarios conectados.</em>
          </p>
        </>
      )}
    </div>
  );
}
