import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAIyvoC7rAFPLeixIV6FJH4QXx3GdgQuk0",
  authDomain: "twilight-collections.firebaseapp.com",
  projectId: "twilight-collections",
  storageBucket: "twilight-collections.firebasestorage.app",
  messagingSenderId: "832630206089",
  appId: "1:832630206089:web:32267a78fb1414922d2058",
  measurementId: "G-3DFC9B8ENK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
