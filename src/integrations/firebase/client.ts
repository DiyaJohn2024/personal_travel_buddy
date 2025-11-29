import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
  apiKey: "AIzaSyAKwMh4zr-MST1l2N-2xo_wjiM-RF21afE",
  authDomain: "studio-7809401942-b6338.firebaseapp.com",
  projectId: "studio-7809401942-b6338",
  storageBucket: "studio-7809401942-b6338.appspot.com",
  messagingSenderId: "924129059458",
  appId: "1:924129059458:web:b95fcbd822570e51fe8a9b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
