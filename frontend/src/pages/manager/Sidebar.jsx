import { Link, useLocation } from "react-router-dom";
import "./Manager.css";
import logo from "../../assets/z-09.png";
import api from "../../api/axios";

const sidebarItems = [
  { label: "Dashboard", icon: "dashboard", path: "/manager/dashboard" },
  { label: "Vehicles", icon: "directions_car", path: "/manager/vehicles" },
  {
    label: "Fixed Vehicle Assignment",
    icon: "route",
    path: "/manager/fixed-vehicle-assignment",
  },
  { label: "Drivers", icon: "person", path: "/manager/drivers" },
  {
    label: "Transport Requests",
    icon: "assignment",
    path: "/manager/vehicle-requests",
  },
  { label: "Journey Logs", icon: "history", path: "/manager/journey-logs" },
  { label: "Fleet Tracking", icon: "location_on", path: "/vehicles/locations" },
  { label: "Maintenance", icon: "build", path: "/manager/MaintenanceLog" },
  {
    label: "Tire Replacement",
    icon: "build",
    path: "/manager/tire-replacement",
  },
  {
    label: "AI Maintenance Suggestion",
    icon: "psychology",
    path: "/manager/ai-maintenance",
  },
  { label: "Fuel", icon: "local_gas_station", path: "/manager/FuelLog" },
  { label: "Accidents", icon: "warning", path: "/manager/AccidentLog" },
  { label: "Insurance", icon: "security", path: "/manager/InsuranceList" },
  { label: "Reports", icon: "bar_chart", path: "/manager/reports" },
  // departments and users managment
  { label: "Users", icon: "person", path: "/admin/users" },
  { label: "Departments", icon: "business", path: "/admin/departments" },
  { label: "Bolo List", icon: "list", path: "/manager/bolo" },
];

const Sidebar = () => {
  const location = useLocation();

  const handleLogout = async () => {
    // Optionally, you can also call the logout API
    await api.post("/auth/logout", { token: localStorage.getItem("accessToken") });
    // Clear authentication data from localStorage
    localStorage.clear();


    // Redirect to login page
    window.location.href = "/fms/";
  };

  return (
    <aside className="manager-sidebar">
      <div className="sidebar-logo-container">
        <img
          src={logo}
          alt="Zemen Bank"
          className="sidebar-logo"
          onError={(e) => {
            console.error("Error loading logo:", e);
            e.target.src = "/default-logo.png"; // Fallback image
          }}
        />
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
        {/* link to /controller/dashboard */}
        <Link
          to="/controller/dashboard"
          className={`sidebar-menu-item${
            location.pathname === "/controller/dashboard" ? " active" : ""
          }`}
        >
          <span className="material-icons sidebar-icon">local_shipping</span>
          <span className="sidebar-label">Journey Controller</span>
        </Link>
        <Link
          to="/staff/vehicle-request"
          className={`sidebar-menu-item${
            location.pathname === "/staff/vehicle-request" ? " active" : ""
          }`}
        >
        <span className="material-icons sidebar-icon">badge</span>
          <span className="sidebar-label">Staff Dashboard</span>
        </Link>

        {/* Spacer to push logout to bottom */}
        <div className="sidebar-spacer"></div>

        {/* Logout button */}
        <button onClick={handleLogout} className="sidebar-logout-button">
          <span className="material-icons logout-icon">logout</span>
          <span className="logout-text">Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
