import React, { createContext, useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

export const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [sections, setSections] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen to sections in real-time
  useEffect(() => {
    const q = query(collection(db, 'sections'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
      setSections(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching sections:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to items in real-time
  useEffect(() => {
    const q = query(collection(db, 'items'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

  // --- Sections ---
  const addSection = async (name) => {
    await addDoc(collection(db, 'sections'), {
      id: `sec-${Date.now()}`,
      name,
      createdAt: serverTimestamp()
    });
  };

  const deleteSection = async (firestoreId) => {
    await deleteDoc(doc(db, 'sections', firestoreId));
  };

  const updateSection = async (firestoreId, newName) => {
    await updateDoc(doc(db, 'sections', firestoreId), { name: newName });
  };

  // --- Items ---
  const addItem = async (item) => {
    await addDoc(collection(db, 'items'), {
      ...item,
      createdAt: serverTimestamp()
    });
  };

  const deleteItem = async (firestoreId) => {
    await deleteDoc(doc(db, 'items', firestoreId));
  };

  const updateItem = async (firestoreId, updatedItem) => {
    await updateDoc(doc(db, 'items', firestoreId), updatedItem);
  };

  return (
    <StoreContext.Provider value={{
      sections,
      items,
      loading,
      addSection,
      deleteSection,
      updateSection,
      addItem,
      deleteItem,
      updateItem
    }}>
      {children}
    </StoreContext.Provider>
  );
};
