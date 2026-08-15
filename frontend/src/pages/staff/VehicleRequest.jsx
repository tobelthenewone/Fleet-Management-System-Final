import React, { useState, useEffect } from "react";
import StaffNavigationBar from "./StaffNavigationBar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import "./Staff.css";
import api from "../../api/axios";
import TripType from "../../enums/TripType"; // Assuming you have a TripType constant defined

import axios from "axios";
import RequestStatus from "../../enums/requestStatus";
import DepartmentLocation from "../../enums/DepartmentLocation";
import role from "../../enums/role";
import tripType from "../../enums/TripType";

/**
 * VehicleRequest component for staff users (employees, department heads, directors).
 *
 * Allows users to create, edit, view, approve, reject, and filter vehicle requests.
 * Handles traveler selection, trip type validation, and displays requests in a table with modals for details and actions.
 */
function VehicleRequest() {
  const [requests, setRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewRequest, setViewRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTravelerPicker, setShowTravelerPicker] = useState(false);
  const [users, setUsers] = useState([]);
  // Add state variables for rejection functionality
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [requestToReject, setRequestToReject] = useState(null);
  const [form, setForm] = useState({
    destination: "",
    purpose: "",
    startTime: "",
    endTime: "",
    travelers: [], // list of selected user IDs
    tripType: "", // Added tripType
  });
  const [editingRequest, setEditingRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all"); // Add status filter state
  const [userRole, setUserRole] = useState("");
  // const [userId, setUserId] = useState('');
  const [travelerSearchTerm, setTravelerSearchTerm] = useState("");
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users first to get the current user's ID
        await fetchUsers();
        // Now fetch requests and other data
        await fetchRequests();
        await fetchVehicles();
      } catch (err) {
        setError(err.message);
      }
    };

    // Get the user role from localStorage
    const role = localStorage.getItem("role");
    setUserRole(role);

    fetchData();
  }, []);

  // This effect runs when 'editingRequest' changes
  useEffect(() => {
    if (editingRequest) {
      const formatDateTimeLocal = (isoString) => {
        if (!isoString) return "";
        try {
          const date = new Date(isoString);
          // Adjust for local timezone
          const timezoneOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
          const localDate = new Date(date.getTime() - timezoneOffset);
          return localDate.toISOString().slice(0, 16);
        } catch (e) {
          return ""; // Fallback for invalid date
        }
      };

      setForm({
        destination: editingRequest.destination || "",
        purpose: editingRequest.purpose || "",
        startTime: formatDateTimeLocal(editingRequest.startTime),
        endTime: formatDateTimeLocal(editingRequest.endTime),
        // Assuming editingRequest.travelers is an array of user objects with an 'id' property.
        // If your backend sends traveler IDs directly in editingRequest.travelerIds or similar, adjust accordingly.
        travelers:
          editingRequest.travelers && Array.isArray(editingRequest.travelers)
            ? editingRequest.travelers
                .map((t) => (typeof t === "object" && t !== null ? t.id : t))
                .filter((id) => id !== undefined)
            : editingRequest.travelerIds || [],
        tripType: editingRequest.tripType || "",
      });
      // Log the values being set to the form state
      const formattedStartTime = formatDateTimeLocal(editingRequest.startTime);
      const formattedEndTime = formatDateTimeLocal(editingRequest.endTime);
      const processedTravelers =
        editingRequest.travelers && Array.isArray(editingRequest.travelers)
          ? editingRequest.travelers
              .map((t) => (typeof t === "object" && t !== null ? t.id : t))
              .filter((id) => id !== undefined)
          : editingRequest.travelerIds || [];
      setShowForm(true); // Show the form modal
      setError(null); // Clear any previous errors
    } else {
      // Reset form when not editing (e.g., after submit or cancel)
      // This ensures the form is clear when opening for a new request
      setForm({
        destination: "",
        purpose: "",
        startTime: "",
        endTime: "",
        travelers: [],
        tripType: "",
      });
    }
  }, [editingRequest, setForm]);

  const fetchRequests = async () => {
    try {
      // Get the user's role from localStorage
      const userRole = localStorage.getItem("role");
      // Department heads and directors see requests from their department
      if ((userRole === role.DEPARTMENT_HEAD || userRole === role.DIRECTOR || userRole === role.LOGISTICS_HEAD)) {
        var departmentRequests = await api.get(
          `/requests/department/${localStorage.getItem("username")}`
        );
        setRequests(departmentRequests.data);
        filteredRequests = departmentRequests.data;
      } else {
        // Regular staff only see their own requests
        const username = localStorage.getItem("username");
        const response = await api.post(`/requests/own`, { username });
        if (response.status !== 200) {
          throw new Error("Failed to fetch requests");
        }
        console.log("username=", localStorage.getItem("username"));

        setRequests(response.data);
        filteredRequests = response.data;
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(err.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      if (response.status !== 200) throw new Error("Failed to fetch users");
      setUsers(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get("/vehicles");
      if (response.status !== 200) throw new Error("Failed to fetch vehicles");
      setVehicles(response.data);
    } catch (err) {
      setError(err.message);
    }
  };
  const getCoordinatesFromLocation = async (locationName) => {
    try {
      if (!locationName) {
        console.error("No location name provided for geocoding");
        return null;
      }
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: locationName,
            format: "json",
          },
          headers: {
            "Accept-Language": "en",
            "User-Agent": "FleetManagement@zemenbank",
          },
        }
      );

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return { lat: parseFloat(lat), lon: parseFloat(lon) };
      } else {
        throw new Error("Location not found.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // --- Validation Start ---
    if (!form.tripType) {
      setError("Please select a trip type.");
      setLoading(false);
      return;
    }

    const now = new Date();
    const startTime = new Date(form.startTime);
    const endTime = new Date(form.endTime);

    if (isNaN(startTime.getTime())) {
      setError("Invalid start date/time format.");
      setLoading(false);
      return;
    }

    if (isNaN(endTime.getTime())) {
      setError("Invalid end date/time format.");
      setLoading(false);
      return;
    }

    let minStartTime;

    if (form.tripType === TripType.FIELD_TRIP) {
      minStartTime = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      if (startTime < minStartTime) {
        setError(
          "For Field Trips, start time must be at least 48 hours in advance."
        );
        setLoading(false);
        return;
      }
    } else if (
        form.tripType === TripType.CITY_TRIP||
        form.tripType === TripType.NIGHT_SHIFT ||
        form.tripType === TripType.SHUTTLE_SHIFT ||
        form.tripType === TripType.OUTLET) {
          minStartTime = new Date(now.getTime() + 12 * 60 * 60 * 1000);
          if (startTime < minStartTime) {
            setError(
              "For City Trips, Night, or Shuttle Trips, start time must be at least 12 hours in advance."
            );
            setLoading(false);
            return;
          }
    } else if (
      form.tripType === TripType.EMERGENCY_TRIP 
    ) {
      if (startTime < now) {
        // Allow a small buffer for current time selection, e.g., a few minutes
        const buffer = 5 * 60 * 1000; // 5 minutes
        if (startTime.getTime() < now.getTime() - buffer) {
          setError(
            "For Emergency start time cannot be in the past."
          );
          setLoading(false);
          return;
        }
      }
    }

    if (endTime <= startTime) {
      setError("End time must be after start time.");
      setLoading(false);
      return;
    }
    // --- Validation End ---

    try {
      //  get coordinates from destination
      // const coordinates = await getCoordinatesFromLocation(form.destination);
      // if (!coordinates) {
      //   // throw new Error("Failed to get coordinates for the destination");
      // }
      const requestData = {
        destination: form.destination,
        // latitude: coordinates?.lat,
        // longitude: coordinates?.lon,
        purpose: form.purpose,
        startTime: new Date(form.startTime),
        endTime: new Date(form.endTime),
        status: 0,
        travelerIds: [...form.travelers],
        tripType: form.tripType, // Added tripType
        // cordinates: form.coordinates,
      };

      let response;

      if (editingRequest) {
        console.log("--- Debug Submit (Edit Mode) ---");
        console.log("Form state at submit:", JSON.parse(JSON.stringify(form)));
        console.log(
          "RequestData to be sent:",
          JSON.parse(JSON.stringify(requestData))
        );
        console.log("--- End Debug Submit (Edit Mode) ---");
        // Edit mode → PUT or PATCH
        response = await api.put(`/requests/${editingRequest.id}`, requestData);
      } else {
        /**
         * Before creating a new request, check if the user has any existing requests with status not completed
         * If so, show an error message and prevent submission.
         */
        const existingRequests = requests.filter(
          (req) => ((req.status !== RequestStatus.TRIP_COMPLETED && req.status !== RequestStatus.REJECTED) && req.requester.username === localStorage.getItem("username"))
        );
        if (existingRequests.length > 0) {
          setError("You have already an existing request that are not completed nor rejected.");
          setLoading(false);
          return;
        }

        // Create mode → POST
        response = await api.post("/requests", requestData);
      }

      if (response.status !== 200) {
        throw new Error(
          editingRequest
            ? "Failed to update request"
            : "Failed to create request"
        );
      }

      await fetchRequests();

      setShowForm(false);
      setEditingRequest(null); // clear edit mode
      setForm({
        vehicle_id: "",
        destination: "",
        purpose: "",
        startTime: "",
        endTime: "",
        status: 0,
        travelers: [],
        tripType: "", // Reset tripType
      });
    } catch (err) {
      console.error("Error details:", err);
      setError(err.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
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
        return "Ready for Pickup";
      case 5:
        return "In Trip";
      case 6:
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const handleDelete = async (id) => {
    // if (!window.confirm("Are you sure you want to delete this request?"))
      // return;
    try {
      await api.delete(`/requests/${id}`);
    } catch (err) {
      setError("Failed to delete request.");
    }
    finally {
      await fetchRequests();
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.get(`/requests/${id}/department/approve`);
    } catch (err) {
      setError("Failed to approve request.");
    }
    finally{
      fetchRequests();
    }
  };

  // Update the handleReject function
  const handleReject = async () => {
    if (!requestToReject || !rejectReason.trim()) return;

    try {
      // Send rejection with reason
      await api.post(`/requests/${requestToReject.id}/reject`, {
        reason: rejectReason.trim(),
      });

      // Clear the rejection form and state


      // Refresh the requests list
      await fetchRequests();

      // Show success message
      setError(null);
    } catch (err) {
      console.error("Error rejecting request:", err);
      setError("Failed to reject request. Please try again.");
    }
    finally {
      await fetchRequests();
      setShowRejectForm(false);
      setRejectReason("");
      setRequestToReject(null);
    }
  };

  const handleEdit = (request) => {
    // Clear any previous errors and set the request to be edited.
    // The useEffect hook listening to 'editingRequest' will populate the form and show it.
    setError(null);
    setEditingRequest(request);
  };

  // New function to handle reverting an approved request back to pending
  const handleRevertToPending = async (id) => {
    // if (
    //   !window.confirm(
    //     "Are you sure you want to revert this request to pending status?"
    //   )
    // )
      return;
    try {
      // This endpoint would need to be implemented on the backend
      await api.get(`/requests/${id}/revert-to-pending`);
      fetchRequests();
    } catch (err) {
      setError("Failed to revert request to pending status.");
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleString();

  // Filter requests by status and sort by newest first
  let filteredRequests = requests
    .filter((r) => {
      return statusFilter === "all" || r.status.toString() === statusFilter;
    })
    // Sort by ID in descending order (assuming higher IDs are newer)
    .sort((a, b) => b.id - a.id);

  // Alternatively, if you have a createdAt or timestamp field:
  // .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Get counts for each status
  const statusCounts = {
    all: requests.length,
    0: requests.filter((r) => r.status === 0).length,
    1: requests.filter((r) => r.status === 1).length,
    2: requests.filter((r) => r.status === 2).length,
    3: requests.filter((r) => r.status === 3).length,
    5: requests.filter((r) => r.status === 5).length,
    6: requests.filter((r) => r.status === 6).length,
  };

  // Check if user is a department head or admin
  const isDepartmentHead =
    userRole === role.DEPARTMENT_HEAD || userRole === role.DIRECTOR|| userRole === role.LOGISTICS_HEAD;
  const isAdmin = userRole === role.ADMIN;

  // Check if the request belongs to the current user
  const isRequestOwner = (request) => {
    return request.requester.username == localStorage.getItem("username");
  };

  // Helper function to get user name by ID
  const getUserNameById = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : `Unknown (ID: ${userId})`;
  };

  // Helper function to get user department by ID
  const getUserDepartmentById = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user && user.department ? user.department : "N/A";
  };


  // Add this function to get unique departments from users
  const getUniqueDepartments = () => {
    const departments = users
      .filter((user) => user.department && user.department.name)
      .map((user) => user.department)
      .filter(
        (dept, index, self) => index === self.findIndex((d) => d.id === dept.id)
      );
    return departments;
  };

  // Add this function to filter users based on search and department
  const getFilteredTravelersUsers = () => {
    return users.filter((user) => {
      // Search filter
      const matchesSearch =
        !travelerSearchTerm ||
        user.name.toLowerCase().includes(travelerSearchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(travelerSearchTerm.toLowerCase());

      // Department filter
      const matchesDepartment =
        !selectedDepartmentFilter ||
        (user.department &&
          user.department.id.toString() === selectedDepartmentFilter);

      return matchesSearch && matchesDepartment;
    });
  };

  // Reset filters when opening traveler picker
  const openTravelerPicker = () => {
    setTravelerSearchTerm("");
    setSelectedDepartmentFilter("");
    setShowTravelerPicker(true);
  };


  // Add this helper function to check if user can approve based on role and trip type
  const canApproveRequest = (request) => {
    const userRole = localStorage.getItem("role");

    // Director can approve any request
    if (userRole === role.DIRECTOR|| userRole === role.LOGISTICS_HEAD) {
      return true;
    }

    // Department Head can only approve CITY_TRIP, EMERGENCY_TRIP, NIGHT_SHIFT, and SHUTTLE_SHIFT
    if (userRole === role.DEPARTMENT_HEAD ) {
      return (
        request.tripType === tripType.CITY_TRIP ||
        request.tripType === tripType.NIGHT_SHIFT ||
        request.tripType === tripType.SHUTTLE_SHIFT 
      );
    }

    return false;
  };

  // Add this helper function to get approval message
  const getApprovalMessage = (request) => {
    const userRole = localStorage.getItem("role");

    if (userRole === role.DIRECTOR || userRole === role.LOGISTICS_HEAD) {
      return "Approve";
    }

    if (userRole === role.DEPARTMENT_HEAD|| userRole === role.LOGISTICS_HEAD) {
      if (request.tripType === tripType.FIELD_TRIP) {
        return "Pending Director Approval";
      }
      return "Approve";
    }

    return "";
  };

  // Add a function to check if request needs director approval
  const needsDirectorApproval = (request) => {
    return (request.tripType === tripType.FIELD_TRIP||request.tripType === tripType.EMERGENCY_TRIP) && userRole === role.DEPARTMENT_HEAD;
  };

  return (
    <div
      className="staff-dashboard-layout"
      style={{ marginTop: 0, paddingTop: 0 }}
    >
      <StaffNavigationBar />
      <main
        className="staff-dashboard-main"
        style={{ marginTop: 0, paddingTop: 12 }}
      >
        <div
          style={{
            position: "relative",
            minHeight: 0,
            marginTop: 0,
            paddingTop: 0,
          }}
        >
          <button
            className="add-btn small"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              // background: "linear-gradient(90deg,#6366f1,#ff0000)",
              // color: "#fff",
              background: "white",
              color: "#000",

              border: "1px solid #6366f1",
              borderRadius: 8,
              padding: "8px 24px",
              fontWeight: 600,
              fontSize: 24,
              boxShadow: "0 2px 8px rgba(99,102,241,0.08)",
              marginBottom: "20px",
              cursor: "pointer",
              transition: "background 0.2s",
              zIndex: 2,
            }}
            onClick={() => {
              setError(null);
              setShowForm(true);
            }}
          >
            + New Request
          </button>
        </div>
        {/* <div
          className="dashboard-header"
          style={{ marginTop: 0, paddingTop: 0 }}
        >
          {userRole === "DEPARTMENT_HEAD" && (
            <div className="department-head-badge">Department Head</div>
          )}
          {userRole === "DIRECTOR" && (
            <div className="department-head-badge">Director</div>
          )}
          {isAdmin && <div className="admin-badge">Administrator</div>}
        </div> */}
        {/* Error message moved into the form modal */}

        {/* Status filter buttons */}
        <div className="staff-request-status-filters">
          <button
            className={`staff-request-status-btn ${
              statusFilter === "all" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("all")}
          >
            All Requests ({statusCounts.all})
          </button>
          <button
            className={`staff-request-status-btn pending ${
              statusFilter === "0" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("0")}
          >
            Pending ({statusCounts["0"]})
          </button>
          <button
            className={`staff-request-status-btn approved ${
              statusFilter === "1" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("1")}
          >
            Approved ({statusCounts["1"]})
          </button>
          <button
            className={`staff-request-status-btn rejected ${
              statusFilter === "2" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("2")}
          >
            Rejected ({statusCounts["2"]})
          </button>
          <button
            className={`staff-request-status-btn assigned ${
              statusFilter === "3" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("3")}
          >
            Assigned ({statusCounts["3"]})
          </button>
          <button
            className={`staff-request-status-btn in-progress ${
              statusFilter === "5" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("5")}
          >
            In Trip ({statusCounts["5"]})
          </button>
          <button
            className={`staff-request-status-btn completed ${
              statusFilter === "6" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("6")}
          >
           Trip Completed ({statusCounts["6"]})
          </button>
        </div>

        <table className="vehicles-table">
          <thead>
            <tr>
              <th>No.</th>
              {/* <th>Requester</th> */}
              {/* <th>Department</th> */}
              <th>Trip Type</th>
              <th>Destination</th>
              <th>Purpose</th>
              {/* <th>Start Time</th> */}
              {/* <th>End Time</th> */}
              {/* <th>Vehicle</th> */}
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((r,index) => (
              <tr key={r.id}>
                <td>{index+1}</td>
                {/* <td>{r.requester?.name || "N/A"}</td> */}
                {/* <td>{r.requester?.department?.name || "N/A"}</td> */}
                <td>{r.tripType}</td>
                <td>{r.destination}</td>
                <td>{r.purpose}</td>
                {/* <td>{formatDate(r.startTime)}</td> */}
                {/* <td>{formatDate(r.endTime)}</td> */}
                {/* <td>
                  {r.vehicles && r.vehicles.length > 0 ? (
                    <div>
                      {r.vehicles.map((vehicle, index) => (
                        <div
                          key={vehicle.id}
                          style={{
                            marginBottom:
                              index < r.vehicles.length - 1 ? "4px" : 0,
                          }}
                        >
                          {vehicle.plateNumber}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: "red", fontWeight: "bold" }}>
                      Not Assigned
                    </span>
                  )}
                </td> */}
                <td>
                  <span
                    className={`staff-request-status-badge status-${r.status}`}
                  >
                    {getStatusText(r.status)}
                  </span>
                </td>
                <td>
                  <button
                    className="action-btn view"
                    onClick={() => setViewRequest(r)}
                  >
                    View
                  </button>

                  {/* Show Edit and Delete only for Pending requests that belong to the current user */}
                  {r.status === 0 &&
                    isRequestOwner(r) &&
                    !needsDirectorApproval(r) && (
                      <>
                        <button
                          className="action-btn edit"
                          onClick={() => handleEdit(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(r.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}

                  {/* Show Revert button only for Approved requests that belong to the current user */}
                  {r.status === 1 &&
                    isRequestOwner(r) &&
                    !needsDirectorApproval(r) && (
                      <button
                        className="action-btn revert"
                        onClick={() => handleRevertToPending(r.id)}
                      >
                        Revert
                      </button>
                    )}

                  {/* Show Approve button based on role and trip type */}
                  {isDepartmentHead &&
                    r.status === 0 &&
                    !needsDirectorApproval(r) && (
                      <button
                        className={`action-btn ${
                          canApproveRequest(r) ? "approve" : "disabled"
                        }`}
                        onClick={() =>
                          canApproveRequest(r) ? handleApprove(r.id) : null
                        }
                        disabled={!canApproveRequest(r)}
                        // title={getApprovalMessage(r)}
                      >
                        {getApprovalMessage(r)}
                      </button>
                    )}
                    {
                      isDepartmentHead && r.status === 1 && r.department === DepartmentLocation.OUTLET && (
                        <button
                          className="action-btn approve"
                          onClick={() => handleApprove(r.id)}
                        >
                          Assign Vehicle
                        </button>
                      )
                    }

                  {/* Show Reject button for both Department Head and Director, except for field trips for department head */}
                  {isDepartmentHead &&
                    r.status === 0 &&
                    !needsDirectorApproval(r) && (
                      <button
                        className="action-btn reject"
                        onClick={() => {
                          setRequestToReject(r);
                          setShowRejectForm(true);
                        }}
                      >
                        Reject
                      </button>
                    )}

                  {/* Show Director Approval message for field trips when viewed by department head */}
                  {/* {needsDirectorApproval(r) && r.status === 0 && (
                    <span className="director-approval-message">
                      {getApprovalMessage(r)}
                    </span>
                  )} */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {showForm && (
        <div className="modal-bg">
          <div className="modal-card fit-form">
            <button
              className="modal-close"
              onClick={() => {
                setShowForm(false);
                setEditingRequest(null);
                setError(null); // Clear error when closing form
              }}
            >
              &times;
            </button>
            <h2>
              {editingRequest ? "Edit Vehicle Request" : "New Vehicle Request"}
            </h2>
            {error && (
              <div
                className="error-message"
                style={{ marginBottom: "20px", marginTop: "-10px" }}
              >
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="request-grid-form">
              <div className="form-grid-row">
                <div className="form-row">
                  <label htmlFor="tripType">Trip Type:</label>
                  <select
                    id="tripType"
                    name="tripType"
                    value={form.tripType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Trip Type</option>
                    <option value={TripType.CITY_TRIP}>City Trip</option>
                    <option value={TripType.FIELD_TRIP}>Field Trip</option>
                    <option value={TripType.EMERGENCY_TRIP}>Emergency Trip</option>
                    <option value={TripType.OUTLET}>Outlet Branches</option>
                    <option value={TripType.NIGHT_SHIFT}>Night Shift</option>
                    <option value={TripType.SHUTTLE_SHIFT}>Shuttle Shift</option>

                  </select>
                </div>
                <div className="form-row">
                  <label htmlFor="destination">Destination:</label>
                  <input
                    id="destination"
                    name="destination"
                    value={form.destination}
                    onChange={handleChange}
                    required
                    placeholder="Enter destination"
                  />
                </div>
              </div>

              <div className="form-row">
                <label htmlFor="purpose">Purpose:</label>
                <textarea
                  id="purpose"
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  required
                  placeholder="Enter purpose and description for the request"
                  rows="3"
                />
              </div>

              {/* <div className="form-grid-row">
                <div className="form-row">
                  <label htmlFor="startTime">Start Time:</label>
                  <input
                    id="startTime"
                    type="datetime-local"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="endTime">End Time:</label>
                  <input
                    id="endTime"
                    type="datetime-local"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div> */}
              <div className="form-grid-row">
                <div className="form-row">
                  <label htmlFor="startTime">Start Time:</label>
                  <DatePicker
                    id="startTime"
                    selected={form.startTime ? new Date(form.startTime) : null}
                    onChange={(date) =>
                      setForm((prev) => ({ ...prev, startTime: date }))
                    }
                    showTimeSelect
                    dateFormat="Pp"
                    className="custom-datepicker"
                    placeholderText="Select start time"
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="endTime">End Time:</label>
                  <DatePicker
                    id="endTime"
                    selected={form.endTime ? new Date(form.endTime) : null}
                    onChange={(date) =>
                      setForm((prev) => ({ ...prev, endTime: date }))
                    }
                    showTimeSelect
                    dateFormat="Pp"
                    className="custom-datepicker"
                    placeholderText="Select end time"
                  />
                </div>
              </div>

              <div className="form-row">
                <label>Travelers:</label>
                <button
                  type="button"
                  className="action-btn select-travelers-btn"
                  onClick={openTravelerPicker}
                  style={{ width: "auto", marginBottom: "10px" }}
                >
                  Select Travelers ({form.travelers.length} selected)
                </button>
                {form.travelers.length > 0 && (
                  <div className="selected-travelers">
                    <strong>Selected Travelers:</strong>
                    <ul>
                      {users
                        .filter((user) => form.travelers.includes(user.id))
                        .map((user) => (
                          <li key={user.id}>
                            {user.name} -{" "}
                            {user.department?.name || "No Department"}
                            <button
                              type="button"
                              className="remove-traveler-btn"
                              onClick={() => {
                                const updated = form.travelers.filter(
                                  (id) => id !== user.id
                                );
                                setForm((prev) => ({
                                  ...prev,
                                  travelers: updated,
                                }));
                              }}
                            >
                              &times;
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading
                    ? "Submitting..."
                    : editingRequest
                    ? "Update"
                    : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRequest(null);
                    setError(null); // Clear error when closing form
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTravelerPicker && (
        <div className="modal-bg">
          <div className="modal-card large-modal">
            <button
              className="modal-close"
              onClick={() => setShowTravelerPicker(false)}
            >
              &times;
            </button>
            <h3>Select Travelers</h3>

            {/* Search and Filter Controls */}
            <div className="traveler-filters">
              <div className="filter-row">
                <div className="search-container">
                  <label>Search Users:</label>
                  <input
                    type="text"
                    placeholder="Search by name or username..."
                    value={travelerSearchTerm}
                    onChange={(e) => setTravelerSearchTerm(e.target.value)}
                    className="traveler-search-input"
                  />
                </div>

                <div className="department-filter-container">
                  <label>Filter by Department:</label>
                  <select
                    value={selectedDepartmentFilter}
                    onChange={(e) =>
                      setSelectedDepartmentFilter(e.target.value)
                    }
                    className="department-filter-select"
                  >
                    <option value="">All Departments</option>
                    {getUniqueDepartments().map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-actions">
                  <button
                    type="button"
                    className="clear-filters-btn"
                    onClick={() => {
                      setTravelerSearchTerm("");
                      setSelectedDepartmentFilter("");
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Results Summary */}
              <div className="results-summary">
                {travelerSearchTerm || selectedDepartmentFilter ? (
                  <>
                    Showing {getFilteredTravelersUsers().length} of{" "}
                    {users.length} users
                  </>
                ) : (
                  <>Use search or department filter to view users</>
                )}
                {form.travelers.length > 0 &&
                  ` | ${form.travelers.length} selected`}
              </div>
            </div>

            {/* Users Table - Only show when there's a filter applied */}
            {travelerSearchTerm || selectedDepartmentFilter ? (
              <div className="travelers-table-container">
                <table className="travelers-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            const filteredUsers = getFilteredTravelersUsers();
                            if (e.target.checked) {
                              const allFilteredIds = filteredUsers.map(
                                (user) => user.id
                              );
                              const updatedTravelers = [
                                ...new Set([
                                  ...form.travelers,
                                  ...allFilteredIds,
                                ]),
                              ];
                              setForm((prev) => ({
                                ...prev,
                                travelers: updatedTravelers,
                              }));
                            } else {
                              const filteredIds = filteredUsers.map(
                                (user) => user.id
                              );
                              const updatedTravelers = form.travelers.filter(
                                (id) => !filteredIds.includes(id)
                              );
                              setForm((prev) => ({
                                ...prev,
                                travelers: updatedTravelers,
                              }));
                            }
                          }}
                          checked={
                            getFilteredTravelersUsers().length > 0 &&
                            getFilteredTravelersUsers().every((user) =>
                              form.travelers.includes(user.id)
                            )
                          }
                        />
                      </th>
                      <th>Full Name</th>
                      <th>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredTravelersUsers().length > 0 ? (
                      getFilteredTravelersUsers().map((user) => (
                        <tr
                          key={user.id}
                          className={
                            form.travelers.includes(user.id)
                              ? "selected-row"
                              : ""
                          }
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={form.travelers.includes(user.id)}
                              onChange={(e) => {
                                const selected = form.travelers.includes(
                                  user.id
                                );
                                const updated = selected
                                  ? form.travelers.filter(
                                      (id) => id !== user.id
                                    )
                                  : [...form.travelers, user.id];
                                setForm((prev) => ({
                                  ...prev,
                                  travelers: updated,
                                }));
                              }}
                            />
                          </td>
                          <td>{user.name}</td>
                          <td>{user.department?.name || "No Department"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          style={{ textAlign: "center", padding: "20px" }}
                        >
                          No users match your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-filter-message">
                <p>
                  Please use the search box or select a department to view and
                  select users.
                </p>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setShowTravelerPicker(false)}
                className="done-btn"
              >
                Done ({form.travelers.length} selected)
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, travelers: [] }));
                }}
                className="clear-selection-btn"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Request Modal */}
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
                <b>Trip Type:</b> {viewRequest.tripType}
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
                  className={`staff-request-status-badge status-${viewRequest.status}`}
                >
                  {getStatusText(viewRequest.status)}
                </span>
              </div>
              {/* if status is rejected then show rejection reason */}
              {viewRequest.status === RequestStatus.REJECTED && (
                <div>
                  <b>Rejection Reason: </b>
                  <span style={{ color: "red", fontWeight: "bold" }}>
                    {viewRequest.reasonOfRejection || "Unspecified"}
                  </span>
                </div>
              )}
              {viewRequest.travelerNames &&
                viewRequest.travelerNames.length > 0 && (
                  <div>
                    <b>Travelers:</b>
                    <ul>
                      {viewRequest.travelerNames.map((name, index) => (
                        <li key={index}>{name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              {viewRequest.travelers &&
                viewRequest.travelers.length > 0 &&
                !viewRequest.travelerNames && (
                  <div>
                    <b>Travelers:</b>
                    <ul>
                      {viewRequest.travelers.map((travelerId) => (
                        <li key={travelerId}>{getUserNameById(travelerId)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              {viewRequest.vehicles && viewRequest.vehicles.length > 0 && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <b>Assigned Vehicles:</b>
                  {viewRequest.vehicles.map((vehicle, index) => (
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
              {(!viewRequest.vehicles || viewRequest.vehicles.length === 0) && (
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
              {viewRequest.approver && (
                <div>
                  <b>Approved By:</b> {viewRequest.approver?.name || "N/A"}
                  <br />
                  <small style={{ color: "#666", marginLeft: "10px" }}>
                    Department:{" "}
                    {viewRequest.approver?.department?.name || "N/A"} | Role:{" "}
                    {viewRequest.approver?.role || "N/A"}
                  </small>
                </div>
              )}
              {viewRequest.assigner && (
                <div>
                  <b>Assigned By:</b> {viewRequest.assigner?.name || "N/A"}
                  <br />
                  <small style={{ color: "#666", marginLeft: "10px" }}>
                    Department:{" "}
                    {viewRequest.assigner?.department?.name || "N/A"} | Role:{" "}
                    {viewRequest.assigner?.role || "N/A"}
                  </small>
                </div>
              )}
              {viewRequest.rejecter && (
                <div>
                  <b>Rejected By:</b> {viewRequest.rejecter?.name || "N/A"}
                  <br />
                  <small style={{ color: "#666", marginLeft: "10px" }}>
                    Department:{" "}
                    {viewRequest.rejecter?.department?.name || "N/A"} | Role:{" "}
                    {viewRequest.rejecter?.role || "N/A"}
                  </small>
                </div>
              )}
              {viewRequest.rejectionReason && (
                <div>
                  <b>Rejection Reason:</b> {viewRequest.rejectionReason}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Request Modal */}
      {showRejectForm && (
        <div className="modal-bg">
          <div className="modal-card">
            <button
              className="modal-close"
              onClick={() => {
                setShowRejectForm(false);
                setRequestToReject(null);
                setRejectReason("");
                setError(null);
              }}
            >
              &times;
            </button>
            <h2>Reject Request</h2>
            {error && <div className="error-message">{error}</div>}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleReject();
              }}
              className="rejection-form"
            >
              <div className="form-row">
                <label>Request Details:</label>
                <div className="request-details">
                  <p>
                    <strong>Requester:</strong>{" "}
                    {requestToReject?.requester?.name}
                  </p>
                  <p>
                    <strong>Department:</strong>{" "}
                    {requestToReject?.requester?.department?.name}
                  </p>
                  <p>
                    <strong>Trip Type:</strong>{" "}
                    {requestToReject?.tripType}
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
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                  placeholder="Please provide a detailed reason for rejecting this request"
                  rows="4"
                  minLength={10}
                />
                <small className="form-help-text">
                  Please provide a clear and specific reason for rejection
                  (minimum 10 characters).
                </small>
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={
                    !rejectReason.trim() || rejectReason.trim().length < 10
                  }
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
                    setShowRejectForm(false);
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
}

export default VehicleRequest;
