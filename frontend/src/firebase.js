import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD14NahUhxs_j0cevu_07UAHY567Gva-IY",
  authDomain: "ai-image-studio-483cd.firebaseapp.com",
  projectId: "ai-image-studio-483cd",
  storageBucket: "ai-image-studio-483cd.firebasestorage.app",
  messagingSenderId: "623866380558",
  appId: "1:623866380558:web:410668cfe1193125e0175f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();