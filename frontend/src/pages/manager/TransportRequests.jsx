import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./Manager.css";
import api from "../../api/axios";
import * as XLSX from 'xlsx';
import { getFullImageUrl } from "./imageUtils";
import { CircularProgress } from "@mui/material";
import VehicleRequestModal from "../../components/VehicleRequestModal";
import VehicleCategory from "../../enums/VehicleCategory";
import VehicleStatus from "../../enums/VehicleStatus";

// Make status text helper available at module scope so both the component
// and the XLSX helpers can use it (prevents `no-undef` when helpers are
// defined outside the component).
function getStatusText(status) {
  switch (status) {
    case 0:
      return "Pending";
    case 1:
      return "Approved";
    case 2:
      return "Rejected";
    case 3:
      return "Assigned";
    case 4:
      return "Cleared to go";
    case 5:
      return "In Progress";
    case 6:
      return "Completed";
    case 7:
      return "Merged";
    default:
      return "Unknown";
  }
}

const TransportRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewRequest, setViewRequest] = useState(null);
  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [requestToReject, setRequestToReject] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [assigningRequest, setAssigningRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  // Add state for users
  const [users, setUsers] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [mergeBaseRequest, setMergeBaseRequest] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  // Merge request
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [selectedMergeRequests, setSelectedMergeRequests] = useState([]);
  const [activeTab, setActiveTab] = useState(1);

  // Fetch requests and users on component mount
  useEffect(() => {
    fetchApprovedRequests();
    fetchVehicles();
    fetchUsers();
    // Get user role from localStorage
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  //
  // Add function to fetch users
  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      if (response.status !== 200) {
        throw new Error("Failed to fetch users");
      }
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleSubmitRequest = async (formData) => {
    setLoading(true);

    try {
      if (editingRequest) {
        await api.put(`/requests/${editingRequest.id}`, formData);
      } else {
        await api.post("/requests", formData);
      }
      // Success feedback
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleMergeCheckbox = (id) => {
    setSelectedMergeRequests(
      (prev) =>
        prev.includes(id)
          ? prev.filter((reqId) => reqId !== id) // uncheck
          : [...prev, id] // check
    );
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/requests");
      if (response.status !== 200) {
        throw new Error("Failed to fetch transport requests");
      }
      // Sort requests with newest first (assuming higher IDs are newer)
      const sortedRequests = [...response.data].filter(req=>req.status !=0).sort((a, b) => b.id - a.id);
      setRequests(sortedRequests);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // fetch approved requests
  const fetchApprovedRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/requests/approved");
      if (response.status !== 200) {
        throw new Error("Failed to fetch approved transport requests");
      }
      setRequests(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // fetch rejected requests
  const fetchRejectedRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/requests/rejected");
      if (response.status !== 200) {
        throw new Error("Failed to fetch rejected transport requests");
      }
      setRequests(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {

      setLoading(false);
    }
  };
  // fetch assigned requests
  const fetchAssignedRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/requests/assigned");
      if (response.status !== 200) {
        throw new Error("Failed to fetch assigned transport requests");
      }
      setRequests(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // fetch merged requests
  const fetchMergedRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/requests/merged");
      if (response.status !== 200) {
        throw new Error("Failed to fetch merged transport requests");
      }
      setRequests(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  //  fetch in progress requests
  const fetchInProgressRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/requests/in-progress");
      if (response.status !== 200) {
        throw new Error("Failed to fetch in-progress transport requests");
      }
      setRequests(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
// fetch completed requests
  const fetchCompletedRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/requests/completed");
      if (response.status !== 200) {
        throw new Error("Failed to fetch completed transport requests");
      }
      setRequests(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const fetchVehicles = async () => {
    try {
      // Using the same pattern as Drivers.jsx
      const response = await api.get("/vehicles");
      if (response.status !== 200) {
        throw new Error("Failed to fetch vehicles");
      }
      setVehicles(response.data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };



  const handleLogisticsHeadApprove = async (id) => {
    try {
      const response = await api.get(`/requests/${id}/logistics-head/approve`);
      if (response.status !== 200) {
        throw new Error("Failed to approve request");
      }
      await fetchRequests();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

    // Open modal to reject with reason
    const openRejectModal = (request) => {
        setRequestToReject(request);
        setRejectReason("");
        setShowRejectModal(true);
    };

    // Actually perform the rejection with reason
    const handleLogisticsHeadReject = async () => {
        if (!requestToReject || !rejectReason.trim()) return;
        try {
            const response = await api.post(`/requests/${requestToReject.id}/reject`, {
                reason: rejectReason,
            });
            if (response.status !== 200) {
                throw new Error("Failed to reject request");
            }
            await fetchRequests();
            setShowRejectModal(false);
            setRequestToReject(null);
            setRejectReason("");
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

  const mergingRequests = async () => {
    console.log("selectedMergeRequests=", selectedMergeRequests);
    if (selectedMergeRequests.length === 0 || !mergeBaseRequest) return;

    try {
      setIsAssigning(true);
      const response = await api.post(
        `/requests/${mergeBaseRequest.id}/merge`,
        selectedMergeRequests.map((id) => Number(id))
      );
      if (response.status !== 200) {
        throw new Error("Failed to merge requests");
      }
      await fetchRequests();
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setMergeBaseRequest(null);
      setSelectedMergeRequests([]);
      setIsAssigning(false);
    }
  };

  const fetchClearedRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/requests/cleared");
      if (response.status !== 200) {
        throw new Error("Failed to fetch cleared transport requests");
      }
      setRequests(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignVehicle = async () => {
    if (selectedVehicles.length === 0 || !assigningRequest) return;

    try {
      setIsAssigning(true);
      const response = await api.post(
        `/requests/${assigningRequest.id}/logistics/assign-multiple`,
        selectedVehicles.map((id) => Number(id))
      );
      if (response.status !== 200) {
        throw new Error("Failed to assign vehicles");
      }
      await fetchRequests();
      setAssigningRequest(null);
      setSelectedVehicles([]);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleVehicleSelection = (vehicleId) => {
    setSelectedVehicles((prev) => {
      if (prev.includes(vehicleId)) {
        return prev.filter((id) => id !== vehicleId);
      } else {
        return [...prev, vehicleId];
      }
    });
  };

  const approveLogisticsRequest = async (requestId) => {
    try {
      const response = await api.get(
        `/requests/${requestId}/department/approve`
      );
      if (response.status !== 200) {
        throw new Error("Failed to approve logistics request");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUnassignVehicle = async (requestId) => {
    try {
      // First, find the request to get all assigned vehicles
      const request = requests.find((r) => r.id === requestId);
      if (request && request.vehicles) {
        // Update each vehicle's status to AVAILABLE
        for (const vehicle of request.vehicles) {
          await api.put(`/vehicles/logistics/${vehicle.id}`, {
            ...vehicle,
            status: "AVAILABLE",
          });
        }
      }

      // Then unassign the vehicles from the request
      const response = await api.get(
        `/requests/${requestId}/logistics/unassign`
      );
      if (response.status !== 200) {
        throw new Error("Failed to unassign vehicle");
      }
      await fetchRequests();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  

  // Add helper function to format trip type display
  const formatTripType = (tripType) => {
    switch (tripType) {
      case "CITY_TRIP":
        return "City Trip";
      case "FIELD_TRIP":
        return "Field Trip";
      case "EMERGENCY_TRIP":
        return "Emergency Trip";
      default:
        return tripType || "N/A";
    }
  };

  // Filter requests by search term and status
  const filteredRequests = requests.filter((req) => {
    // Filter by search term
    const searchMatch =
      req.destination?.toLowerCase().includes(search.toLowerCase()) ||
      req.purpose?.toLowerCase().includes(search.toLowerCase()) ||
      req.requester?.name?.toLowerCase().includes(search.toLowerCase()) ||
      req.requester?.department?.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      req.vehicle?.plateNumber?.toLowerCase().includes(search.toLowerCase());

    // Filter by status
    const statusMatch =
      statusFilter === "all" || req.status.toString() === statusFilter;

    // If no date filters selected, apply search/status only
    if (!startDate && !endDate) return searchMatch && statusMatch;

    // Parse request start time (support camelCase and snake_case)
    const reqStart = new Date(req.startTime || req.start_time);
    if (isNaN(reqStart)) return false; // when date filtering is active, skip requests without valid start time

    const rangeStart = startDate ? new Date(startDate + 'T00:00:00') : null;
    const rangeEnd = endDate ? new Date(endDate + 'T23:59:59.999') : null;

    if (rangeStart && reqStart < rangeStart) return false;
    if (rangeEnd && reqStart > rangeEnd) return false;

    return searchMatch && statusMatch;
  });

  // Get counts for each status
  const statusCounts = {
    all: requests.length,
    0: requests.filter((req) => req.status === 0).length,
    1: requests.filter((req) => req.status === 1).length,
    2: requests.filter((req) => req.status === 2).length,
    3: requests.filter((req) => req.status === 3).length,
    4: requests.filter((req) => req.status === 4).length,
    5: requests.filter((req) => req.status === 5).length,
    6: requests.filter((req) => req.status === 6).length,
    7: requests.filter((req) => req.status === 7).length,
  };

  // Add this function to filter vehicles
  const getFilteredVehicles = () => {
    // filter out all vehicles with vehicle_category = DEPARTMENT_EXCLUSSIVE
    // ALSo if vehicle category is NIGHT_SHIFT it filter out(exclude) durring 5:00 PM to 7:00 AM
    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    return vehicles
      .filter((vehicle) => (vehicle.status === VehicleStatus.AVAILABLE) && (vehicle.vehicleCategory !== VehicleCategory.DEPARTMENT_EXCLUSIVE))
      //excluding Night Shift vehicles during 5:00 PM to 7:00 AM
      .filter((vehicle) => {
        if (vehicle.vehicleCategory === VehicleCategory.NIGHT_SHIFT) {
          return currentHour < 17 || currentHour > 7;
        }
        return true;
      })
      .filter((vehicle) => {
        const searchTerm = vehicleSearch.toLowerCase();
        return (
          vehicle.model?.toLowerCase().includes(searchTerm) ||
          vehicle.plateNumber?.toLowerCase().includes(searchTerm) ||
          vehicle.seatCapacity?.toString().includes(searchTerm)
        );
      });
  };

  if (loading) {
    return (
      <div className="manager-dashboard-layout">
        <Sidebar />
        <main className="manager-dashboard-main">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Transport Requests</h1>
          </div>
          <div className="loading">Loading transport requests...</div>
        </main>
      </div>
    );
  }
  // Render the reject modal as a portal/modal in the main return below

  return (
    <div className="manager-dashboard-layout">
      <Sidebar />
      <main
        className={`manager-dashboard-main${
          viewRequest || assigningRequest ? " blurred-bg" : ""
        }`}
      >
        <div className="dashboard-header">
          <h1 className="dashboard-title">Transport Requests</h1>
        </div>
        {error && <div className="error-message">{error}</div>}

        {/* Status filter buttons */}
        <div className="request-status-filters">
          {/* <button
            className={`request-status-btn ${
              statusFilter === "all" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("all")}
          >
            All Requests ({statusCounts.all})
          </button> */}
          {/* <button
            className={`request-status-btn pending ${
              statusFilter === "0" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("0")}
          >
            Pending ({statusCounts["0"]})
          </button> */}
          <button
            className={`request-status-btn approved ${
              activeTab === 1 ? "active" : ""
            }`}
            onClick={() => { fetchApprovedRequests(); setActiveTab(1); }}
          >
            Requests {activeTab === 1 ?( "("+ requests.length +")" ): ""}
          </button>
          <button
            className={`request-status-btn rejected ${
              activeTab === 2 ? "active" : ""
            }`}
            onClick={() => { fetchRejectedRequests(); setActiveTab(2); }}
          >
            Rejected {activeTab === 2 ?( "("+ requests.length +")" ): ""}
          </button>
          {/* <button
            className={`request-status-btn rejected ${
              statusFilter === "2" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("2")}
          >
            Rejected ({statusCounts["2"]})
          </button> */}
          <button
            className={`request-status-btn merged ${
              activeTab === 7 ? "active" : ""
            }`}
            onClick={() => { fetchMergedRequests(); setActiveTab(7); }}
          >
            Merged {activeTab === 7 ?( "("+ requests.length +")" ): ""}
          </button>
          <button
            className={`request-status-btn assigned ${
              activeTab === 3 ? "active" : ""
            }`}
            onClick={() => { fetchAssignedRequests(); setActiveTab(3); }}
          >
            Assigned {activeTab === 3 ?( "("+ requests.length +")" ): ""}
          </button>
          <button
            className={`request-status-btn cleared ${
              activeTab === 4 ? "active" : ""
            }`}
            onClick={() => { fetchClearedRequests(); setActiveTab(4); }}
          >
            Cleared to go {activeTab === 4 ?( "("+ requests.length +")" ): ""}
          </button>
          <button
            className={`request-status-btn in-progress ${
              activeTab === 5 ? "active" : ""
            }`}
            onClick={() => { fetchInProgressRequests(); setActiveTab(5); }}
          >
            In Trip {activeTab === 5 ?( "("+ requests.length +")" ): ""}
          </button>
          {/* <button
            className={`request-status-btn completed ${
              activeTab === 6 ? "active" : ""
            }`}
            onClick={() => { fetchCompletedRequests(); setActiveTab(6); }}
          >
            Completed Trips {activeTab === 6 ?( "("+ requests.length +")" ): ""}
          </button> */}
        </div>

        <div className="vehicles-toolbar">
          <input
            className="vehicles-search"
            type="text"
            placeholder="Search by requester, department, destination, purpose, vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
            <input
              type="date"
              className="date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Start date"
            />
            <span style={{ margin: '0 4px' }}>to</span>
            <input
              type="date"
              className="date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="End date"
            />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="action-btn"
              onClick={() => { setStartDate(''); setEndDate(''); }}
            >
              Clear
            </button>
             <button className="add-btn small" onClick={() => exportRequestsXLSX(filteredRequests)}>
              Export XLSX
            </button>

            <button className="add-btn small" onClick={() => setShowForm(true)}>
              Add Request
            </button>
           
          </div>
        </div>


        {filteredRequests.length > 0 ? (
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>No. </th>
                <th>Requester</th>
                <th>Department</th>
                {/* <th>Trip Type</th> */}
                <th>Destination</th>
                {/* <th>Purpose</th> */}
                {/* <th>Status</th> */}
                <th>Start Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req, index) => (
                <tr key={req.id}>
                  <td>{index + 1}</td>
                  <td>{req.requester.name}</td>
                  <td>{req.requester.department?.name || "N/A"}</td>
                  {/* <td>{formatTripType(req.tripType)}</td> */}
                  <td>{req.destination}</td>
                  {/* <td>{req.purpose || "N/A"}</td> */}
                  {/* <td>
                    <span
                      className={`request-status-badge status-${req.status}`}
                    >
                      {getStatusText(req.status)}
                    </span>
                  </td> */}
                  <td>{new Date(req.startTime).toLocaleString()}</td>
                  <td>
                    <button
                      className="action-btn view"
                      onClick={() => setViewRequest(req)}
                    >
                      View
                    </button>
                    {/* Logistics Officer Actions */}
                    {userRole === "LOGISTICS_OFFICER" && (
                      <>
                        {req.status === 1 && (
                          <>
                            <button
                              className="action-btn edit"
                              onClick={() => setAssigningRequest(req)}
                            >
                              Assign Vehicle
                            </button>
                            <button
                              className="action-btn reject"
                              onClick={() => openRejectModal(req)}
                            >
                              Reject
                            </button>
                            {requests.filter(
                              (req) =>
                                req.status === 1 &&
                                req.id !== mergeBaseRequest?.id
                            ).length > 1 && (
                              <button
                                className=""
                                style={{
                                  marginLeft: "10px",
                                  backgroundColor: "gray",
                                  color: "white",
                                  border: "none",
                                  padding: "6px 12px",
                                  borderRadius: "4px",
                                }}
                                onClick={() => {
                                  setMergeModalOpen(true);
                                  setMergeBaseRequest(req);
                                }}
                              >
                                Merge with others
                              </button>
                            )}
                          </>
                        )}
                        {/* Edit Button for logistics officers and heads*/}
                        {userRole === "LOGISTICS_OFFICER" &&
                          req.status === 0 && (
                            <button
                              className="action-btn approve"
                              onClick={() => approveLogisticsRequest(req.id)}
                            >
                              Approve
                            </button>
                          )}

                        {req.status === 3 && (
                          <button
                            className="action-btn delete"
                            onClick={() => handleUnassignVehicle(req.id)}
                          >
                            Unassign Vehicle
                          </button>
                        )}
                      </>
                    )}
                    {/* Logistics Head Actions */}
                    {userRole === "LOGISTICS_HEAD" && req.status === 3 && (
                      <>
                        <button
                          className="action-btn approve"
                          onClick={() => handleLogisticsHeadApprove(req.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="action-btn reject"
                          onClick={() => openRejectModal(req)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              backgroundColor: "#f9f9f9",
              borderRadius: "4px",
              margin: "20px 0",
            }}
          >
            <p>No transport requests found matching your filters.</p>
          </div>
        )}
      </main>
      {/* Render modal */}
      <VehicleRequestModal
        showAddForm={showForm}
        setShowForm={setShowForm}
        users={users}
        editingRequest={editingRequest}
        setEditingRequest={setEditingRequest}
        onSubmitRequest={handleSubmitRequest}
        loading={loading}
      />

      {/* View Modal */}
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
                <b>Requester:</b> {viewRequest.requester?.name || "N/A"}
              </div>
              <div>
                <b>Department:</b>{" "}
                {viewRequest.requester?.department?.name || "N/A"}
              </div>
              <div>
                <b>Trip Type:</b> {formatTripType(viewRequest.tripType)}
              </div>
              <div>
                <b>Destination:</b> {viewRequest.destination}
              </div>
              <div>
                <b>Purpose:</b> {viewRequest.purpose || "N/A"}
              </div>
              <div>
                <b>Start Time:</b> {formatDate(viewRequest.startTime)}
              </div>
              <div>
                <b>End Time:</b> {formatDate(viewRequest.endTime || "N/A")}
              </div>
              <div>
                <b>Status:</b>
                <span
                  className={`request-status-badge status-${viewRequest.status}`}
                >
                  {getStatusText(viewRequest.status)}
                </span>
              </div>

              {/* Travelers Section - Enhanced like VehicleRequest */}
              {/* {true||(viewRequest.travelerNames && viewRequest.travelerNames.length > 0) && ( */}
              <div style={{ gridColumn: "1 / -1" }}>
                <b>Travelers:</b>
                <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                  {viewRequest.travelerNames?.map((name, index) => (
                    <li key={index} style={{ marginBottom: "4px" }}>
                      {name}
                    </li>
                  ))}
                </ul>
                <b>Merged travelers:</b>
                <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                  {viewRequest.baseRequest?.travelerNames?.map(
                    (traveler, index) => (
                      <li key={index} style={{ marginBottom: "4px" }}>
                        {traveler || `Traveler ${index + 1}`} - {"No email"}
                      </li>
                    )
                  )}
                  {console.log(
                    "Merged Travelers: ",
                    viewRequest.mergedRequests
                  )}
                  {console.log(
                    "travelerNames: ",
                    viewRequest.mergedRequests[0]?.travelerNames
                  )}
                  {viewRequest.mergedRequests?.map((req, index) => (
                    <li key={index} style={{ marginBottom: "4px" }}>
                      {req.travelerNames?.join(", ") || `Traveler ${index + 1}`}{" "}
                    </li>
                  ))}
                </ul>
              </div>
              {/* )}  */}

              {/* Fallback for travelers array with IDs */}
              {viewRequest.travelers &&
                viewRequest.travelers.length > 0 &&
                !viewRequest.travelerNames && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <b>Travelers--:</b>
                    <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                      {viewRequest.travelers.map((traveler, index) => (
                        <li key={index} style={{ marginBottom: "4px" }}>
                          {traveler.name
                            ? traveler.name
                            : `Traveler ${index + 1}`}{" "}
                          - {traveler.email || "No email"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Vehicle Assignment Section */}
              {viewRequest.vehicles &&
                viewRequest.vehicles.map((vehicle, index) => (
                  <div
                    key={vehicle.id}
                    style={{
                      marginTop: "8px",
                      padding: "12px",
                      background: "#f8f9fa",
                      borderRadius: "6px",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <p style={{ margin: "4px 0" }}>
                      <strong>Vehicle {index + 1}:</strong>
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Plate Number:</strong>{" "}
                      {vehicle.plateNumber || "N/A"}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Driver Name:</strong>{" "}
                      {vehicle.driverName || "N/A"}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Phone Number:</strong>{" "}
                      {vehicle.driverPhoneNumber || "N/A"}
                    </p>
                  </div>
                ))}
              {viewRequest.baseRequest &&
                viewRequest.baseRequest.vehicles &&
                viewRequest.baseRequest.vehicles.length > 0 && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <b>Assigned Vehicles:</b>

                    {viewRequest.vehicles &&
                      viewRequest.vehicles.map((vehicle, index) => (
                        <div
                          key={vehicle.id}
                          style={{
                            marginTop: "8px",
                            padding: "12px",
                            background: "#f8f9fa",
                            borderRadius: "6px",
                            border: "1px solid #e9ecef",
                          }}
                        >
                          <p style={{ margin: "4px 0" }}>
                            <strong>Vehicle {index + 1}:</strong>
                          </p>
                          <p style={{ margin: "4px 0" }}>
                            <strong>Plate Number:</strong>{" "}
                            {vehicle.plateNumber || "N/A"}
                          </p>
                          <p style={{ margin: "4px 0" }}>
                            <strong>Driver Name:</strong>{" "}
                            {vehicle.driverName || "N/A"}
                          </p>
                          <p style={{ margin: "4px 0" }}>
                            <strong>Phone Number:</strong>{" "}
                            {vehicle.driverPhoneNumber || "N/A"}
                          </p>
                        </div>
                      ))}
                    {viewRequest.baseRequest &&
                      viewRequest.baseRequest.vehicles &&
                      viewRequest.baseRequest.vehicles.map((vehicle, index) => (
                        <div
                          key={vehicle.id}
                          style={{
                            marginTop: "8px",
                            padding: "12px",
                            background: "#f8f9fa",
                            borderRadius: "6px",
                            border: "1px solid #e9ecef",
                          }}
                        >
                          <p style={{ margin: "4px 0" }}>
                            <strong>Vehicle {index + 1}:</strong>
                          </p>
                          <p style={{ margin: "4px 0" }}>
                            <strong>Plate Number:</strong>{" "}
                            {vehicle.plateNumber || "N/A"}
                          </p>
                          <p style={{ margin: "4px 0" }}>
                            <strong>Driver Name:</strong>{" "}
                            {vehicle.driverName || "N/A"}
                          </p>
                          <p style={{ margin: "4px 0" }}>
                            <strong>Phone Number:</strong>{" "}
                            {vehicle.driverPhoneNumber || "N/A"}
                          </p>
                        </div>
                      ))}
                  </div>
                )}

              {(!(viewRequest.vehicles || viewRequest.baseRequest?.vehicles) ||
                (viewRequest.vehicles.length === 0 &&
                  viewRequest.baseRequest?.vehicles.length === 0)) && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <b>Vehicle:</b>
                  <span
                    style={{
                      color: "red",
                      fontWeight: "bold",
                      marginLeft: "8px",
                    }}
                  >
                    Not Assigned
                  </span>
                </div>
              )}

              {/* Approval Information */}
              {viewRequest.approver && (
                <div style={{ gridColumn: "1 / 2" }}>
                  <b>Approved By:</b> {viewRequest.approver?.name || "N/A"}
                  <br />
                  <small style={{ color: "#666", marginLeft: "10px" }}>
                    Department:{" "}
                    {viewRequest.approver?.department?.name || "N/A"} | Role:{" "}
                    {viewRequest.approver?.role || "N/A"}
                  </small>
                </div>
              )}

              {/* Assignment Information */}
              {viewRequest.assigner && (
                <div style={{ gridColumn: "2 / 3" }}>
                  <b>Assigned By:</b> {viewRequest.assigner?.name || "N/A"}
                  <br />
                  <small style={{ color: "#666", marginLeft: "10px" }}>
                    Department:{" "}
                    {viewRequest.assigner?.department?.name || "N/A"} | Role:{" "}
                    {viewRequest.assigner?.role || "N/A"}
                  </small>
                </div>
              )}
              {/* merged by */}
              {viewRequest.mergedBy && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <b>Merged By:</b> {viewRequest.mergedBy?.name || "N/A"}
                  <br />
                  <small style={{ color: "#666", marginLeft: "10px" }}>
                    Department:{" "}
                    {viewRequest.mergedBy?.department?.name || "N/A"} | Role:{" "}
                    {viewRequest.mergedBy?.role || "N/A"}
                  </small>
                </div>
              )}

              {/* Rejection Information */}
              {viewRequest.rejecter && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <b>Rejected By:</b> {viewRequest.rejecter?.name || "N/A"}
                  <br />
                  <small style={{ color: "#666", marginLeft: "10px" }}>
                    Department:{" "}
                    {viewRequest.rejecter?.department?.name || "N/A"} | Role:{" "}
                    {viewRequest.rejecter?.role || "N/A"}
                  </small>
                </div>
              )}

              {/* Rejection Reason */}
              {viewRequest.rejectionReason && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <b>Rejection Reason:</b>
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "12px",
                      background: "#fff5f5",
                      borderRadius: "6px",
                      border: "1px solid #fed7d7",
                      color: "#c53030",
                    }}
                  >
                    {viewRequest.rejectionReason}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="cancel-btn"
                onClick={() => setViewRequest(null)}
                style={{ background: "#6c757d" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* mergeing with */}
      {mergeModalOpen && (
        <div className="modal-bg">
          <div
            className="merge-modal"
            style={{
              width: "700px", // or 500px, or whatever size you prefer
              margin: "50px auto", // to center horizontally
              background: "#fff",
              borderRadius: "8px",
              padding: "24px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
            }}
          >
            <div className="modal-header">
              <h2>Merge Requests</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setMergeModalOpen(false);
                  setMergeBaseRequest(null);
                }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                Select the requests you want to merge with{" "}
                <strong>{mergeBaseRequest?.id || "N/A"}</strong>.
              </p>
              <table
                className="merge-requests-table"
                style={{
                  width: "100%",
                  background: "#fafafa",
                  borderRadius: "6px",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}></th>
                    <th>ID</th>
                    <th>Requester</th>
                    <th>Destination</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {requests
                    .filter(
                      (req) =>
                        req.status === 1 && req.id !== mergeBaseRequest?.id
                    )
                    .map((req) => (
                      <tr
                        key={req.id}
                        style={{ borderBottom: "1px solid #eee" }}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedMergeRequests.includes(req.id)}
                            onChange={() => handleMergeCheckbox(req.id)}
                            style={{ accentColor: "#007bff" }}
                          />
                        </td>
                        <td>{req.id}</td>
                        <td>{req.requester.name}</td>
                        <td>{req.destination}</td>
                        <td>{req.purpose || "N/A"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div
              className="modal-footer"
              style={{ display: "flex", gap: "10px" }}
            >
              <button
                className="cancel-btn"
                style={{
                  background: "white",
                  border: "1px solid #ccc",
                  color: "#333",
                }}
                onClick={() => {
                  setMergeModalOpen(false);
                  setMergeBaseRequest(null);
                  setSelectedMergeRequests([]);
                }}
              >
                Cancel
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setMergeModalOpen(false);
                  mergingRequests();
                }}
              >
                Merge
              </button>
            </div>
          </div>
        </div>
      )}

      {assigningRequest && (
        <div className="modal-bg">
          <div className="vehicle-assign-modal">
            <div className="modal-header">
              <h2>Assign Vehicles to Request</h2>
              <button
                className="modal-close"
                onClick={() => setAssigningRequest(null)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="request-info-section">
                <div className="info-card">
                  {/* <div className="info-row">
                    <span className="info-label">Request ID:</span>
                    <span className="info-value">{assigningRequest.id}</span>
                  </div> */}
                  <div className="info-row">
                    <span className="info-label">Requester:</span>
                    <span className="info-value">
                      {assigningRequest.requester.name}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Department:</span>
                    <span className="info-value">
                      {assigningRequest.requester.department?.name || "N/A"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Destination:</span>
                    <span className="info-value">
                      {assigningRequest.destination}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Total Travelers:</span>
                    <span className="info-value">
                      {assigningRequest.travelerNames?.length ||
                        assigningRequest.travelers?.length ||
                        0}{" "}
                      travelers
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Trip Type:</span>
                    <span className="info-value">
                      {formatTripType(assigningRequest.tripType)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Purpose:</span>
                    <span className="info-value">
                      {assigningRequest.purpose || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="vehicle-selection-section">
                <div className="section-header">
                  <h3>Available Vehicles</h3>
                  <span className="selection-count">
                    {selectedVehicles.length} vehicle
                    {selectedVehicles.length !== 1 ? "s" : ""} selected
                  </span>
                </div>

                <div className="vehicle-search-container">
                  <div className="search-input-wrapper">
                    <i className="search-icon">🔍</i>
                    <input
                      type="text"
                      className="vehicle-search-input"
                      placeholder="Search by model, plate number, or seat capacity..."
                      value={vehicleSearch}
                      onChange={(e) => setVehicleSearch(e.target.value)}
                    />
                    {vehicleSearch && (
                      <button
                        className="clear-search-btn"
                        onClick={() => setVehicleSearch("")}
                        title="Clear search"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div className="search-stats">
                    {getFilteredVehicles().length} vehicle
                    {getFilteredVehicles().length !== 1 ? "s" : ""} found
                  </div>
                </div>

                <div className="vehicle-grid">
                  {getFilteredVehicles().map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className={`vehicle-card ${
                        selectedVehicles.includes(vehicle.id.toString())
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleVehicleSelection(vehicle.id.toString())
                      }
                    >
                      <div className="vehicle-image">
                        {vehicle.imageUrl ? (
                          <img
                            src={getFullImageUrl(vehicle.imageUrl)}
                            alt={`${vehicle.model} - ${vehicle.plateNumber}`}
                            onError={(e) => {
                              e.target.src = "/default-vehicle.png";
                              e.target.onerror = null;
                            }}
                          />
                        ) : (
                          <div className="no-image">No Image Available</div>
                        )}
                      </div>
                      <div className="vehicle-details">
                        <h4>{vehicle.model}</h4>
                        <p className="plate-number">{vehicle.plateNumber}</p>
                        <div className="vehicle-specs">
                          <span className="seat-capacity">
                            <i className="seat-icon">💺</i>{" "}
                            {vehicle.seatCapa || "N/A"} seats
                          </span>
                        </div>
                      </div>
                      <div className="selection-indicator">
                        {selectedVehicles.includes(vehicle.id.toString()) && (
                          <span className="checkmark">✓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {getFilteredVehicles().length === 0 && (
                  <div className="no-vehicles-found">
                    <i className="no-results-icon">🚗</i>
                    <p>No vehicles found matching your search</p>
                    {vehicleSearch && (
                      <button
                        className="clear-search-link"
                        onClick={() => setVehicleSearch("")}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}

                <div className="select-help-text">
                  <i className="help-icon">ℹ️</i>
                  <span>Click on vehicles to select/deselect them</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={handleAssignVehicle}
                disabled={selectedVehicles.length === 0 || isAssigning}
                className="submit-btn"
                style={{ position: "relative", minWidth: "200px" }}
              >
                {isAssigning ? (
                  <>
                    <CircularProgress
                      size={24}
                      sx={{
                        color: "white",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        marginTop: "-12px",
                        marginLeft: "-12px",
                      }}
                    />
                    <span style={{ visibility: "hidden" }}>
                      Assign Selected Vehicles
                    </span>
                  </>
                ) : (
                  "Assign Selected Vehicles"
                )}
              </button>
              <button
                onClick={() => setAssigningRequest(null)}
                className="cancel-btn"
                disabled={isAssigning}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    {/* Reject Modal */}
    {showRejectModal && (
      <div className="modal-bg">
        <div className="modal-card">
          <button
            className="modal-close"
            onClick={() => {
              setShowRejectModal(false);
              setRequestToReject(null);
              setRejectReason("");
              setError(null);
            }}
          >
            &times;
          </button>
          <h2>Reject Request rrr</h2>
          {error && <div className="error-message">{error}</div>}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleLogisticsHeadReject();
            }}
            className="rejection-form"
          >
            <div className="form-row">
              <label>Request Details:</label>
              <div className="request-details">
                <p>
                  <strong>Requester:</strong> {requestToReject?.requester?.name}
                </p>
                <p>
                  <strong>Department:</strong> {requestToReject?.requester?.department?.name}
                </p>
                <p>
                  <strong>Trip Type:</strong> {requestToReject?.tripType}
                </p>
                <p>
                  <strong>Destination:</strong> {requestToReject?.destination}
                </p>
                <p>
                  <strong>Purpose:</strong> {requestToReject?.purpose}
                </p>
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="rejectReason">Reason for Rejection:</label>
              <textarea
                id="rejectReason"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                required
                placeholder="Please provide a detailed reason for rejecting this request"
                rows="4"
                minLength={10}
              />
              <small className="form-help-text">
                Please provide a clear and specific reason for rejection (minimum 10 characters).
              </small>
            </div>
            <div className="form-actions">
              <button
                type="submit"
                disabled={!rejectReason.trim() || rejectReason.trim().length < 10}
                className={
                  !rejectReason.trim() || rejectReason.trim().length < 10
                    ? "disabled"
                    : ""
                }
              >
                Confirm Rejection
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRequestToReject(null);
                  setRejectReason("");
                  setError(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
  );
};

export default TransportRequests;
// Add this function near the other helper functions
const formatDate = (iso) => {
  if (!iso) return "Not set";
  return new Date(iso).toLocaleString();
};

// --- XLSX export utilities for transport requests (filtered export) ---
function exportRequestsXLSX(requests) {
  if (!Array.isArray(requests) || requests.length === 0) {
    alert('No requests to export');
    return;
  }

  const rows = requests.map(r => normalizeRequestForExport(r));
  const worksheet = XLSX.utils.json_to_sheet(rows, { skipHeader: false });
  markDateCellsAsDates(worksheet, rows, ['startTime', 'endTime', 'requestTime', 'createdAt', 'updatedAt']);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Requests');
  XLSX.writeFile(workbook, `transport_requests_${new Date().toISOString().slice(0,10)}.xlsx`);
}

function normalizeRequestForExport(r) {
  const start = r.startTime || r.start_time || '';
  const end = r.endTime || r.end_time || '';
  const reqTime = r.requestTime || r.request_time || r.createdAt || r.created_at || '';
  console.log('Normalizing request for export:', r);
  return {
    id: r.id,
    requester: r.requester?.name || '',
    department: r.requester?.department?.name || '',
    destination: r.destination || '',
    purpose: r.purpose || '',
    tripType: r.tripType || '',
    status: getStatusText(r.status),
    startTime: start,
    endTime: end,
    requestTime: reqTime,
    // travelers: (r.travelerNames || r.travelers || []).map(t => (typeof t === 'string' ? t : (t.name || ''))).join('; '),
    // vehicles: (r.vehicles || []).map(v => v.plateNumber || v.plate_number || v.id).join('; '),
    // createdAt: r.createdAt || r.created_at || '',
    // updatedAt: r.updatedAt || r.updated_at || ''
    rejectionReason: r.reasonOfRejection || '',
  };
}

function markDateCellsAsDates(worksheet, rows, dateKeys) {
  if (!worksheet || !rows || rows.length === 0) return;
  const header = Object.keys(rows[0]);
  dateKeys.forEach(key => {
    const colIndex = header.indexOf(key);
    if (colIndex === -1) return;
    for (let r = 0; r < rows.length; r++) {
      const cellAddress = XLSX.utils.encode_cell({ c: colIndex, r: r + 1 });
      const cell = worksheet[cellAddress];
      if (!cell) continue;
      if (cell.v && !(cell.v instanceof Date)) {
        const parsed = new Date(cell.v);
        if (!isNaN(parsed)) {
          cell.t = 'd';
          cell.v = parsed;
          cell.z = 'yyyy-mm-dd HH:MM:SS';
        }
      } else if (cell.v instanceof Date) {
        cell.t = 'd';
        cell.z = 'yyyy-mm-dd HH:MM:SS';
      }
    }
  });
}
