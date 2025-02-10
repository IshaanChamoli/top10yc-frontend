'use client';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // First log - Search initiated
    // console.log('🔎 Search initiated:', {
    //   query: query,
    //   timestamp: new Date().toISOString()
    // });

    // Call the original search function
    onSearch(query);

    // Store the search in Firebase
    try {
      // Log attempt to store
      // console.log('📝 Preparing Firestore document:', {
      //   query: query,
      //   db: !!db,
      //   collectionPath: 'searches'
      // });

      // Create the search data
      const searchData = {
        query: query,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        userAgent: window.navigator.userAgent
      };

      // Log the data being sent
      // console.log('💾 Attempting to store data:', searchData);

      // Get collection reference
      const searchesCollection = collection(db, 'searches');
      // console.log('📁 Got collection reference');

      // Add the document
      const docRef = await addDoc(searchesCollection, searchData);
      
      // Success logs
      // console.log('✅ Search stored successfully!', {
      //   documentId: docRef.id,
      //   collection: 'searches',
      //   query: query
      // });

    } catch (error) {
      // Detailed error logging
      console.error('❌ Failed to store search:', {
        error: error.message,
        errorCode: error.code,
        errorName: error.name,
        query: query,
        hasDb: !!db,
        stack: error.stack
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search companies..."
        className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--yc-orange)] focus:border-transparent"
      />
    </form>
  );
} 