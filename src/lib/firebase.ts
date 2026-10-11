import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"],
  authDomain: "sreejas-bridal-boutique.firebaseapp.com",
  projectId: "sreejas-bridal-boutique",
  storageBucket: "sreejas-bridal-boutique.firebasestorage.app",
  messagingSenderId: "970013221116",
  appId: "1:970013221116:web:78e8d9bd87474c36a43779",
  measurementId: import.meta.env["VITE_FIREBASE_MEASUREMENT_ID"],
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

export function getFirebase() {
  if (!app) {
    if (!firebaseConfig.apiKey) {
      throw new Error("Firebase API key is missing. Check your .env file.");
    }

    app = getApps().some((existingApp) => existingApp.name === "[DEFAULT]")
      ? getApp()
      : initializeApp(firebaseConfig);

    if (app.options.projectId !== "sreejas-bridal-boutique") {
      throw new Error("Firebase project ID does not match the expected project.");
    }

    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  }

  return {
    app,
    auth: auth!,
    db: db!,
    storage: storage!,
  };
}

export const firebaseReady = Boolean(import.meta.env["VITE_FIREBASE_API_KEY"]);
