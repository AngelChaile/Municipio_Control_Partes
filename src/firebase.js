// Replace the firebaseConfig object with your Firebase web app config.
// You can find it in Firebase Console -> Project settings -> General -> Your apps (Web)
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFuibt-wLnMGCqFHxH15JCRGsUXWvMPqA",
  authDomain: "municipio-control-partes.firebaseapp.com",
  projectId: "municipio-control-partes",
  storageBucket: "municipio-control-partes.firebasestorage.app",
  messagingSenderId: "892284199857",
  appId: "1:892284199857:web:92ff9cc673b092e7ea5390"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
