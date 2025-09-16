import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, getFirestore } from "firebase/firestore";

export default function TestFirestore() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 👇 Cambia "areas" por otra colección si querés probar otra
        const querySnapshot = await getDocs(collection(db, "areas"));
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(docs);
      } catch (err) {
        console.error("Error al leer Firestore:", err);
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🔥 Test Firestore</h2>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {data.length === 0 ? (
        <p>No hay datos en la colección.</p>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}
