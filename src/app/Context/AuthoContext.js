// src/context/AuthContext.jsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // load persisted user on mount (client-side only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("lp_user"); // lp_ = "livepoll"
      if (raw) setUser(JSON.parse(raw));
    } catch (err) {
      console.warn("Failed to read stored user:", err);
    }
  }, []);

  // helper: clear vote_* keys
  const clearVotesFromStorage = () => {
    if (typeof window === "undefined") return;
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith("vote_")) localStorage.removeItem(k);
      });
    } catch (e) {
      console.warn("Failed clearing votes:", e);
    }
  };

  // login: set context + persist minimal user info
  const login = (userObj) => {
    setUser(userObj);
    try {
      localStorage.setItem("lp_user", JSON.stringify(userObj));
      // clear previous votes (so new user starts clean)
      clearVotesFromStorage();
    } catch (err) {
      console.warn("Failed to persist user:", err);
    }
  };

  // logout: clear everything user-related
  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("lp_user");
      clearVotesFromStorage();
    } catch (err) {
      console.warn("Failed to clear storage on logout:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// convenient hook
export const useAuth = () => useContext(AuthContext);
