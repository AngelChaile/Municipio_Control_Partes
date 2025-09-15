// /pages/index.js
import { useEffect, useState } from "react";
import { db } from "../lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "areas"));
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(items);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Cargando datos...</p>;

  return (
    <div>
      <h1>Datos desde Firebase Firestore</h1>
      {data.length === 0 ? (
        <p>No hay datos disponibles</p>
      ) : (
        <ul>
          {data.map((item) => (
            <li key={item.id}>
              <strong>{item.nombre}</strong> - {item.descripcion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
