'use client';
import { collection, addDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { getDb } from './components/FirebaseInitializer';

// Function to store search history
export const storeSearch = async (searchQuery, filters = {}) => {
  // console.log('🔍 Starting search storage process...', { query: searchQuery });
  
  try {
    // Try getting db both ways to ensure we have a connection
    let db = getDb();
    if (!db) {
      // console.log('⚠️ No DB from getDb(), trying direct initialization...');
      db = getFirestore();
    }
    
    if (!db) {
      throw new Error('Could not initialize Firestore - both methods failed');
    }

    // console.log('✅ Database connection established');

    // Validate the data
    if (!searchQuery || typeof searchQuery !== 'string') {
      throw new Error('Invalid search query');
    }

    const searchData = {
      query: searchQuery,
      timestamp: serverTimestamp(),
      filters: filters,
      createdAt: new Date().toISOString()
    };

    // console.log('📝 Preparing to save search:', searchData);
    
    // Explicitly create collection reference
    const searchesRef = collection(db, 'searches');
    // console.log('Collection reference created for "searches"');

    try {
      const docRef = await addDoc(searchesRef, searchData);
      // console.log('✅ Search stored successfully! Document ID:', docRef.id);
      
      // Verify the save
      if (!docRef.id) {
        throw new Error('Save appeared to succeed but no document ID was returned');
      }

      return docRef.id;
    } catch (writeError) {
      console.error('❌ Error writing to collection:', writeError);
      // Log specific write error details
      console.error('Write error details:', {
        code: writeError.code,
        message: writeError.message,
        name: writeError.name
      });
      throw writeError;
    }

  } catch (error) {
    console.error('❌ Error in storeSearch:', {
      errorCode: error.code,
      errorMessage: error.message,
      errorName: error.name,
      errorStack: error.stack
    });
    throw error;
  }
}; 