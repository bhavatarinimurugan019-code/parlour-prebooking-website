import { createContext, useContext, useEffect, useState } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db, firebaseConfigured } from "../firebase/config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false);
      return undefined;
    }
    return onAuthStateChanged(auth, async current => {
      setUser(current);
      setProfile(current ? (await getDoc(doc(db, "users", current.uid))).data() || null : null);
      setLoading(false);
    });
  }, []);

  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const profileSnapshot = await getDoc(doc(db, "users", result.user.uid));
    const nextProfile = profileSnapshot.data() || null;
    setProfile(nextProfile);
    return { ...result, profile: nextProfile };
  }
  async function register({ name, email, phone, password }) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const nextProfile = { uid: result.user.uid, name, email, phone, role: "customer", createdAt: Timestamp.now() };
    await setDoc(doc(db, "users", result.user.uid), nextProfile);
    setProfile(nextProfile);
    return result;
  }
  async function logout() { return signOut(auth); }

  return <AuthContext.Provider value={{ user, profile, loading, login, register, logout, configured: firebaseConfigured }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
