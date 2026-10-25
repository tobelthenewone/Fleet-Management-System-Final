import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import "./Staff.css";
import Logo from "../../assets/placeholder-symbol.jpg"; // Import the Zemen Bank logo
import api from "../../api/axios";

const navItems = [
  
];

const StaffNavigationBar = () => {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    // Optionally, you can also call the logout API
    await api.post("/auth/logout", { token: localStorage.getItem("accessToken") });
    localStorage.clear();

    window.location.href = "/fms/";
  };

  return (
    <nav
      className="staff-navbar"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        height: 72,
        background: "#fff",
        boxShadow: "0 4px 18px rgba(60,60,60,0.08)",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Left: Logo and Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          className="zemen-logo"
          style={{
            display: "flex",
            alignItems: "center",
            position: "relative",
            width: 320,
          }}
        >
          <img
            src={Logo}
            alt="Logo"
            style={{
              width: "140px",
              verticalAlign: "middle",
              marginRight: "10px",
              filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))",
            }}
          />
        </div>
        {/* Centered Title Overlay */}
        <div
          style={{
            position: "fixed",
            left: "50%",
            top: 0,
            transform: "translateX(-50%)",
            height: 72,
            display: "flex",
            alignItems: "center",
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 28,
              color: "#ff0000",
              // // background: "linear-gradient(90deg, #6366f1, #ff0000)",
              // WebkitBackgroundClip: "text",
              // WebkitTextFillColor: "transparent",
              // letterSpacing: 1,
              // textShadow: "0 1px 2px rgba(0,0,0,0.04)",
              // whiteSpace: "nowrap",
              // pointerEvents: "auto",
            }}
          >
            Vehicle Requests
          </div>
        </div>
        <div
          className="nav-menu"
          style={{ marginLeft: 32, display: "flex", gap: 18 }}
        >
          {navItems.map((item) => (
            <Link
              to={item.path}
              key={item.label}
              className={`nav-menu-item${
                location.pathname === item.path ? " active" : ""
              }`}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 18px",
                borderRadius: 8,
                color: location.pathname === item.path ? "#fff" : "#23272f",
                background:
                  location.pathname === item.path
                    ? "linear-gradient(90deg, #ff5858 0%, #23272f 100%)"
                    : "transparent",
                fontWeight: 500,
                fontSize: 16,
                boxShadow:
                  location.pathname === item.path
                    ? "0 2px 8px rgba(255,88,88,0.10)"
                    : "none",
                transition: "all 0.18s",
                textDecoration: "none",
              }}
            >
              <span className="nav-icon" style={{ marginRight: 8 }}>
                {item.icon}
              </span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
      {/* Right: Profile */}
      <div
        className="nav-right"
        style={{ display: "flex", alignItems: "center" }}
      >
        <div
          className="nav-user"
          style={{ position: "relative" }}
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <span
            className="user-icon"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #f5f6fa 0%, #b0b3b8 60%, #23272f 100%)",
              color: "#fff",
              fontSize: 28,
              boxShadow: "0 2px 8px rgba(50,50,50,0.18)",
              border: "2.5px solid #ff0000",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.08)";
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(50,50,50,0.28)";
              e.currentTarget.style.borderColor = "#b0b3b8";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(50,50,50,0.18)";
              e.currentTarget.style.borderColor = "#ff0000";
            }}
          >
            👤
          </span>
          {showDropdown && (
            <div
              className="user-dropdown-card"
              style={{
                position: "absolute",
                top: 54,
                right: 0,
                minWidth: 220,
                background: "#fff",
                borderRadius: 14,
                boxShadow: "0 8px 32px rgba(60,60,60,0.16)",
                padding: "20px 22px 14px 22px",
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                animation: "fadeIn 0.18s",
              }}
            >
              <div
                className="user-detail-row"
                style={{ marginBottom: 6, color: "#23272f" }}
              >
                <b>Name:</b> {localStorage.getItem("name")}
              </div>
              <div
                className="user-detail-row"
                style={{ marginBottom: 10, color: "#23272f" }}
              >
                <b>User Type:</b> {localStorage.getItem("role")}
              </div>
              <span
                className="logout-icon"
                title="Logout"
                onClick={handleLogout}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 14,
                  // background:
                  //   "linear-gradient(90deg, #ff5858 0%, #23272f 100%)",
                  // color: "#fff",
                  background: 'white',
                  color: 'black',
                  fontWeight: 700,
                  fontSize: 17,
                  boxShadow: "0 2px 8px rgba(255,88,88,0.15)",
                  border: "2px solid #ff0000",
                  cursor: "pointer",
                  transition:
                    "background 0.2s, box-shadow 0.2s, border-color 0.2s, transform 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(90deg, #000 0%, #ff5858 100%)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 16px rgba(255,88,88,0.25)";
                  e.currentTarget.style.borderColor = "#23272f";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(90deg, #ff5858 0%, #000000 100%)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(255,88,88,0.15)";
                  e.currentTarget.style.borderColor = "#ff0000";
                  e.currentTarget.style.transform = "scale(1)";
                }
              }
              >
                <span style={{ fontSize: 22, marginRight: 4 }}>🚪</span> Logout
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default StaffNavigationBar;
