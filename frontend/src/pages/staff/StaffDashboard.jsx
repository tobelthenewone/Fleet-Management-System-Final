import React, { useEffect } from "react";
import StaffNavigationBar from "./StaffNavigationBar";
import "./Staff.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function StaffDashboard() {
  const [totalRequests, setTotalRequests] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [assignedRequests, setAssignedRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      // Get the user's role from localStorage
      const userRole = localStorage.getItem("role");
      let requests = [];

      if (userRole === "DEPARTMENT_HEAD" || userRole === "DIRECTOR") {
        // Department heads and Directors see all requests from their department
        const departmentRequests = await api.get(
          `/requests/department/${localStorage.getItem("email")}`
        );
        requests = departmentRequests.data;
      } else {
        // Regular staff only see their own requests
        const userEmail = localStorage.getItem("email");
        const response = await api.post(`/requests/own`, { email: userEmail });
        if (response.status !== 200) {
          throw new Error("Failed to fetch requests");
        }
        requests = response.data;
      }

      setTotalRequests(requests.length);

      // Count pending requests (status = 0)
      const pendingCount = requests.filter((req) => req.status === 0).length;
      setPendingRequests(pendingCount);

      // Count assigned requests (status = 3)
      const assignedCount = requests.filter((req) => req.status === 3).length;
      setAssignedRequests(assignedCount);

      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Error fetching requests:", err);
    }
  };
  // Navigate to vehicle request page with appropriate filter
  const handleCardClick = (statusFilter) => {
    navigate("/staff/vehicle-request", { state: { statusFilter } });
  };

  return (
    <div className="staff-dashboard-layout">
      <StaffNavigationBar />
      <main className="staff-dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Staff Dashboard</h1>
        </div>
        <div className="dashboard-summary-row">
          <div
            className="dashboard-summary-card clickable"
            onClick={() => handleCardClick("all")}
          >
            <div className="summary-value">
              {loading ? "..." : totalRequests}
            </div>
            <div className="summary-label">Total Requests</div>
          </div>
          <div
            className="dashboard-summary-card clickable"
            onClick={() => handleCardClick("0")}
          >
            <div className="summary-value">
              {loading ? "..." : pendingRequests}
            </div>
            <div className="summary-label">Pending Requests</div>
          </div>
          <div
            className="dashboard-summary-card clickable"
            onClick={() => handleCardClick("3")}
          >
            <div className="summary-value">
              {loading ? "..." : assignedRequests}
            </div>
            <div className="summary-label">Assigned Requests</div>
          </div>
        </div>
        {/* <div className="dashboard-notifications">
          <h2>Notifications</h2>
          <div className="notification-item">
            <span className="notification-icon">🔔</span>
            <span className="notification-text">Your vehicle request has been approved.</span>
          </div>
          <div className="notification-item">
            <span className="notification-icon">🔔</span>
            <span className="notification-text">New policy update available.</span>
          </div>
        </div> */}
      </main>
    </div>
  );
}

export default StaffDashboard;
