'use client';
import { useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

let app;
let db;
let isInitialized = false;

export function FirebaseInitializer() {
  useEffect(() => {
    const initFirebase = async () => {
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      };

      // Verify all config values are present
      const missingKeys = Object.entries(firebaseConfig)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingKeys.length > 0) {
        console.error('❌ Missing Firebase config keys:', missingKeys);
        return;
      }

    //   console.log('🔥 Initializing Firebase with config:', {
    //     projectId: firebaseConfig.projectId,
    //     hasAllKeys: Object.values(firebaseConfig).every(val => !!val)
    //   });

      try {
        if (!app) {
          app = initializeApp(firebaseConfig);
        //   console.log('✅ Firebase app initialized');
          
          db = getFirestore(app);
        //   console.log('✅ Firestore instance created');

          try {
            await enableIndexedDbPersistence(db);
            // console.log('✅ IndexedDB persistence enabled');
          } catch (persistenceError) {
            // console.warn('⚠️ Error enabling persistence:', persistenceError);
            // Continue anyway as this isn't critical
          }

          isInitialized = true;
        //   console.log('✅ Firebase fully initialized and ready!');
        }
      } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
      }
    };

    initFirebase();
  }, []);

  return null;
}

export function getDb() {
  if (!isInitialized || !db) {
    // console.error('❌ Attempting to use Firebase before initialization!');
    return null;
  }
//   console.log('✅ Returning initialized Firestore instance');
  return db;
} 