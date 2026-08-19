import React, { useState, useEffect } from "react";
import api from "../../api/axios"; // your axios instance
import Sidebar from "./Sidebar";
import "./Manager.css";
import Role from "../../enums/role";
import { useNavigate } from "react-router-dom";

// Status mapping
const statusMap = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  LOGGED: "Logged",
};

const TireReplacementVerification = () => {
  const [requests, setRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("PENDING"); // default to PENDING
  const [viewRequest, setViewRequest] = useState(null);

  // Fetch data when statusFilter changes
  useEffect(() => {
    fetchRequestsByStatus(statusFilter);
    fetchVehicles();
  }, [statusFilter]);

  // Fetch requests based on selected status
  const fetchRequestsByStatus = async (status) => {
    try {
      setLoading(true);
      const res = await api.get(`/tire-replacement?status=${status}`);
      setRequests(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to load tire replacement requests");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all vehicles
  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles");
      setVehicles(res.data);
    } catch {
      // Optional: handle errors silently
    }
  };

  // Verify handler
  const handleVerify = async (id) => {
    try {
      await api.put(`/tire-replacement/${id}/verify`);
      fetchRequestsByStatus(statusFilter);
    } catch {
      setError("Failed to verify request");
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/tire-replacement/${id}/approve`);
      fetchRequestsByStatus(statusFilter);
    } catch {
      setError("Failed to verify request");
    }
  };

  // Reject handler
  const handleReject = async (id) => {
    try {
      await api.put(`/tire-replacement/${id}/reject`);
      fetchRequestsByStatus(statusFilter);
    } catch {
      setError("Failed to reject request");
    }
  };
  // Add to Log handler
  const navigate = useNavigate();

  const handleAddToLog = (req) => {
    navigate(`/fms/manager/tire-replacement/log/`, { state: { request: req } });
  };

  // Utility to get plate number from vehicle list
  const getPlateNumber = (vehicleId) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle ? vehicle.plateNumber : "N/A";
  };
  // Status style for badges for a given request
  const getStatusStyle = (req) => {
    let statusStyle = {};
    if (req.status === "PENDING") {
      statusStyle = {
        background: "#ffe5b4",
        color: "#a65c00",
        borderRadius: "6px",
        padding: "10px 10px",
        fontWeight: "bold",
      };
    } else if (req.status === "VERIFIED") {
      statusStyle = {
        background: "#d4f8e8",
        color: "#218838",
        borderRadius: "6px",
        padding: "10px 10px",
        fontWeight: "bold",
      };
    } else if (req.status === "APPROVED") {
      statusStyle = {
        background: "#1e7e34",
        color: "#fff",
        borderRadius: "6px",
        padding: "10px 10px",
        fontWeight: "bold",
      };
    } else if (req.status === "REJECTED") {
      statusStyle = {
        background: "#f8d7da",
        color: "#c82333",
        borderRadius: "6px",
        padding: "10px 10px",
        fontWeight: "bold",
      };
    }
    return statusStyle;
  };

  return (
    <div className="manager-dashboard-layout">
      <Sidebar />
      <main className="manager-dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Tire Replacement Requests</h1>
        </div>

        {/* Filter Buttons */}
        <div className="request-status-filters">
          {Object.keys(statusMap).map((status) => (
            <button
              key={status}
              className={`request-status-btn ${
                statusFilter === status ? "active" : ""
              }`}
              onClick={() => setStatusFilter(status)}
            >
              {statusMap[status]}
            </button>
          ))}
        </div>

        {error && <p className="error-message">{error}</p>}

        {loading ? (
          <p>Loading requests...</p>
        ) : requests.length === 0 ? (
          <p>No {statusMap[statusFilter]} requests available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Plate Number</th>
                <th>Request Date</th>
                <th>Tire Position</th>
                <th>Old Tire Brand</th>
                {statusFilter === "LOGGED" && (
                  <>
                    <th>New Tire Brand</th>
                    <th>New Tire Serial Number</th>
                    <th>New Tire Mount Date</th>
                    <th>Odometer at Replacement</th>
                    <th>Fitted By</th>
                  </>
                )}

                <th>Reason for Replacement</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests
                .filter(
                  (req) => statusFilter === "ALL" || req.status === statusFilter
                )
                .map((req) => {
                  return (
                    <tr key={req.id}>
                      <td>{req.id}</td>
                      <td>
                        {getPlateNumber(req.vehicle?.id || req.vehicleId)}
                      </td>
                      <td>
                        {new Date(req.dateOfRequest).toLocaleDateString()}
                      </td>
                      <td>{req.tirePosition}</td>
                      <td>{req.oldTireBrand}</td>
                      {statusFilter === "LOGGED" && (
                        <>
                          <td>{req.newTireBrand || "N/A"}</td>
                          <td>{req.newTireSerialNumber || "N/A"}</td>
                          <td>
                            {req.newTireMountDate
                              ? new Date(
                                  req.newTireMountDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>{req.odometerAtReplacement || "N/A"}</td>
                          <td>
                            {req.replacedBy ? `${req.replacedBy.name}` : "N/A"}
                          </td>
                        </>
                      )}

                      <td>{req.reasonForReplacement}</td>
                      <td>
                        {
                          <span style={getStatusStyle(req)}>
                            {statusMap[req.status]}
                          </span>
                        }
                      </td>
                      <td>
                        <button
                          className="action-btn view"
                          onClick={() => setViewRequest(req)}
                        >
                          View
                        </button>

                        {req.status === "PENDING" &&
                          statusFilter === "PENDING" && (
                            <>
                              <button
                                className="request-status-btn pending"
                                onClick={() => handleVerify(req.id)}
                              >
                                Verify
                              </button>
                              <button
                                className="request-status-btn rejected"
                                onClick={() => handleReject(req.id)}
                                style={{ marginLeft: "8px" }}
                              >
                                Reject
                              </button>
                            </>
                          )}

                        {req.status === "VERIFIED" &&
                          statusFilter === "VERIFIED" &&
                          localStorage.getItem("role") ===
                            Role.LOGISTICS_HEAD && (
                            <>
                              <button
                                className="request-status-btn approved"
                                onClick={() => handleApprove(req.id)}
                              >
                                Approve
                              </button>
                              <button
                                className="request-status-btn rejected"
                                onClick={() => handleReject(req.id)}
                                style={{ marginLeft: "8px" }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        {req.status === "APPROVED" &&
                          statusFilter === "APPROVED" && (
                            <>
                              <button
                                className="request-status-btn approved"
                                onClick={() => handleAddToLog(req)}
                              >
                                Add To Log
                              </button>
                            </>
                          )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            {viewRequest && (
              <div className="modal-bg">
                <div className="modal-card">
                  <button
                    className="modal-close"
                    onClick={() => setViewRequest(null)}
                  >
                    &times;
                  </button>
                  <h2>Request Details</h2>
                  <div className="modal-info-grid">
                    <div>
                      <b>Plate Number:</b>{" "}
                      {getPlateNumber(
                        viewRequest.vehicle?.id || viewRequest.vehicleId
                      )}
                    </div>
                    <div>
                      <b>Date of Request:</b>{" "}
                      {new Date(viewRequest.dateOfRequest).toLocaleDateString()}
                    </div>
                    <div>
                      <b>Tire Position:</b> {viewRequest.tirePosition}
                    </div>
                    <div>
                      <b>Old Tire Brand:</b> {viewRequest.oldTireBrand}
                    </div>
                    <div>
                      <b>Odometer at Mounting:</b>{" "}
                      {viewRequest.odometerAtMounting}
                    </div>
                    <div>
                      <b>Current Odometer:</b> {viewRequest.currentOdometer}
                    </div>
                    <div>
                      <b>Reason for Replacement:</b>{" "}
                      {viewRequest.reasonForReplacement}
                    </div>
                    <div>
                      <b>Status:</b>
                      <span style={getStatusStyle(viewRequest)}>
                        {viewRequest.status}
                      </span>
                    </div>
                    {viewRequest.status === "LOGGED" && (
                      <>
                        <div
                          style={{
                            gridColumn: "1 / -1",
                            marginTop: "10px",
                            fontWeight: "bold",
                          }}
                        >
                          New Tire Details
                        </div>
                        <div>
                          <b>New Tire Brand:</b>{" "}
                          {viewRequest.newTireBrand || "N/A"}
                        </div>
                        <div>
                          <b>New Tire Serial Number:</b>{" "}
                          {viewRequest.newTireSerialNumber || "N/A"}
                        </div>
                        <div>
                          <b>New Tire Mount Date:</b>{" "}
                          {viewRequest.newTireMountDate
                            ? new Date(
                                viewRequest.newTireMountDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                        <div>
                          <b>Odometer at Replacement:</b>{" "}
                          {viewRequest.odometerAtReplacement || "N/A"}
                        </div>
                        {viewRequest.replacedBy && (
                          <div style={{ gridColumn: "1 / -1" }}>
                            <b>Fitted By:</b> {viewRequest.replacedBy.name} (
                            {viewRequest.replacedBy.role})<br />
                            <small>{viewRequest.replacedBy.email}</small>
                          </div>
                        )}
                      </>
                    )}

                    {viewRequest.requester && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <b>Requested By:</b> {viewRequest.requester.name} (
                        {viewRequest.requester.role})<br />
                        <small>{viewRequest.requester.email}</small>
                      </div>
                    )}

                    {viewRequest.verifiedBy && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <b>Verified By:</b> {viewRequest.verifiedBy.name} (
                        {viewRequest.verifiedBy.role})<br />
                        <small>{viewRequest.verifiedBy.email}</small>
                      </div>
                    )}

                    {viewRequest.approvedBy && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <b>Approved By:</b> {viewRequest.approvedBy.name} (
                        {viewRequest.approvedBy.role})<br />
                        <small>{viewRequest.approvedBy.email}</small>
                      </div>
                    )}

                    {viewRequest.rejectedBy && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <b>Rejected By:</b> {viewRequest.rejectedBy.name} (
                        {viewRequest.rejectedBy.role})<br />
                        <small>{viewRequest.rejectedBy.email}</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </table>
        )}
      </main>
    </div>
  );
};

export default TireReplacementVerification;
