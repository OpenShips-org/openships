// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyAk2sPOZkdl-RvB9NA7AZIywwReEAFMdns",

  authDomain: "openships-500f9.firebaseapp.com",

  projectId: "openships-500f9",

  storageBucket: "openships-500f9.firebasestorage.app",

  messagingSenderId: "962794742649",

  appId: "1:962794742649:web:e62f8a07c94b8ecf8e45a8",

  measurementId: "G-5901XXREHT"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);