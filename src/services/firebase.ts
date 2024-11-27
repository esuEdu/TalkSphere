import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getDatabase, ref, onDisconnect, set } from 'firebase/database';


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAt7sOV4bL1PqupcI5lc6bOscF8nxzvP0Y",
  authDomain: "talksphere-e7b10.firebaseapp.com",
  databaseURL: "https://talksphere-e7b10-default-rtdb.firebaseio.com",
  projectId: "talksphere-e7b10",
  storageBucket: "talksphere-e7b10.firebasestorage.app",
  messagingSenderId: "947937033135",
  appId: "1:947937033135:web:a5cf79021b5ca08f9dcd5a",
  measurementId: "G-891Q6SL8KB"
};


// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const firestore = getFirestore(firebase);
const firebaseAuth = getAuth(firebase);
const storage = getStorage(firebase);
const realtimeDB = getDatabase(firebase);



export { firebase, firestore, firebaseAuth, storage, realtimeDB };   