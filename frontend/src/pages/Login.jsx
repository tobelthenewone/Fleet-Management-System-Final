import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../App.css";
import "./Login.css";
import api from "../api/axios";
import Role from "../enums/role";

/**
 * Login page component for the Fleet Management System.
 *
 * Handles user authentication, displays error messages, and redirects users based on their role after login.
 * Stores authentication tokens and user info in localStorage.
 */
const Login = () => {
  // State for username, password, and error message
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check for auth error message
    const authError = localStorage.getItem("authError");
    if (authError) {
      setError(authError);
      localStorage.removeItem("authError"); // Clear the error after displaying
    }
  }, []);

  /**
   * Handles the login form submission.
   * Sends credentials to the backend, stores tokens, and redirects based on user role.
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", { username, password });
      const { accessToken, refreshToken, name, role } = response.data;

      // Save token and basic info
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("role", role);
      localStorage.setItem("name", name);
      localStorage.setItem("username", response.data.username);

      // Force read after storage
      const currentRole = localStorage.getItem("role");

      // Now navigate using freshly read role
      switch (currentRole) {
        case Role.LOGISTICS_OFFICER:
        case Role.LOGISTICS_HEAD:
          window.location.href = "/fms/manager/dashboard";
          break;
        case Role.DEPARTMENT_HEAD:
        case Role.DIRECTOR:
        case Role.EMPLOYEE:
          window.location.href = "/fms/staff/vehicle-request";
          break;
        case Role.MAINTENANCE_REQUESTER:
          window.location.href = "/fms/request/maintenance-request";
          break;
        case Role.ADMIN:
          window.location.href = "/fms/admin/users";
          break;
        case Role.JOURNEY_CONTROLLER:
          window.location.href = "/fms/controller/dashboard";
          break;
        default:
          window.location.href = "/fms/";
      }
    } catch (err) {
      setError("Invalid credentials");
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* <img
          src={require("../assets/z-07.pn")}
          alt="Zemen Bank Logo"
          width=""
          className="login-title-image"

        />
        <img
          src={require("../assets/z-02.png")}
          alt="Zemen Bank Logo"
          width=""
          className="footer-logo"

        /> */}
        {/* <div className="login-sidebar">
          <img
            src={require("../assets/z-06.png")}
            alt="Zemen Logo"
            className="sidebar-bg-image"
          />
          <img
            src={require("../assets/z-10.png")}
            alt="Zemen Logo 3"
            className="sidebar-bg-image-center"
          />
        </div> */}
        <div className="login-form-section">
          <form className="login-form" onSubmit={handleLogin}>
            <p style={{ color: "#ff0000", fontSize: "1.6rem", fontWeight: 900 , textAlign: "center", marginBottom: 20}}>
              Welcome to  FMS
            </p>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <br />
            {error && (
              <div style={{ color: "red", marginBottom: 10 }}>{error}</div>
            )}
            <button type="submit" className="login-btn">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>

  );
};

export default Login;
