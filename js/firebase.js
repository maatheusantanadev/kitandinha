// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7EruNNAAa7fVJsVyT6SXojLPQPlo0wi0",
  authDomain: "kitandinha-5212f.firebaseapp.com",
  projectId: "kitandinha-5212f",
  storageBucket: "kitandinha-5212f.firebasestorage.app",
  messagingSenderId: "1083262950549",
  appId: "1:1083262950549:web:998b72f86e4dccab2bcf9c",
  measurementId: "G-0MXZWJPKW3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Exportando o db e as funções usadas no outro arquivo
export { db, collection, addDoc, getDocs, deleteDoc, doc };
