import React from "react";

const NotFound = () => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "80vh",
    color: "#333"
  }}>
    <h1 style={{ fontSize: "4rem", marginBottom: 0, color: "#d55f5fff" }}>404</h1>
    <h2 style={{ fontWeight: 700, margin: "12px 0" }}>Resource Not Found</h2>
    {/* <p style={{ fontSize: "0.9rem", color: "#888" }}>
      The page or resource you are looking for does not exist.<br />
      Please check the URL or return to the homepage.
    </p> */}
    <a href="/" style={{
      marginTop: 24,
      padding: "10px 28px",
      background: "#ff0000",
      color: "#fff",
      borderRadius: 8,
      textDecoration: "none",
      fontWeight: 600,
      fontSize: "1.1rem"
    }}>Go Home</a>
  </div>
);

export default NotFound;
