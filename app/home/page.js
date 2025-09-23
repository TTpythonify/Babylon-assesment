"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("User");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setName(userDoc.data().fullName);
        } else {
          setName("User");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Could not fetch user info. Check your network.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Logout failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        color: "#222",
        flexDirection: "column"
      }}>
        <p>Loading...</p>
        <div style={{ marginTop: "10px", width: "40px", height: "40px", border: "4px solid #ccc", borderTop: "4px solid #0070f3", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f0f2f5",
      fontFamily: "Arial, sans-serif",
      padding: "20px"
    }}>
      <h1 style={{ color: "#222", fontSize: "28px", textAlign: "center" }}>
        Hey, {name}! You’re successfully logged in.
      </h1>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      <button 
        onClick={handleLogout} 
        style={{
          marginTop: "20px",
          padding: "12px 20px",
          borderRadius: "6px",
          border: "none",
          backgroundColor: "#0070f3",
          color: "#fff",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        Logout
      </button>
    </div>
  );
}
