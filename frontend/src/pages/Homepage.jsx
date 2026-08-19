// src/pages/Homepage.js

import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Homepage.css";
import logo from "../assets/z-10.png";
import { Link } from "react-router-dom";

function Homepage() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
        <Link className="navbar-brand d-flex align-items-center" to="/fms/">
          <img
            src={logo}
            alt="Zemen Bank"
            width="140"
            height="50"
            className="me-2"
            style={{ borderRadius: "0%" }}
          />
          {/* <span style={{ color: 'white', fontWeight: 'bold' }}>Zemen Bank</span> */}
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarNav"
        >
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link btn btn-danger text-white ms-3" to="/fms/">
                Login
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="hero-section text-white text-center d-flex align-items-center justify-content-center">
        <div>
          <h1 className="display-4 fw-bold">Fleet Management System</h1>
          <p className="lead">Powering Zemen Bank's transport efficiency</p>
          <Link to="/fms/" className="btn btn-danger btn-lg mt-3">
            Get Started
          </Link>
        </div>
      </header>
    </div>
  );
}

export default Homepage;
