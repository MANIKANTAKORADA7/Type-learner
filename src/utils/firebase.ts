import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIJLN-lDlN1bGLgzBX46Q7a0d__t5IOCE",
  authDomain: "type-learner-7f4c3.firebaseapp.com",
  projectId: "type-learner-7f4c3",
  storageBucket: "type-learner-7f4c3.firebasestorage.app",
  messagingSenderId: "496416903090",
  appId: "1:496416903090:web:35b69f237065a678ee5eab",
  measurementId: "G-3X30NZP60T"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
