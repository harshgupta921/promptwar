import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
};

// Initialize Firebase
// Initialize Firebase safely
let app: any;
let auth: any;
let db: any;
let googleProvider: any;

const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY";

if (isConfigured) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
        googleProvider = new GoogleAuthProvider();
    } catch (e) {
        console.error("Firebase Init Error:", e);
    }
} else {
    // Mock for development without keys or server-side build
    if (typeof window !== "undefined") {
        console.warn("Firebase credentials missing. Auth and excessive features disabled.");
    }
    app = null;
    auth = { currentUser: null };
    db = {};
    googleProvider = {};
}

export { app, auth, db, googleProvider };
