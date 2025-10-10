// src/components/Providers.jsx
"use client";

import React from "react";
import { AuthProvider } from "./AuthoContext";

export default function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
