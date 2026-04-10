import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // PASTE YOUR COPIED CONFIG HERE
  apiKey: "AIzaSyBZS3zfcG2k3W1_NyhN6Utt4ZYQHYuC-6c",
  authDomain: "cleanx-56959.firebaseapp.com",
  projectId: "cleanx-56959",
  storageBucket: "cleanx-56959.appspot.com",
  messagingSenderId: "105234567890",
  appId: "1:468346844919:web:61afa0e03127b1efbcc5f2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();