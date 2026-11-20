import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function initFirebase() {
  if (typeof window === "undefined") return;
  if (!firebaseConfig.projectId) return;
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn("Firebase init failed:", err);
  }
}

initFirebase();

const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider, signInWithPopup, signOut };

export type LeadStatus = "pending" | "approved" | "rejected";

export interface FirestoreLead {
  id: string;
  businessName: string;
  niche: string;
  city: string;
  websiteUrl: string;
  googleRating?: number;
  reviewCount?: number;
  leadScore: number;
  priorityTier: "High" | "Medium" | "Low";
  status: LeadStatus;
  auditResult?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}
