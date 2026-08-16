// unchanged imports
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Request.css";

import api from "../../api/axios";

const navItems = [
  // { label: "Dashboard", icon: "🏠", path: "/fms/request/dashboard" },
  {
    label: "Maintenance Request",
    icon: "🛠️",
    path: "/request/maintenance-request",
  },
  { label: "Tire Replacement", icon: "🛠️", path: "/request/tire-replacement" },
];

const RequestNavigationBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleLogout = async () => {
    // Optionally, you can also call the logout API
    await api.post("/auth/logout", { token: localStorage.getItem("accessToken") });
    localStorage.clear();

    navigate("/fms/");
  };

  const handlePasswordChange = (e) =>
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const { new: newPass, confirm } = passwordForm;

    if (newPass !== confirm) {
      // alert("New password and confirm password do not match.");
      return;
    }

    // Password update logic placeholder
    // alert("Password changed successfully (placeholder logic).");

    setShowChangePassword(false);
    setPasswordForm({ current: "", new: "", confirm: "" });
  };

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        padding: '0 40px',
        height: 70,
        borderRadius: '0 0 18px 18px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <div
          style={{
            display: 'flex',
            gap: 18,
            background: '#f7f7f7',
            borderRadius: 10,
            padding: '6px 18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          {navItems.map((item) => (
            <Link
              to={item.path}
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                color: location.pathname === item.path ? '#ff0000' : '#18191b',
                fontSize: '1.05rem',
                fontWeight: 500,
                textDecoration: 'none',
                borderRadius: 8,
                background: location.pathname === item.path ? '#fff' : 'transparent',
                border: location.pathname === item.path ? '1.5px solid #ff0000' : '1.5px solid transparent',
                boxShadow: location.pathname === item.path ? '0 2px 8px rgba(255,0,0,0.06)' : 'none',
                transition: 'background 0.18s, color 0.18s, border 0.18s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.border = '1.5px solid #ff0000';
                e.currentTarget.style.color = '#ff0000';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = location.pathname === item.path ? '#fff' : 'transparent';
                e.currentTarget.style.border = location.pathname === item.path ? '1.5px solid #ff0000' : '1.5px solid transparent';
                e.currentTarget.style.color = location.pathname === item.path ? '#ff0000' : '#18191b';
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#f7f7f7',
            borderRadius: 18,
            padding: '8px 20px 8px 14px',
            color: '#18191b',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1.5px solid #e0e0e0',
            position: 'relative',
          }}
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <span style={{ fontSize: '1.3rem', marginRight: 4 }}>👤</span>
          <span style={{ fontSize: '0.95rem', color: '#18191b', fontWeight: 500, lineHeight: 1.1 }}>
            {localStorage.getItem('name')}
            <br />
            <span style={{ fontSize: '0.85em', color: '#ff0000', fontWeight: 600 }}>{localStorage.getItem('role')}</span>
          </span>
          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: 48,
                right: 0,
                background: '#fff',
                borderRadius: 14,
                boxShadow: '0 8px 32px rgba(0,0,0,0.13), 0 1.5px 8px rgba(0,0,0,0.04)',
                border: '1.5px solid #e0e0e0',
                padding: '22px 26px 18px 26px',
                minWidth: 260,
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                animation: 'popIn 0.18s',
              }}
            >
              <div style={{ fontSize: '1.01rem', color: '#18191b', marginBottom: 8 }}>
                <b>Name:</b> {localStorage.getItem('name')}
              </div>
              <div style={{ fontSize: '1.01rem', color: '#18191b', marginBottom: 8 }}>
                <b>Username:</b> {localStorage.getItem('username')}
              </div>
              <div style={{ fontSize: '1.01rem', color: '#18191b', marginBottom: 8 }}>
                <b>User Type:</b> {localStorage.getItem('role')}
              </div>
            </div>
          )}
        </div>
        <button
          title="Logout"
          onClick={handleLogout}
          style={{
            fontSize: '1.05rem',
            background: '#ff0000',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 18px',
            fontWeight: 600,
            marginLeft: 18,
            cursor: 'pointer',
            transition: 'background 0.18s, color 0.18s',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
          onMouseOver={e => e.currentTarget.style.background = '#b30000'}
          onMouseOut={e => e.currentTarget.style.background = '#ff0000'}
        >
          <span style={{ fontSize: '1.2rem' }}>🚪</span> Logout
        </button>
      </div>
    </nav>
  );
};

export default RequestNavigationBar;
