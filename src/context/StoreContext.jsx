import React, { createContext, useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy
} from 'firebase/firestore/lite';
import { db } from '../firebase';

export const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [sections, setSections] = useState(() => {
    const cached = localStorage.getItem('twc_cache_sections');
    return cached ? JSON.parse(cached) : [];
  });
  const [itemsMap, setItemsMap] = useState(() => {
    const cached = localStorage.getItem('twc_cache_items_map');
    return cached ? JSON.parse(cached) : {};
  });
  const [loading, setLoading] = useState(sections.length === 0);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);

  // Fetch sections (categories) on mount
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const sectionsSnap = await getDocs(query(collection(db, 'sections'), orderBy('createdAt', 'asc')));
        const fetchedSections = sectionsSnap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
        
        setSections(fetchedSections);
        localStorage.setItem('twc_cache_sections', JSON.stringify(fetchedSections));
      } catch (err) {
        console.error('Error fetching sections:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, []);

  // Set initial active section once sections are loaded
  useEffect(() => {
    if (sections.length > 0 && !activeSectionId) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId]);

  // Fetch items for the active section dynamically
  useEffect(() => {
    if (!activeSectionId) return;

    const fetchItemsForSection = async () => {
      // If we don't have items cached for this section, show local loading spinner
      if (!itemsMap[activeSectionId]) {
        setLoadingItems(true);
      }

      try {
        const q = query(
          collection(db, 'items'),
          where('sectionId', '==', activeSectionId)
        );
        const itemsSnap = await getDocs(q);
        
        // Sort in memory to avoid Firestore composite index requirement
        const fetchedItems = itemsSnap.docs
          .map(d => ({ firestoreId: d.id, ...d.data() }))
          .sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeA - timeB;
          });

        setItemsMap(prev => {
          const updated = { ...prev, [activeSectionId]: fetchedItems };
          localStorage.setItem('twc_cache_items_map', JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        console.error(`Error fetching items for section ${activeSectionId}:`, err);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItemsForSection();
  }, [activeSectionId]);

  // --- Sections ---
  const addSection = async (name) => {
    const docRef = await addDoc(collection(db, 'sections'), {
      id: `sec-${Date.now()}`,
      name,
      createdAt: new Date()
    });
    const newSection = { firestoreId: docRef.id, id: `sec-${Date.now()}`, name };
    setSections(prev => {
      const updated = [...prev, newSection];
      localStorage.setItem('twc_cache_sections', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteSection = async (firestoreId) => {
    await deleteDoc(doc(db, 'sections', firestoreId));
    setSections(prev => {
      const updated = prev.filter(s => s.firestoreId !== firestoreId);
      localStorage.setItem('twc_cache_sections', JSON.stringify(updated));
      return updated;
    });
  };

  const updateSection = async (firestoreId, newName) => {
    await updateDoc(doc(db, 'sections', firestoreId), { name: newName });
    setSections(prev => {
      const updated = prev.map(s => s.firestoreId === firestoreId ? { ...s, name: newName } : s);
      localStorage.setItem('twc_cache_sections', JSON.stringify(updated));
      return updated;
    });
  };

  // --- Items ---
  const addItem = async (item) => {
    const docRef = await addDoc(collection(db, 'items'), {
      ...item,
      createdAt: new Date()
    });
    const newItem = { firestoreId: docRef.id, ...item };
    setItemsMap(prev => {
      const sectionItems = prev[item.sectionId] || [];
      const updated = { ...prev, [item.sectionId]: [...sectionItems, newItem] };
      localStorage.setItem('twc_cache_items_map', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteItem = async (firestoreId) => {
    await deleteDoc(doc(db, 'items', firestoreId));
    setItemsMap(prev => {
      const updated = {};
      Object.keys(prev).forEach(sectionId => {
        updated[sectionId] = prev[sectionId].filter(i => i.firestoreId !== firestoreId);
      });
      localStorage.setItem('twc_cache_items_map', JSON.stringify(updated));
      return updated;
    });
  };

  const updateItem = async (firestoreId, updatedItem) => {
    await updateDoc(doc(db, 'items', firestoreId), updatedItem);
    setItemsMap(prev => {
      const updated = {};
      Object.keys(prev).forEach(sectionId => {
        updated[sectionId] = prev[sectionId].map(i => i.firestoreId === firestoreId ? { ...i, ...updatedItem } : i);
      });
      localStorage.setItem('twc_cache_items_map', JSON.stringify(updated));
      return updated;
    });
  };

  // Compatibility helpers for Admin Dashboard
  const allItemsList = Object.values(itemsMap).flat();

  return (
    <StoreContext.Provider value={{
      sections,
      items: allItemsList, // admin compatibility
      activeSectionItems: itemsMap[activeSectionId] || [],
      loading,
      loadingItems,
      activeSectionId,
      setActiveSectionId,
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
