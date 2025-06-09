
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, setDoc, doc, collection, query, where, getDocs } from "firebase/firestore"; // Исправлено: getFireStore на getFirestore
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyBBIWKK1uWP3aAQcPT8xiNjiDbzLZJ5Qow",
  authDomain: "chat-app-gs-19a20.firebaseapp.com",
  projectId: "chat-app-gs-19a20",
  storageBucket: "chat-app-gs-19a20.firebasestorage.app",
  messagingSenderId: "821916123428",
  appId: "1:821916123428:web:ba28e8cd98ef884f1233b1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey, There I am using chat app",
      lastSeen: Date.now()
    });
    await setDoc(doc(db, "chats", user.uid), {
      chatData: []
    });
  } catch (error) {
    console.error("Ошибка при регистрации:", error);
    toast.error("Произошла ошибка при регистрации. Пожалуйста, попробуйте снова.");
  }
}

const login = async (email, password) => {
  try{
    await signInWithEmailAndPassword(auth,email,password)
  } catch (error) {
    console.error(error);
    toast.error(error.code.split('/')[1].split('-').join(" "));
  }
}

const logout = async () => {
  try{
    await signOut(auth)
  } catch (error) {
    console.error(error);
    toast.error(error.code.split('/')[1].split('-').join(" "));
  }
}

const resetPass = async (email) => {
  if (!email) {
    toast.error("Enter Your Email");
    return null;
  }
  try {
    const userRef = collection(db, 'users');
    const q = query(userRef, where("email", "==", email));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth, email);
      toast.success("Reset Email Sent")
    }
    else {
      toast.error("Email doesn't exists")
    }
  } catch (error) {
    console.error(error);
    toast.error(error.message);
  }
}

export { signup, login, logout, auth, db, storage, resetPass, }