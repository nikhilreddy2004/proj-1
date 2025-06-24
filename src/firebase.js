import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyAEonQyS-jP2Z4XM6OOxzeo_rOagX-U_dk",
  authDomain: "ngo-mvp-app.firebaseapp.com",
  projectId: "ngo-mvp-app",
  storageBucket: "ngo-mvp-app.firebasestorage.app",
  messagingSenderId: "774363048476",
  appId: "1:774363048476:web:0b5885f21853c62d8ccdd9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage }; 