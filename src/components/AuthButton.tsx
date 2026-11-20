"use client";
import { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import type { User as FirebaseUser } from "firebase/auth";
import { auth, googleProvider, signInWithPopup, signOut } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export function AuthButton() {
  const [user,    setUser   ] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  const handleSignIn = async () => {
    if (!auth) return;
    setLoading(true);
    try { await signInWithPopup(auth, googleProvider); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  if (user) {
    return (
      <button
        onClick={handleSignOut}
        className="btn-ghost flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg"
      >
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full" />
        ) : (
          <User className="w-4 h-4" />
        )}
        <span className="max-w-28 truncate text-sm font-medium" style={{ color: "var(--text-1)" }}>
          {user.displayName ?? user.email}
        </span>
        <LogOut className="w-3.5 h-3.5" style={{ color: "var(--text-3)" }} />
      </button>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className="btn-ghost flex items-center gap-2 px-3.5 py-1.5 text-sm rounded-lg disabled:opacity-50"
    >
      <User className="w-4 h-4" />
      {loading ? "Signing in…" : "Sign in with Google"}
    </button>
  );
}
