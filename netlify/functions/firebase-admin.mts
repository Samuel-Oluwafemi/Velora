import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const firebaseApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        storageBucket:
          process.env.FIREBASE_STORAGE_BUCKET ||
          process.env.VITE_FIREBASE_STORAGE_BUCKET,
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });

export const adminDb = getFirestore(firebaseApp);
export const adminAuth = getAuth(firebaseApp);