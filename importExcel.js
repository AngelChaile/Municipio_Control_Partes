import fs from "fs";
import * as XLSX from "xlsx/xlsx.mjs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Habilitar fs en XLSX (necesario en Node.js)
XLSX.set_fs(fs);

// 🚨 Usa tu propia config de firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyBFuibt-wLnMGCqFHxH15JCRGsUXWvMPqA",
  authDomain: "municipio-control-partes.firebaseapp.com",
  projectId: "municipio-control-partes",
  storageBucket: "municipio-control-partes.firebasestorage.app",
  messagingSenderId: "892284199857",
  appId: "1:892284199857:web:92ff9cc673b092e7ea5390"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Leer Excel ---
const file = XLSX.readFile("./areas.xlsx"); // poné el nombre de tu archivo
const sheet = file.Sheets[file.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

// --- Importar a Firestore ---
async function importData() {
  for (const row of data) {
    const id = row.cod?.toString().replace(/\s+/g, ""); // limpio espacios en ID
    try {
      await setDoc(doc(db, "areas", id), {
        cod: row.cod,
        nombre: row.nombre,
        padre: row.padre || null,
        recibido: row.recibido === true || row.recibido === "true"
      });
      console.log(`✔️ Área ${row.nombre} cargada`);
    } catch (e) {
      console.error(`❌ Error en ${row.nombre}:`, e);
    }
  }
  console.log("✅ Importación finalizada.");
}

importData();
