// Import the functions you need from Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBajgwQSLZ6O-i31eRg3B_i8n4RUWlpzqI",
  authDomain: "babylon-assesment.firebaseapp.com",
  projectId: "babylon-assesment",
  storageBucket: "babylon-assesment.firebasestorage.app",
  messagingSenderId: "325382662595",
  appId: "1:325382662595:web:58be7f971af901864bb576",
  measurementId: "G-P3VN82XFMC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore for storing additional user data
export const db = getFirestore(app);
