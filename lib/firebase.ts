/* eslint-disable */
// lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ✅ Only import analytics types/functions if needed
// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAtzzmCq2n7ybhC48YmRcWSJA1ln2TFeqo",
  authDomain: "ai-resume-analyzer-6911a.firebaseapp.com",
  projectId: "ai-resume-analyzer-6911a",
  storageBucket: "ai-resume-analyzer-6911a.appspot.com", // 👈 fixed the typo here ("app" ➝ "appspot.com")
  messagingSenderId: "637617024462",
  appId: "1:637617024462:web:9932fc99dc0aa18dd40f9f",
  measurementId: "G-XXYKKXQK8T",
};

// Ensure Firebase is only initialized once (important for Next.js)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Export Firestore DB
export const db = getFirestore(app);
