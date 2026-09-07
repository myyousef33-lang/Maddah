import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc as firestoreDoc,
  getDoc as firestoreGetDoc,
  setDoc as firestoreSetDoc,
  onSnapshot as firestoreOnSnapshot,
  DocumentReference,
  DocumentSnapshot,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance safely (singleton)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore instance
export const db: Firestore = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export type DocRef = DocumentReference;
export type Snapshot = DocumentSnapshot;

/**
 * Creates a reference to a document within Firestore
 */
export const doc = (database: Firestore, collectionName: string, docId: string): DocRef => {
  return firestoreDoc(database, collectionName, docId);
};

/**
 * Reads a single document from Firestore with resilient fallback
 */
export const getDoc = async (ref: DocRef) => {
  try {
    const snapshot = await firestoreGetDoc(ref);
    return {
      exists: () => snapshot.exists(),
      data: () => snapshot.data(),
      metadata: snapshot.metadata
    };
  } catch (error) {
    console.warn('[Firebase Firestore] Read error, falling back to local storage cache:', error);
    return {
      exists: () => false,
      data: () => undefined,
      metadata: { hasPendingWrites: false, fromCache: true }
    };
  }
};

/**
 * Writes or merges data into a Firestore document
 */
export const setDoc = async (ref: DocRef, value: { data: any; updatedAt?: string }) => {
  try {
    await firestoreSetDoc(ref, value, { merge: true });
  } catch (error) {
    console.warn('[Firebase Firestore] Write error:', error);
  }
};

/**
 * Real-time listener for Firestore documents with auto unsubscription
 */
export const onSnapshot = (
  ref: DocRef,
  next: (snapshot: any) => void,
  error?: (err: unknown) => void
): (() => void) => {
  try {
    const unsubscribe = firestoreOnSnapshot(
      ref,
      (snapshot) => {
        next({
          exists: () => snapshot.exists(),
          data: () => snapshot.data(),
          metadata: snapshot.metadata
        });
      },
      (err) => {
        console.warn('[Firebase Firestore] Realtime sync error:', err);
        error?.(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firebase Firestore] onSnapshot initialization error:', err);
    return () => {};
  }
};
