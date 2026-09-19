import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

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
const storage = getStorage(app);

async function testUpload() {
  console.log("🚀 Testing Firebase Storage Upload...");
  try {
    const storageRef = ref(storage, `test_upload_${Date.now()}.txt`);
    
    // Upload a simple string to test permissions
    console.log("Uploading file...");
    const snapshot = await uploadString(storageRef, 'Hello World', 'raw');
    console.log("✅ File uploaded successfully!");
    
    console.log("Getting download URL...");
    const url = await getDownloadURL(snapshot.ref);
    console.log(`✅ Download URL: ${url}`);
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Upload failed:");
    console.error(error);
    if (error.customData) console.error("Custom Data:", error.customData);
    if (error.serverResponse) console.error("Server Response:", error.serverResponse);
    process.exit(1);
  }
}

testUpload();
