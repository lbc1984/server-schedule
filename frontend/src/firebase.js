import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCXSu97M3_ONeEV5GL2bn9MheySzvjTAzQ",
  authDomain: "mqtt-d8e66.firebaseapp.com",
  databaseURL: "https://mqtt-d8e66-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mqtt-d8e66",
  storageBucket: "mqtt-d8e66.firebasestorage.app",
  messagingSenderId: "324700447868",
  appId: "1:324700447868:web:9106ccd46a65a730ae95f9",
  measurementId: "G-R1EDFFDF0K"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export const provider = new GoogleAuthProvider();
export const db_firestore = getFirestore(app);
export const authReady = () =>
  new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })