"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push("/home");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Clear inputs when switching between login/register
  useEffect(() => {
    clearForm();
  }, [isLogin]);

  const clearForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const toggleLogin = () => {
    setIsLogin(!isLogin);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || (!isLogin && !fullName)) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login existing user
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/home");
      } else {
        // Register new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save full name in Firestore
        await setDoc(doc(db, "users", user.uid), { 
          fullName,
          email: user.email,
          createdAt: new Date().toISOString()
        });

        router.push("/home");
      }
    } catch (err) {
      console.error("Authentication error:", err);
      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email. Please register first.");
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Invalid email or password. Please try again.");
          break;
        case "auth/email-already-in-use":
          setError("This email is already in use. Please login instead.");
          break;
        case "auth/invalid-email":
          setError("Invalid email format.");
          break;
        case "auth/weak-password":
          setError("Password should be at least 6 characters.");
          break;
        default:
          setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f0f2f5",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#222" }}>
          {isLogin ? "Login" : "Register"}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {!isLogin && (
            <div>
              <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px", color: "#222" }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ 
                  padding: "10px", 
                  borderRadius: "6px", 
                  border: "1px solid #ccc", 
                  fontSize: "16px", 
                  width: "100%", 
                  color: "#222",
                  boxSizing: "border-box"
                }}
                required
              />
            </div>
          )}
          <div>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px", color: "#222" }}>
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                padding: "10px", 
                borderRadius: "6px", 
                border: "1px solid #ccc", 
                fontSize: "16px", 
                width: "100%", 
                color: "#222",
                boxSizing: "border-box"
              }}
              required
            />
          </div>
          <div>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px", color: "#222" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                padding: "10px", 
                borderRadius: "6px", 
                border: "1px solid #ccc", 
                fontSize: "16px", 
                width: "100%", 
                color: "#222",
                boxSizing: "border-box"
              }}
              required
            />
          </div>
          {error && <p style={{ color: "red", textAlign: "center", fontSize: "14px" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ 
              padding: "12px", 
              borderRadius: "6px", 
              border: "none", 
              backgroundColor: loading ? "#ccc" : "#0070f3", 
              color: "#fff", 
              fontSize: "16px", 
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.3s"
            }}
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "20px", color: "#555" }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span 
            onClick={toggleLogin} 
            style={{ 
              color: "#0070f3", 
              cursor: "pointer", 
              fontWeight: "bold",
              textDecoration: "underline"
            }}
          >
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}