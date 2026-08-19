import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./adminsidebar";
import "./admin.css";
import api from "../../api/axios";

const summaryCards = [
  { label: "Total Users", value: 0 },
  { label: "Managers", value: 0 },
  { label: "Drivers", value: 0 },
  { label: "Employees", value: 0 },
];

// const notifications = [
//   { icon: "⚠️", text: "New user registration", detail: "John Doe" },
//   { icon: "🔔", text: "System update required", detail: "v2.1.0" },
// ];

const AdminDashboard = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [userCounts, setUserCounts] = useState({
    total: 0,
    managers: 0,
    drivers: 0,
    employees: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserCounts();
  }, []);

  const fetchUserCounts = async () => {
    try {
      setLoading(true);
      // Fetch user counts - replace with your actual API endpoints
      const usersResponse = await api.get("/users");
      if (usersResponse.status !== 200)
        throw new Error("Failed to fetch users");

      // Calculate counts by role
      const users = usersResponse.data;
      const managers = users.filter((user) => user.role === "manager").length;
      const drivers = users.filter((user) => user.role === "driver").length;
      const employees = users.filter((user) => user.role === "employee").length;

      setUserCounts({
        total: users.length,
        managers,
        drivers,
        employees,
      });
    } catch (error) {
      console.error("Error fetching user counts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) =>
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Add password change logic here
    setShowChangePassword(false);
    setPasswordForm({ current: "", new: "", confirm: "" });
  };

  const handleLogout = async () => {
    await api.post("/auth/logout", { token: localStorage.getItem("accessToken") });
    localStorage.clear();
    window.location.href = "/fms/";
    // Optionally, you can also call the logout API
  };

  return (
    <div className="admin-dashboard-layout">
      <AdminSidebar activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      <main className="admin-dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">ADMIN DASHBOARD</h1>
          <div className="dashboard-user-group">
            <div
              className="dashboard-user"
              onMouseEnter={() => setShowUserDropdown(true)}
              onMouseLeave={() => setShowUserDropdown(false)}
            >
              <span className="user-icon">👤</span>
              <span className="user-info">
                {localStorage.getItem("name")}
                <br />
                <span className="user-type">
                  {localStorage.getItem("role")}
                </span>
              </span>
              {showUserDropdown && (
                <div className="user-dropdown-card">
                  {!showChangePassword ? (
                    <>
                      <div className="user-detail-row">
                        <b>Name:</b> {localStorage.getItem("name")}
                      </div>
                      <div className="user-detail-row">
                        <b>Email:</b> {localStorage.getItem("email")}
                      </div>
                      <div className="user-detail-row">
                        <b>User Type:</b> {localStorage.getItem("role")}
                      </div>
                      <button
                        className="change-password-btn"
                        onClick={() => setShowChangePassword(true)}
                      >
                        Change Password
                      </button>
                    </>
                  ) : (
                    <form
                      className="change-password-form"
                      onSubmit={handlePasswordSubmit}
                    >
                      <div className="form-row">
                        <label>Current Password</label>
                        <input
                          type="password"
                          name="current"
                          value={passwordForm.current}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                      <div className="form-row">
                        <label>New Password</label>
                        <input
                          type="password"
                          name="new"
                          value={passwordForm.new}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                      <div className="form-row">
                        <label>Confirm Password</label>
                        <input
                          type="password"
                          name="confirm"
                          value={passwordForm.confirm}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                      <div className="form-actions">
                        <button
                          type="button"
                          onClick={() => setShowChangePassword(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit">Save</button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
            <span className="logout-icon" title="Logout" onClick={handleLogout}>
              🚪
            </span>
          </div>
        </div>
        <div className="dashboard-summary-row">
          <a href="/admin/users" className="dashboard-summary-card">
            <div className="summary-value">
              {loading ? "..." : userCounts.total}
            </div>
            <div className="summary-label">Total Users</div>
          </a>
          <div className="dashboard-summary-card">
            <div className="summary-value">
              {loading ? "..." : userCounts.managers}
            </div>
            <div className="summary-label">Managers</div>
          </div>
          <div className="dashboard-summary-card">
            <div className="summary-value">
              {loading ? "..." : userCounts.drivers}
            </div>
            <div className="summary-label">Drivers</div>
          </div>
          <div className="dashboard-summary-card">
            <div className="summary-value">
              {loading ? "..." : userCounts.employees}
            </div>
            <div className="summary-label">Employees</div>
          </div>
        </div>
        <div className="dashboard-notifications">
          <h2>Notifications</h2>
          <ul>
            {notifications.map((note, idx) => (
              <li key={idx} className="notification-item">
                <span className="notification-icon">{note.icon}</span>
                <span className="notification-text">{note.text}</span>
                <span className="notification-detail">{note.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
