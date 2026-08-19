import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./admin.css";
import logo from "../../assets/logo.png";
import api from "../../api/axios";

const sidebarItems = [
  // { label: "Dashboard", icon: "dashboard", path: "/admin/dashboard" },
  { label: "Users", icon: "person", path: "/admin/users" },
  { label: "Departments", icon: "business", path: "/admin/departments" },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.post("/auth/logout", { token: localStorage.getItem("accessToken") });
    // Clear authentication data from localStorage
    localStorage.clear();

    // Redirect to login page
    window.location.href = "/fms/";
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="Zemen Bank" className="zemen-logo" />
        <span className="zemen-logo">Zemen Bank</span>
      </div>
      <nav className="sidebar-menu">
        {sidebarItems.map((item, idx) => (
          <Link
            to={item.path}
            key={item.label}
            className={`sidebar-menu-item${
              location.pathname === item.path ? " active" : ""
            }`}
          >
            <span className="material-icons sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}

        {/* Spacer to push logout to bottom */}
        <div className="sidebar-spacer"></div>

        {/* Logout button */}
        <button onClick={handleLogout} className="sidebar-logout-button">
          <span className="logout-icon">🚪</span>
          <span className="logout-text">Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
