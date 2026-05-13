import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDVowtZruFoIhmKDkdEDc2bq0z46HEoWdI",
  authDomain: "careercompass-2f78a.firebaseapp.com",
  projectId: "careercompass-2f78a",
  storageBucket: "careercompass-2f78a.firebasestorage.app",
  messagingSenderId: "220745538007",
  appId: "1:220745538007:web:9b87e38138d2e2c6a9d392"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence);
export const db = getFirestore(app);
