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
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.fullName || "User");
        } else {
          // If no document exists, use email as fallback 
          setName(user.email?.split('@')[0] || "User");
          console.log("No user document found, using email as fallback");
        }
        // Clear any previous errors if we successfully got some name
        setError("");
      } catch (err) {
        console.error("Error fetching user data:", err);
        // Use email as fallback if Firestore fails
        const emailName = user.email?.split('@')[0] || "User";
        setName(emailName);
        
        // Only show error if we couldn't get any name at all
        if (emailName === "User") {
          setError("Could not fetch user info. Using default name.");
        } else {
          // We have a fallback name, so don't show error to user
          setError("");
          console.log("Using email fallback due to Firestore error");
        }
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
        flexDirection: "column",
        backgroundColor: "#f0f2f5"
      }}>
        <div style={{ 
          backgroundColor: "#fff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <p style={{ marginBottom: "20px", fontSize: "16px" }}>Loading...</p>
          <div style={{ 
            margin: "0 auto",
            width: "40px", 
            height: "40px", 
            border: "4px solid #e0e0e0", 
            borderTop: "4px solid #0070f3", 
            borderRadius: "50%", 
            animation: "spin 1s linear infinite" 
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
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
      <div style={{
        backgroundColor: "#fff",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        textAlign: "center",
        maxWidth: "500px",
        width: "100%"
      }}>
        <h1 style={{ 
          color: "#222", 
          fontSize: "28px", 
          marginBottom: "20px",
          fontWeight: "bold"
        }}>
          Hey, {name}! You're successfully logged in.
        </h1>
        
        {error && (
          <div style={{ 
            color: "#d32f2f", 
            backgroundColor: "#ffebee", 
            padding: "10px", 
            borderRadius: "6px", 
            marginBottom: "20px",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}
        
        <button 
          onClick={handleLogout} 
          style={{
            padding: "12px 24px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#0070f3",
            color: "#fff",
            fontSize: "16px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "background-color 0.3s"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#0070f3"}
        >
          Logout
        </button>
        
      </div>
    </div>
  );
}