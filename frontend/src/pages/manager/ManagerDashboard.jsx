import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./Manager.css";
import api from "../../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * ManagerDashboard component for logistics officers and heads.
 *
 * Displays fleet statistics, charts, trips in progress, completed trips, and user profile actions.
 * Fetches and processes data from the backend for dashboard visualization.
 */


const ManagerDashboard = () => {
  // State for dashboard statistics, trips, and UI controls
  const [activeIndex, setActiveIndex] = useState(0);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalFuelUsage, setTotalFuelUsage] = useState(0);
  const [monthlyAssignments, setMonthlyAssignments] = useState([]);
  const [tripsInProgress, setTripsInProgress] = useState([]);
  const [completedTrips, setCompletedTrips] = useState([]);
  const [allCompletedTrips, setAllCompletedTrips] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCounts();
    fetchMonthlyAssignments();
    fetchTripsInProgress();
    fetchCompletedTrips();
  }, []);

  useEffect(() => {
    if (selectedMonth === "") {
      setCompletedTrips([]);
    } else if (selectedMonth === "all") {
      setCompletedTrips(allCompletedTrips);
    } else {
      filterCompletedTripsByMonth(selectedMonth);
    }
  }, [selectedMonth, allCompletedTrips]);

  const fetchCounts = async () => {
    try {
      setLoading(true);
      // Fetch vehicles
      const vehiclesResponse = await api.get("/vehicles");
      if (vehiclesResponse.status !== 200)
        throw new Error("Failed to fetch vehicles");
      setTotalVehicles(vehiclesResponse.data.length);

      // Fetch drivers
      const driversResponse = await api.get("/logistics/drivers");
      if (driversResponse.status !== 200)
        throw new Error("Failed to fetch drivers");
      setTotalDrivers(driversResponse.data.length);
      // fetch vehicle requests
      const activeRequests = await api.get("/requests/active");
      if (activeRequests.status !== 200)
        throw new Error("Field to fetch active requests");
      setTotalRequests(activeRequests.data.length);

      // Fetch fuel logs
      const fuelLogsResponse = await api.get("/logistics/fuel-logs");
      if (fuelLogsResponse.status !== 200)
        throw new Error("Failed to fetch fuel logs");
      const totalFuel = fuelLogsResponse.data.reduce(
        (sum, log) => sum + parseFloat(log.liters),
        0
      );
      setTotalFuelUsage(totalFuel.toFixed(1));
    } catch (error) {
      console.error("Error fetching counts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyAssignments = async () => {
    try {
      // Fetch all assigned requests
      const response = await api.get("/requests/assigned");
      console.log("Assigned requests:", response.data);

      // Get current date and calculate 6 months ago
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 5); // 5 months ago (to include current month)

      // Initialize data structure for last 6 months
      const monthlyData = [];
      for (let i = 0; i < 6; i++) {
        const date = new Date(now);
        date.setMonth(now.getMonth() - i);
        monthlyData.push({
          month: date.toLocaleString("default", {
            month: "long",
            year: "numeric",
          }),
          assignments: 0,
        });
      }

      // Count assignments for each month
      response.data.forEach((request) => {
        if (request.startTime) {
          const requestDate = new Date(request.startTime);
          if (requestDate >= sixMonthsAgo && requestDate <= now) {
            const monthKey = requestDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            });
            const monthData = monthlyData.find((d) => d.month === monthKey);
            if (monthData) {
              monthData.assignments++;
            }
          }
        }
      });

      // Sort by most recent month first
      monthlyData.sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateB - dateA;
      });

      setMonthlyAssignments(monthlyData);
    } catch (error) {
      console.error("Error fetching monthly assignments:", error);
    }
  };

  const fetchTripsInProgress = async () => {
    try {
      const response = await api.get("/logistics/journeys");
      if (response.status !== 200) throw new Error("Failed to fetch journeys");

      // Filter journeys with status IN_PROGRESS
      const inProgressJourneys = response.data.filter(
        (journey) => journey.status === "IN_PROGRESS"
      );

      // Fetch requests to get additional details
      const requestsResponse = await api.get("/requests");
      if (requestsResponse.status !== 200)
        throw new Error("Failed to fetch requests");

      // Fetch vehicles to get driver information
      const vehiclesResponse = await api.get("/vehicles");
      if (vehiclesResponse.status !== 200)
        throw new Error("Failed to fetch vehicles");

      // Combine journey, request, and vehicle data
      const tripsWithDetails = inProgressJourneys.map((journey) => {
        const request = requestsResponse.data.find(
          (r) => r.id === journey.requestId
        );
        const vehicle = vehiclesResponse.data.find(
          (v) => v.id === request?.vehicle?.id
        );

        return {
          ...journey,
          ...request,
          startTime: journey.startTime || journey.start_time,
          endLocation: journey.endLocation || journey.end_location,
          purpose: journey.purpose || request?.purpose,
          vehicle: {
            ...request?.vehicle,
            driver: vehicle?.driver,
          },
        };
      });

      console.log("Trips with details:", tripsWithDetails); // Debug log
      setTripsInProgress(tripsWithDetails);
    } catch (error) {
      console.error("Error fetching trips in progress:", error);
    }
  };

  const fetchCompletedTrips = async () => {
    try {
      const response = await api.get("/logistics/journeys");
      if (response.status !== 200) throw new Error("Failed to fetch journeys");

      // Filter completed journeys
      const completedJourneys = response.data.filter(
        (journey) => journey.status === "COMPLETED"
      );

      // Fetch requests to get additional details
      const requestsResponse = await api.get("/requests");
      if (requestsResponse.status !== 200)
        throw new Error("Failed to fetch requests");

      // Fetch vehicles to get driver information
      const vehiclesResponse = await api.get("/vehicles");
      if (vehiclesResponse.status !== 200)
        throw new Error("Failed to fetch vehicles");

      // Combine journey, request, and vehicle data
      const tripsWithDetails = completedJourneys.map((journey) => {
        const request = requestsResponse.data.find(
          (r) => r.id === journey.requestId
        );
        const vehicle = vehiclesResponse.data.find(
          (v) => v.id === request?.vehicle?.id
        );

        return {
          ...journey,
          ...request,
          startTime: journey.startTime || journey.start_time,
          endTime: journey.endTime || journey.end_time,
          endLocation: journey.endLocation || journey.end_location,
          purpose: journey.purpose || request?.purpose,
          vehicle: {
            ...request?.vehicle,
            driver: vehicle?.driver,
          },
        };
      });

      setAllCompletedTrips(tripsWithDetails);
      setCompletedTrips(tripsWithDetails);
    } catch (error) {
      console.error("Error fetching completed trips:", error);
    }
  };

  const filterCompletedTripsByMonth = (month) => {
    if (month === "all") {
      setCompletedTrips(allCompletedTrips);
      return;
    }

    const [monthStr, yearStr] = month.split(" ");
    const monthIndex = new Date(`${monthStr} 1, ${yearStr}`).getMonth();
    const year = parseInt(yearStr);

    const filteredTrips = allCompletedTrips.filter((trip) => {
      const tripDate = new Date(trip.endTime);
      return (
        tripDate.getMonth() === monthIndex && tripDate.getFullYear() === year
      );
    });

    setCompletedTrips(filteredTrips);
  };

  const getMonthOptions = () => {
    const months = [];
    const now = new Date();

    // Get last 6 months
    for (let i = 0; i < 6; i++) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      months.push(
        date.toLocaleString("default", { month: "long", year: "numeric" })
      );
    }

    return months;
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
    // Optionally, you can also call the logout API
    await api.post("/auth/logout", { token: localStorage.getItem("accessToken") });
    localStorage.clear();
    window.location.href = "/fms/";
  };

  return (
    <div className="manager-dashboard-layout">
      <Sidebar activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      <main className="manager-dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">DASHBOARD</h1>
          <div className="dashboard-user-group">
            <div
              className="dashboard-user"
              onMouseEnter={() => setShowUserDropdown(true)}
              onMouseLeave={() => setShowUserDropdown(false)}
            >
              <span className="user-info">
                <div>
              <span className="user-icon">👤</span>
                {localStorage.getItem("name")}
                </div>
                <div>
                <span className="user-type">
                  {localStorage.getItem("role")}
                </span>
                </div>
              </span>
              {showUserDropdown && (
                <div className="user-dropdown-card">
                  { (
                    <>
                      <div className="user-detail-row">
                        <b>Name:</b> {localStorage.getItem("name")}
                      </div>
                      <div className="user-detail-row">
                        <b>Username:</b> {localStorage.getItem("username")}
                      </div>
                      <div className="user-detail-row">
                        <b>User Type:</b> {localStorage.getItem("role")}
                      </div>
                      {/* <button
                        className="change-password-btn"
                        onClick={() => setShowChangePassword(true)}
                      >
                        Change Password
                      </button> */}
                    </>
                  )}
                </div>
              )}
            </div>
            {/* <span className="logout-icon" title="Logout" onClick={handleLogout}>
              🚪
            </span> */}
          </div>
        </div>
        <div className="dashboard-summary-row">
          <a
            href="/fms/manager/vehicles"
            className="dashboard-summary-card dashboard-vehicles-card"
          >
            <div className="summary-value">
              {loading ? "..." : totalVehicles}
            </div>
            <div className="summary-label">Total Vehicles</div>
          </a>
          <a href="/fms/manager/drivers" className="dashboard-summary-card">
            <div className="summary-value">
              {loading ? "..." : totalDrivers}
            </div>
            <div className="summary-label">Total Drivers</div>
          </a>
          <a
            href="/fms/manager/vehicle-requests"
            className="dashboard-summary-card"
          >
            <div className="summary-value">
              {loading ? "..." : totalRequests}{" "}
            </div>
            <div className="summary-label">Active Requests</div>
          </a>
          <div className="dashboard-summary-card">
            <div className="summary-value">
              {loading ? "..." : totalFuelUsage}
            </div>
            <div className="summary-label">Fuel Usage(L)</div>
          </div>
        </div>

        <div className="dashboard-chart-container">
          <h2>Vehicle Assignments (Last 6 Months)</h2>
          <div className="chart-wrapper">
            {monthlyAssignments.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={monthlyAssignments}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis
                    label={{
                      value: "Number of Assignments",
                      angle: -90,
                      position: "insideLeft",
                    }}
                    allowDecimals={false}
                    tickCount={5}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} assignments`, "Count"]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar
                    dataKey="assignments"
                    fill="#ff0000"
                    name="Assignments"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", padding: "20px" }}>
                {loading ? "Loading..." : "No data available"}
              </div>
            )}
          </div>
        </div>

        <div className="trips-in-progress-container">
          <h2>Trips In Progress</h2>
          {loading ? (
            <div className="loading-message">Loading...</div>
          ) : tripsInProgress.length > 0 ? (
            <div className="trips-grid">
              {tripsInProgress.map((trip) => (
                <div key={trip.id} className="trip-card">
                  <div className="trip-header">
                    <span className="trip-status">In Progress</span>
                    <span className="trip-date">
                      {new Date(trip.startTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="trip-details">
                    <div className="trip-info">
                      <span className="info-label">Destination:</span>
                      <span className="info-value">{trip.endLocation}</span>
                    </div>
                    <div className="trip-info">
                      <span className="info-label">Vehicle:</span>
                      <span className="info-value">
                        {trip.vehicle?.model || "N/A"} -{" "}
                        {trip.vehicle?.plateNumber || "N/A"}
                      </span>
                    </div>
                    <div className="trip-info">
                      <span className="info-label">Driver:</span>
                      <span className="info-value">
                        {trip.vehicle?.driver?.name ||
                          trip.vehicle?.driverName ||
                          "N/A"}
                      </span>
                    </div>
                    <div className="trip-info">
                      <span className="info-label">Department:</span>
                      <span className="info-value">
                        {trip.requester?.department?.name || "N/A"}
                      </span>
                    </div>
                    <div className="trip-info">
                      <span className="info-label">Starting KM:</span>
                      <span className="info-value">
                        {trip.startingKilometer || "N/A"}
                      </span>
                    </div>
                    <div className="trip-info">
                      <span className="info-label">Purpose:</span>
                      <span className="info-value">{trip.purpose}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-trips-message">
              No trips currently in progress
            </div>
          )}
        </div>

        <div className="completed-trips-container">
          <div className="completed-trips-header">
            <h2>Completed Trips</h2>
            <select
              className="month-filter"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">Select Month</option>
              <option value="all">All Time</option>
              {getMonthOptions().map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <div className="loading-message">Loading...</div>
          ) : selectedMonth ? (
            completedTrips.length > 0 ? (
              <div className="trips-grid">
                {completedTrips.map((trip) => (
                  <div key={trip.id} className="trip-card completed">
                    <div className="trip-header">
                      <span className="trip-status completed">Completed</span>
                      <span className="trip-date">
                        {new Date(trip.endTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="trip-details">
                      <div className="trip-info">
                        <span className="info-label">Destination:</span>
                        <span className="info-value">{trip.endLocation}</span>
                      </div>
                      <div className="trip-info">
                        <span className="info-label">Vehicle:</span>
                        <span className="info-value">
                          {trip.vehicle?.model || "N/A"} -{" "}
                          {trip.vehicle?.plateNumber || "N/A"}
                        </span>
                      </div>
                      <div className="trip-info">
                        <span className="info-label">Driver:</span>
                        <span className="info-value">
                          {trip.vehicle?.driver?.name ||
                            trip.vehicle?.driverName ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="trip-info">
                        <span className="info-label">Department:</span>
                        <span className="info-value">
                          {trip.requester?.department?.name || "N/A"}
                        </span>
                      </div>
                      <div className="trip-info">
                        <span className="info-label">Distance:</span>
                        <span className="info-value">
                          {trip.distance || "N/A"} km
                        </span>
                      </div>
                      <div className="trip-info">
                        <span className="info-label">Duration:</span>
                        <span className="info-value">
                          {(() => {
                            const start = new Date(trip.startTime);
                            const end = new Date(trip.endTime);
                            const duration = end - start;
                            const hours = Math.floor(
                              duration / (1000 * 60 * 60)
                            );
                            const minutes = Math.floor(
                              (duration % (1000 * 60 * 60)) / (1000 * 60)
                            );
                            return `${hours}h ${minutes}m`;
                          })()}
                        </span>
                      </div>
                      <div className="trip-info">
                        <span className="info-label">Purpose:</span>
                        <span className="info-value">{trip.purpose}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-trips-message">
                No completed trips found for selected period
              </div>
            )
          ) : (
            <div className="no-trips-message">
              Please select a month to view completed trips
            </div>
          )}
        </div>

        {/* <div className="dashboard-notifications">
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
        </div> */}
      </main>
    </div>
  );
};

export default ManagerDashboard;
