import React from "react";
import NavBar from "./NavBar.jsx";

export default function Layout({ children }) {
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <NavBar />
      <main style={{ flex: 1, padding: 20 }}>{children}</main>

      <footer
        style={{
          textAlign: "center",
          padding: 12,
          marginTop: 20,
          color: "#666",
          fontSize: 13,
          background: "transparent",
        }}
      >
        Dhurairaaj@2025 Job Card management system
      </footer>
    </div>
  );
}
