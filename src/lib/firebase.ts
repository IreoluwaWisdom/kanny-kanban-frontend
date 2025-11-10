import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDKNoocYWHD11WrVwK_GAUG9_jl9kOpvjI",
  authDomain: "kannykaban.firebaseapp.com",
  projectId: "kannykaban",
  storageBucket: "kannykaban.firebasestorage.app",
  messagingSenderId: "892452008985",
  appId: "1:892452008985:web:99f7cc055a7b91c38d6688",
  measurementId: "G-8YCNKGGZE4"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;

