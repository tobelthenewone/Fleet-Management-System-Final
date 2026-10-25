import React, { useState, useEffect } from "react";
import "./controller.css";
import api from "../../api/axios";
import Logo from "../../assets/placeholder-symbol.jpg"; // Import the logo
import PreApprovedTripForm from "../../components/preApprovedTrip";
import Role from "../../enums/role";

const ControllerDashboard = () => {
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [filteredAssignedRequests, setFilteredAssignedRequests] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStartTripPopup, setShowStartTripPopup] = useState(false);
  const [showEndTripPopup, setShowEndTripPopup] = useState(false);
  const [preApprovedTripFormVisible, setPreApprovedTripFormVisible] =
    useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [kilometerInputs, setKilometerInputs] = useState({});
  const [users, setUsers] = useState([]);
  const [activeView, setActiveView] = useState("assigned"); // 'assigned', 'inProgress', 'completed'
  const [viewRequest, setViewRequest] = useState(null);
  const [timeFilter, setTimeFilter] = useState("today");
  // For editing kilometers in modal
  const [editKilometers, setEditKilometers] = useState({ start: null, end: null });
  const [editingKm, setEditingKm] = useState(false);
  useEffect(() => {
    fetchAssignedRequests();
    fetchJourneys();
    fetchUsers();
  }, []);


  const fetchAssignedRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/requests");
      if (response.status !== 200) {
        throw new Error("Failed to fetch requests");
      }
      // Filter only requests approved by logistics head (status = 4) that don't have completed journeys
      const assignedRequests = response.data.filter(
        (request) => request.status === 4
      );
      console.log("assigned_fetched=", assignedRequests);
      console.log("journeys=", journeys);

      setAssignedRequests(assignedRequests);
      setFilteredAssignedRequests(assignedRequests);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch assigned requests");
    } finally {
      setLoading(false);
    }
  };
  const fetchPreApprovedRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/pre-approved-trips");
      if (response.status !== 200) {
        throw new Error("Failed to fetch pre-approved trips");
      }
      setAssignedRequests(response.data);
      setFilteredAssignedRequests(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch pre-approved trips");
    } finally {
      setLoading(false);
    }
  };

  const fetchJourneys = async () => {
    try {
      setLoading(true);
      const response = await api.get("/logistics/journeys");
      if (response.status !== 200) {
        throw new Error("Failed to fetch journeys");
      }
      setJourneys(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch journeys");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      if (response.status !== 200) {
        throw new Error("Failed to fetch users");
      }
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch users");
    }
  };

  const handleStartTrip = (request) => {
    setSelectedRequest(request);
    // Initialize kilometer inputs for each vehicle
    const initialInputs = {};
    request.vehicles.forEach((vehicle) => {
      initialInputs[vehicle.id] = "";
    });
    setKilometerInputs(initialInputs);
    setShowStartTripPopup(true);
  };

  const handleEndTrip = (journey) => {
    setSelectedRequest(journey.id);
    // Initialize kilometer input for this vehicle
    setKilometerInputs("");
    setShowEndTripPopup(true);
  };

  const handleKilometerInputChange = (vehicleId, value) => {
    setKilometerInputs((prev) => ({
      ...prev,
      [vehicleId]: value,
    }));
  };

  const handleStartTripSubmit = async () => {
    try {
      // Validate all inputs
      const invalidInputs = Object.entries(kilometerInputs).filter(
        ([_, value]) => !value || isNaN(value)
      );

      if (invalidInputs.length > 0) {
        setError("Please enter valid kilometer readings for all vehicles");
        return;
      }

      // Convert all inputs to numbers
      const journeyInputs = Object.entries(kilometerInputs).map(
        ([vehicleId, value]) => ({
          vehicleId: parseInt(vehicleId),
          startKilometer: parseFloat(value),
        })
      );

      const response = await api.post(
        `/logistics/journeys/start/${selectedRequest.id}`,
        journeyInputs
      );

      if (response.status !== 200) {
        throw new Error("Failed to start journey");
      }

      await fetchAssignedRequests();
      await fetchJourneys();
      setShowStartTripPopup(false);
      setKilometerInputs({});
      setError(null);
    } catch (err) {
      console.error("Error starting trip:", err);
      setError(err.message || "Failed to start trip. Please try again.");
    }
  };

  const handleEndTripSubmit = async () => {
    try {
      if (!kilometerInputs || isNaN(kilometerInputs)) {
        setError("Please enter a valid kilometer reading");
        return;
      }

      const response = await api.post(`/logistics/journeys/${selectedRequest}/end`, {
        endingKilometer: parseFloat(kilometerInputs),
      });

      if (response.status !== 200) {
        throw new Error("Failed to end journey");
      }

      await fetchAssignedRequests();
      await fetchJourneys();
      setShowEndTripPopup(false);
      setKilometerInputs("");
      setError(null);
    } catch (err) {
      console.error("Error ending trip:", err);
      setError(err.message || "Failed to end trip. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString();
  };



  const logout = () => {
    localStorage.clear();
    window.location.href = "/fms/";
  };



  const handleCardClick = (view) => {
    setActiveView(activeView === view ? null : view);
  };

  const filterJourneysByTime = (journeys) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    return journeys.filter((journey) => {
      const journeyDate = new Date(journey.endTime);
      switch (timeFilter) {
        case "today":
          return journeyDate >= today;
        case "yesterday":
          return journeyDate >= yesterday && journeyDate < today;
        case "lastWeek":
          return journeyDate >= lastWeek;
        case "lastMonth":
          return journeyDate >= lastMonth;
        case "allTime":
          return true;
        default:
          return journeyDate >= today;
      }
    });
  };

  const renderTable = () => {
    if (!activeView) return null;

    switch (activeView) {
      case "assigned":
        return (
          <div className="requests-section">
            <h2>Approved Requests</h2>
            <table className="requests-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Destination</th>
                  <th>Start Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignedRequests.length > 0 ? (
                  filteredAssignedRequests.map((request, index) => (
                    <tr key={request.id}>
                      <td>{index + 1}</td>
                      <td>
                        {
                          <ul
                            style={{
                              maxHeight: "80px",
                              overflowY: "auto",
                              margin: 0,
                              paddingLeft: "18px",
                              background: "#f7f7f7",
                              borderRadius: "4px",
                              listStyleType: '"\\2714\\0020"', // Unicode checkmark with space
                            }}
                          >
                            {request.vehicles.map((vehicle) => (
                              <li
                                key={vehicle.id}
                                style={{ listStyleType: '"\\2714\\0020"' }}
                              >
                                {vehicle.plateNumber} - {vehicle.type}
                              </li>
                            ))}
                          </ul>
                        }
                      </td>
                      <td>
                        {request.vehicles && request.vehicles.length > 0 ? (
                          <ul
                            style={{
                              maxHeight: "80px",
                              overflowY: "auto",
                              margin: 0,
                              paddingLeft: "18px",
                              background: "#f7f7f7",
                              borderRadius: "4px",
                              listStyleType: '"\\1F464\\0020"', // Unicode 👤 with space
                            }}
                          >
                            {request.vehicles.map((vehicle) => (
                              <li
                                key={vehicle.id}
                                style={{ listStyleType: '"\\1F464\\0020"' }}
                              >
                                {vehicle.driverName || "N/A"}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span style={{ color: "red", fontWeight: "bold" }}>
                            Not Assigned
                          </span>
                        )}
                      </td>
                      <td>{request.destination}</td>
                      <td>{formatDate(request.startTime)}</td>
                      <td>
                        <button
                          className="action-btn view"
                          onClick={() => setViewRequest(request)}
                        >
                          View
                        </button>
                        <button
                          className="action-btn start-trip"
                          onClick={() => handleStartTrip(request)}
                        >
                          Start Trip
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No approved requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      case "inProgress":
        return (
          <div className="requests-section">
            <h2>Trips in Progress</h2>
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Destination</th>
                  <th>Start Time</th>
                  <th>Starting KM</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {journeys.filter((j) => j.status === "IN_PROGRESS").length >
                0 ? (
                  journeys
                    .filter((j) => j.status === "IN_PROGRESS")
                    .map((journey) => (
                      <tr key={journey.id}>
                        <td>
                          <div className="vehicle-info">
                            <span className="plate-number">
                              {journey?.vehicle?.plateNumber || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="driver-info">
                            <span className="driver-name">
                              {journey?.driver?.name || "N/A"}
                            </span>
                            <span className="driver-phone">
                              {journey?.driver?.phoneNumber || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td>{journey.endLocation}</td>
                        <td>{formatDate(journey.startTime)}</td>
                        <td>{journey.startingKilometer}</td>
                        <td>
                          <button
                            className="action-btn view"
                            onClick={() => setViewRequest(journey)}
                          >
                            View
                          </button>
                          <button
                            className="action-btn end-trip"
                            onClick={() => handleEndTrip(journey)}
                          >
                            End Trip
                          </button>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No trips in progress.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      case "completed":
        return (
          <div className="requests-section">
            <h2>Completed Trips</h2>
            <div className="time-filter-container">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="time-filter-select"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="lastWeek">Last 7 Days</option>
                <option value="lastMonth">Last 30 Days</option>
                <option value="allTime">All Time</option>
              </select>
            </div>
            <table className="requests-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Destination</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Distance</th>
                </tr>
              </thead>
              <tbody>
                {filterJourneysByTime(
                  journeys.filter((j) => j.status === "COMPLETED")
                ).length > 0 ? (
                  filterJourneysByTime(
                    journeys.filter((j) => j.status === "COMPLETED")
                  ).map((journey, index) => {
                    const request = assignedRequests.find(
                      (r) => r.id === journey.requestId
                    );
                    return (
                      <tr key={journey.id}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="vehicle-info">
                            <span className="plate-number">
                              {journey?.vehicle?.plateNumber || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="driver-info">
                            <span className="driver-name">
                              {journey?.driver?.name || "N/A"}
                            </span>
                            <span className="driver-phone">
                              {journey?.driver?.phoneNumber || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td>{journey.endLocation}</td>
                        <td>{formatDate(journey.startTime)}</td>
                        <td>{formatDate(journey.endTime)}</td>
                        <td>
                          {journey.distance} km
                          <button
                            className="action-btn view"
                            onClick={() =>
                              setViewRequest({ ...journey, ...request })
                            }
                            style={{ marginLeft: "8px" }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No completed trips found for the selected time period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="">
      <header
        className=""
        style={{
          fontWeight: "bold",
          padding: "28px 32px",
          borderRadius: "18px",
          // background removed
          boxShadow: "0 6px 24px rgba(189, 189, 189, 0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          // marginBottom: "32px",
          color: "#333",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="header-left"
          style={{ display: "flex", alignItems: "center" }}
        >
          <img
            src={Logo}
            alt="Logo"
            className="dashboard-logo"
            style={{
              // width: "72px",
              height: "120px",
              borderRadius: "00%",
              // boxShadow: "0 2px 12px rgba(189, 189, 189, 0.18)",
              marginRight: "24px",
              // border: "3px solid #fff",
              // background: "#fff",
            }}
          />
          <span
            className="dashboard-title-text"
            style={{
              fontSize: "2.2rem",
              letterSpacing: "2px",
              fontWeight: "900",
              textShadow: "0 2px 8px rgba(189, 189, 189, 0.18)",
              color: "#000000",
            }}
          >
            Journey Controller Dashboard
          </span>
        </div>
        <div
          className="header-right"
          style={{ display: "flex", alignItems: "center" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(230,230,230,0.7)",
              borderRadius: "12px",
              padding: "12px 20px",
              marginRight: "18px",
              boxShadow: "0 2px 8px rgba(189, 189, 189, 0.10)",
            }}
          >
            <span
              style={{
                fontSize: "2.1rem",
                marginRight: "14px",
                background: "linear-gradient(90deg, #bdbdbd 0%, #757575 100%)",
                borderRadius: "50%",
                padding: "8px",
                color: "#fff",
                boxShadow: "0 2px 8px rgba(189, 189, 189, 0.10)",
              }}
            >
              👤
            </span>
            <br />
            <div
              className=""
              style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#333" }}
            >
              {localStorage.getItem("name")}
              <br />
              <div
                className="user-role"
                style={{
                  fontSize: "0.65rem",
                  fontWeight: "500",
                  color: "#757575",
                  letterSpacing: "1px",
                }}
              >
                {localStorage.getItem("role")}
              </div>
            </div>
          </div>
          <button
            className="logout-btn"
            onClick={logout}
            style={{
              background: "linear-gradient(90deg, #757575 0%, #ff0000 100%)",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              borderRadius: "10px",
              padding: "12px 28px",
              fontSize: "1.1rem",
              boxShadow: "0 2px 8px rgba(189, 189, 189, 0.10)",
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.06)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            🚪 Logout
          </button>
        </div>
      </header>
      {/* Main Content */}
      <main className="controller-main">
        <div className="dashboard-summary fancy-summary">
          <div
            className={`summary-card fancy-card ${
              activeView === "assigned" ? "active" : ""
            }`}
            onClick={() => handleCardClick("assigned")}
            style={{
              background:
                activeView === "assigned"
                  ? "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)"
                  : "linear-gradient(90deg, #f7f7f7 0%, #e3e3e3 100%)",
              color: activeView === "assigned" ? "#fff" : "#333",
              boxShadow:
                activeView === "assigned"
                  ? "0 4px 16px rgba(67, 206, 162, 0.15)"
                  : "0 2px 8px rgba(0,0,0,0.07)",
              border: activeView === "assigned" ? "2px solid #43cea2" : "none",
              transition: "all 0.3s cubic-bezier(.25,.8,.25,1)",
              cursor: "pointer",
              fontWeight: "bold",
              marginRight: "16px",
              borderRadius: "14px",
              padding: "24px 32px",
            }}
          >
            <div
              className="summary-value"
              style={{ fontSize: "2.2rem", marginBottom: "8px" }}
            >
              {filteredAssignedRequests.length}
            </div>
            <div
              className="summary-label"
              style={{ fontSize: "1.15rem", letterSpacing: "1px" }}
            >
              Approved Requests
            </div>
          </div>

          <div
            className={`summary-card fancy-card ${
              activeView === "inProgress" ? "active" : ""
            }`}
            onClick={() => handleCardClick("inProgress")}
            style={{
              background:
                activeView === "inProgress"
                  ? "linear-gradient(90deg, #ff512f 0%, #dd2476 100%)"
                  : "linear-gradient(90deg, #f7f7f7 0%, #e3e3e3 100%)",
              color: activeView === "inProgress" ? "#fff" : "#333",
              boxShadow:
                activeView === "inProgress"
                  ? "0 4px 16px rgba(255, 81, 47, 0.15)"
                  : "0 2px 8px rgba(0,0,0,0.07)",
              border:
                activeView === "inProgress" ? "2px solid #ff512f" : "none",
              transition: "all 0.3s cubic-bezier(.25,.8,.25,1)",
              cursor: "pointer",
              fontWeight: "bold",
              marginRight: "16px",
              borderRadius: "14px",
              padding: "24px 32px",
            }}
          >
            <div
              className="summary-value"
              style={{ fontSize: "2.2rem", marginBottom: "8px" }}
            >
              {journeys.filter((j) => j.status === "IN_PROGRESS").length}
            </div>
            <div
              className="summary-label"
              style={{ fontSize: "1.15rem", letterSpacing: "1px" }}
            >
              Trips in Progress
            </div>
          </div>

          <div
            className={`summary-card fancy-card ${
              activeView === "completed" ? "active" : ""
            }`}
            onClick={() => handleCardClick("completed")}
            style={{
              background:
                activeView === "completed"
                  ? "linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)"
                  : "linear-gradient(90deg, #f7f7f7 0%, #e3e3e3 100%)",
              color: activeView === "completed" ? "#fff" : "#333",
              boxShadow:
                activeView === "completed"
                  ? "0 4px 16px rgba(0, 198, 255, 0.15)"
                  : "0 2px 8px rgba(0,0,0,0.07)",
              border: activeView === "completed" ? "2px solid #00c6ff" : "none",
              transition: "all 0.3s cubic-bezier(.25,.8,.25,1)",
              cursor: "pointer",
              fontWeight: "bold",
              marginRight: "16px",
              borderRadius: "14px",
              padding: "24px 32px",
            }}
          >
            <div
              className="summary-value"
              style={{ fontSize: "2.2rem", marginBottom: "8px" }}
            >
              {journeys.filter((j) => j.status === "COMPLETED").length}
            </div>
            <div
              className="summary-label"
              style={{ fontSize: "1.15rem", letterSpacing: "1px" }}
            >
              Completed Trips
            </div>
          </div>
          <div
            className={`summary-card pre-approved-card fancy-card`}
            style={{
              background: "linear-gradient(90deg, #f9d423 0%, #ff4e50 100%)",
              color: "#fff",
              boxShadow: "0 4px 16px rgba(255, 78, 80, 0.15)",
              cursor: "pointer",
              border: "none",
              fontWeight: "bold",
              transition: "transform 0.2s",
              marginRight: "16px",
              borderRadius: "14px",
              padding: "24px 32px",
            }}
            onClick={() => setPreApprovedTripFormVisible(true)}
          >
            <div
              className="summary-value"
              style={{ fontSize: "2.5rem", marginBottom: "8px" }}
            >
              <span role="img" aria-label="star">
                ⭐
              </span>
            </div>
            <div
              className="summary-label"
              style={{ fontSize: "1.15rem", letterSpacing: "1px" }}
            >
              Pre-Approved
            </div>
          </div>
        </div>

        {error && (
          <div
            className="error-message"
            style={{
              background: "linear-gradient(90deg, #ff512f 0%, #dd2476 100%)",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "8px",
              margin: "18px 0",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(255, 81, 47, 0.08)",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            className="loading-indicator"
            style={{
              padding: "24px",
              fontSize: "1.3rem",
              color: "#0072ff",
              textAlign: "center",
              fontWeight: "bold",
              background: "linear-gradient(90deg, #e3e3e3 0%, #f7f7f7 100%)",
              borderRadius: "8px",
              margin: "24px 0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            }}
          >
            Loading data...
          </div>
        ) : (
          renderTable()
        )}

        {/* Start Trip Popup */}
        {showStartTripPopup && selectedRequest && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>Start Trip</h3>
              <p>
                Please enter the current kilometer reading for each vehicle:
              </p>
              <div className="vehicle-kilometer-inputs">
                {selectedRequest.vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="kilometer-input-group">
                    <label htmlFor={`kilometer-${vehicle.id}`}>
                      {vehicle.plateNumber} - {vehicle.type}
                    </label>
                    <input
                      id={`kilometer-${vehicle.id}`}
                      type="number"
                      value={kilometerInputs[vehicle.id] || ""}
                      onChange={(e) =>
                        handleKilometerInputChange(vehicle.id, e.target.value)
                      }
                      placeholder="Enter kilometer reading"
                      className="kilometer-input"
                    />
                  </div>
                ))}
              </div>
              <div className="popup-buttons">
                <button
                  onClick={handleStartTripSubmit}
                  className="action-btn start-trip"
                >
                  Confirm Start
                </button>
                <button
                  onClick={() => {
                    setShowStartTripPopup(false);
                    setKilometerInputs({});
                  }}
                  className="action-btn cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* End Trip Popup */}
        {showEndTripPopup && selectedRequest && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>End Trip</h3>
              <p>Please enter the current kilometer reading for the vehicle:</p>
              <input
                type="number"
                value={kilometerInputs}
                onChange={(e) => setKilometerInputs(e.target.value)}
                placeholder="Enter kilometer reading"
                className="kilometer-input"
              />
              <div className="popup-buttons">
                <button
                  onClick={handleEndTripSubmit}
                  className="action-btn end-trip"
                >
                  Confirm End
                </button>
                <button
                  onClick={() => {
                    setShowEndTripPopup(false);
                    setKilometerInputs("");
                  }}
                  className="action-btn cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewRequest && (
          <div className="modal-bg">
            <div className="modal-card">
              <button
                className="modal-close"
                onClick={() => { setViewRequest(null); setEditingKm(false); }}
              >
                &times;
              </button>
              <h2>Trip Details</h2>
              <div className="modal-info-grid">
                {/* Vehicle Information */}
                <div className="modal-section">
                  <h3>Vehicle Information</h3>
                  {viewRequest.vehicles ? (
                    <div>
                      {viewRequest.vehicles.map((vehicle, index) => (
                        <div
                          key={vehicle.id}
                          style={{
                            marginBottom:
                              index < viewRequest.vehicles.length - 1
                                ? "16px"
                                : 0,
                            padding: "12px",
                            background: "#f8f9fa",
                            borderRadius: "6px",
                            border: "1px solid #e9ecef",
                          }}
                        >
                          <p style={{ margin: "4px 0" }}>
                            <strong>Vehicle {index + 1}:</strong>
                          </p>
                          <div className="info-item">
                            <span className="label">Plate Number:</span>
                            <span className="value">
                              {vehicle.plateNumber || "N/A"}
                            </span>
                          </div>
                          <div className="info-item">
                            <span className="label">Driver Name:</span>
                            <span className="value">
                              {vehicle.driverName || "N/A"}
                            </span>
                          </div>
                          <div className="info-item">
                            <span className="label">Phone Number:</span>
                            <span className="value">
                              {vehicle.driverPhoneNumber || "N/A"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "12px",
                        background: "#f8f9fa",
                        borderRadius: "6px",
                        border: "1px solid #e9ecef",
                      }}
                    >
                      <div className="info-item">
                        <span className="label">Plate Number:</span>
                        <span className="value">
                          {viewRequest.vehicle?.plateNumber || "N/A"}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="label">Driver Name:</span>
                        <span className="value">
                          {viewRequest.driver?.name || "N/A"}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="label">Phone Number:</span>
                        <span className="value">
                          {viewRequest.driver?.phoneNumber || "N/A"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Requester Information */}
                <div className="modal-section">
                  <h3>Requester Information</h3>
                  <div className="info-item">
                    <span className="label">Name:</span>
                    <span className="value">
                      {viewRequest.requester?.name || "N/A"}
                    </span>
                    {console.log("ViewRequest=", viewRequest)}
                  </div>
                  <div className="info-item">
                    <span className="label">Department:</span>
                    <span className="value">
                      {viewRequest.requester?.department?.name || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="modal-section">
                  <h3>Trip Details</h3>
                  <div className="info-item">
                    <span className="label">Destination:</span>
                    <span className="value">
                      {viewRequest.endLocation ||
                        viewRequest.destination ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Purpose:</span>
                    <span className="value">
                      {viewRequest.purpose || "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Distance:</span>
                    <span className="value">
                      {viewRequest.distance || "N/A"} km
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Starting Kilometer:</span>
                    {editingKm ? (
                      <input
                        type="number"
                        value={editKilometers.start !== null ? editKilometers.start : (viewRequest.startingKilometer || "")}
                        onChange={e => setEditKilometers(km => ({ ...km, start: e.target.value }))}
                        style={{ width: 120, marginRight: 8 }}
                      />
                    ) : (
                      <span className="value">{viewRequest.startingKilometer ?? "N/A"} km</span>
                    )}
                  </div>
                  <div className="info-item">
                    <span className="label">Ending Kilometer:</span>
                    {editingKm ? (
                      <input
                        type="number"
                        value={editKilometers.end !== null ? editKilometers.end : (viewRequest.endingKilometer || "")}
                        onChange={e => setEditKilometers(km => ({ ...km, end: e.target.value }))}
                        style={{ width: 120, marginRight: 8 }}
                      />
                    ) : (
                      <span className="value">{viewRequest.endingKilometer ?? "N/A"} km</span>
                    )}
                  </div>
                  {
                  localStorage.getItem("role") === Role.LOGISTICS_OFFICER &&
                  <div style={{ marginTop: 8 }}>
                    {!editingKm ? (
                      <button className="action-btn edit" 
                        onClick={() => {
                          setEditingKm(true);
                          setEditKilometers({
                            start: viewRequest.startingKilometer ?? "",
                            end: viewRequest.endingKilometer ?? ""
                        });
                      }}>Edit Kilometers</button>
                    ) : (
                      <>
                        <button
                          className="action-btn save"
                          onClick={async () => {
                            // Save logic: call backend to update journey
                            try {
                              // if (editKilometers.start !== null && editKilometers.start !== "") {
                                await api.put(`/logistics/journeys/${viewRequest.id}`, {
                                  ...viewRequest,
                                  startingKilometer: parseFloat(editKilometers.start),
                                  endingKilometer: parseFloat(editKilometers.end)
                                });
                              // }
                              // if (editKilometers.end !== null && editKilometers.end !== "") {
                              //   await api.put(`/logistics/journeys/${viewRequest.id}`, {
                              //     ...viewRequest,
                              //     endingKilometer: parseFloat(editKilometers.end)
                              //   });
                              // }
                              setEditingKm(false);
                              setEditKilometers({ start: null, end: null });
                              // reload data
                              await fetchJourneys();
                              // window.location.reload();
                            } catch (err) {
                              alert("Failed to update kilometers: " + (err?.message || "Unknown error"));
                            }
                          }}
                          style={{ marginRight: 8 }}
                        >Save</button>
                        <button className="action-btn cancel" onClick={() => { setEditingKm(false); setEditKilometers({ start: null, end: null }); }}>Cancel</button>
                      </>
                    )}
                  </div> }
                  
                </div>

                {/* Time Information */}
                <div className="modal-section">
                  <h3>Time Information</h3>
                  <div className="info-item">
                    <span className="label">Start Time:</span>
                    <span className="value">
                      {formatDate(viewRequest.startTime)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">End Time:</span>
                    <span className="value">
                      {formatDate(viewRequest.endTime)}
                    </span>
                  </div>
                  {viewRequest.startTime && viewRequest.endTime && (
                    <div className="info-item">
                      <span className="label">Duration:</span>
                      <span className="value">
                        {(() => {
                          const start = new Date(viewRequest.startTime);
                          const end = new Date(viewRequest.endTime);
                          const duration = end - start;
                          const hours = Math.floor(duration / (1000 * 60 * 60));
                          const minutes = Math.floor(
                            (duration % (1000 * 60 * 60)) / (1000 * 60)
                          );
                          return `${hours}h ${minutes}m`;
                        })()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Travelers Section */}
                <div className="modal-section full-width">
                  <h3>Travelers</h3>
                  <div className="travelers-list">
                    {viewRequest.travelerNames &&
                    viewRequest.travelerNames.length > 0 ? (
                      <ul>
                        {viewRequest.travelerNames.map((name, index) => (
                          <li key={index}>{name}</li>
                        ))}
                        <h3>Merged travelers:</h3>
                        {viewRequest.mergedRequests.map((req, idx) => (
                          <li key={idx}>{req.travelerNames?.join(", ")}</li>
                        ))}
                      </ul>
                    ) : viewRequest.travelers &&
                      viewRequest.travelers.length > 0 ? (
                      <ul>
                        {viewRequest.travelers.map((traveler, index) => (
                          <li key={index}>
                            {traveler.name
                              ? traveler.name
                              : `Traveler ${index + 1}`}
                          </li>
                        ))}
                      </ul>
                    ) :
                    
                    
                    (
                      <span className="no-travelers">
                        No travelers assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="action-btn cancel"
                  onClick={() => setViewRequest(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {preApprovedTripFormVisible && (
          <div className="modal-bg">
            <PreApprovedTripForm
              onClose={() => setPreApprovedTripFormVisible(false)}
              fetchAssignedRequests={fetchAssignedRequests}
              fetchJourneys={fetchJourneys}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default ControllerDashboard;
