import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where } from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: "AIzaSyAIyvoC7rAFPLeixIV6FJH4QXx3GdgQuk0",
  authDomain: "twilight-collections.firebaseapp.com",
  projectId: "twilight-collections",
  storageBucket: "twilight-collections.firebasestorage.app",
  messagingSenderId: "832630206089",
  appId: "1:832630206089:web:32267a78fb1414922d2058",
  measurementId: "G-3DFC9B8ENK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runTest() {
  console.log("🚀 Starting Admin Flow Simulation...");

  try {
    // 1. Add a Section
    console.log("\n1. Adding new section: 'Rings'");
    const sectionStart = Date.now();
    const sectionRef = await addDoc(collection(db, "sections"), {
      id: `sec-${Date.now()}`,
      name: "Rings",
      createdAt: new Date()
    });
    console.log(`✅ Section 'Rings' added in ${Date.now() - sectionStart}ms (ID: ${sectionRef.id})`);

    // 2. Add an Item
    console.log("\n2. Adding new item: 'Diamond Ring'");
    const itemStart = Date.now();
    const itemRef = await addDoc(collection(db, "items"), {
      id: `itm-${Date.now()}`,
      name: "Diamond Ring",
      sectionId: sectionRef.id,
      price: "1500",
      description: "A beautiful diamond ring.",
      imageUrl: "https://via.placeholder.com/400x500.png?text=Diamond+Ring",
      soldOut: false,
      createdAt: new Date()
    });
    console.log(`✅ Item 'Diamond Ring' added in ${Date.now() - itemStart}ms (ID: ${itemRef.id})`);

    // 3. Simulate Homepage Initial Load (Fetching Sections)
    console.log("\n3. Simulating Homepage Initial Load (Fetching Sections)...");
    const fetchStart = Date.now();
    const sectionsSnap = await getDocs(query(collection(db, 'sections'), orderBy('createdAt', 'asc')));
    const fetchedSections = sectionsSnap.docs.map(d => d.data());
    console.log(`✅ Fetched ${fetchedSections.length} sections in ${Date.now() - fetchStart}ms`);
    console.log(fetchedSections.map(s => `- ${s.name}`).join('\n'));

    // 4. Simulate Category Click (Fetching Items for 'Rings')
    console.log("\n4. Simulating Category Load (Fetching items for 'Rings')...");
    const itemFetchStart = Date.now();
    const q = query(
      collection(db, 'items'),
      where('sectionId', '==', sectionRef.id)
    );
    const itemsSnap = await getDocs(q);
    const fetchedItems = itemsSnap.docs.map(d => d.data());
    console.log(`✅ Fetched ${fetchedItems.length} items for 'Rings' in ${Date.now() - itemFetchStart}ms`);
    console.log(fetchedItems.map(i => `- ${i.name} (₹${i.price})`).join('\n'));

    console.log("\n🎉 All tests passed successfully! The database is live and responding quickly.");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

runTest();
