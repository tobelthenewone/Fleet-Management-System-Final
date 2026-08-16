import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const VehicleRequestModal = ({
  showAddForm,
  setShowForm,
  users,
  editingRequest,
  setEditingRequest,
  onSubmitRequest,
  loading,
}) => {
  // Form state
  const [form, setForm] = useState({
    tripType: "",
    destination: "",
    purpose: "",
    startTime: null,
    endTime: null,
    travelerIds: [], // selected user IDs
  });

  const [error, setError] = useState(null);

  // Traveler picker open state
  const [showTravelerPicker, setShowTravelerPicker] = useState(false);

  // Filters inside traveler picker
  const [travelerSearchTerm, setTravelerSearchTerm] = useState("");
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState("");

  // Filter users by search term and department filter
  const getFilteredTravelersUsers = () => {
    return users.filter((user) => {
      // Search filter by name or email (assuming user.email exists)
      const matchesSearch =
        !travelerSearchTerm ||
        user.name.toLowerCase().includes(travelerSearchTerm.toLowerCase()) ||
        (user.email &&
          user.email.toLowerCase().includes(travelerSearchTerm.toLowerCase()));

      // Department filter by department id string
      const matchesDepartment =
        !selectedDepartmentFilter ||
        (user.department &&
          user.department.id.toString() === selectedDepartmentFilter);

      return matchesSearch && matchesDepartment;
    });
  };

  // Populate form when editingRequest changes
  useEffect(() => {
    if (editingRequest) {
      setForm({
        tripType: editingRequest.tripType ?? "",
        destination: editingRequest.destination ?? "",
        purpose: editingRequest.purpose ?? "",
        startTime: editingRequest.startTime
          ? new Date(editingRequest.startTime)
          : null,
        endTime: editingRequest.endTime
          ? new Date(editingRequest.endTime)
          : null,
        travelerIds: editingRequest.travelerIds ?? [],
      });

      // Optional: set department filter based on first traveler
      if (editingRequest.travelerIds?.length) {
        const firstTraveler = users.find(
          (u) => u.id === editingRequest.travelerIds[0]
        );
        setSelectedDepartmentFilter(
          firstTraveler?.department?.id?.toString() || ""
        );
      } else {
        setSelectedDepartmentFilter("");
      }
    } else {
      resetForm();
      setSelectedDepartmentFilter("");
    }
  }, [editingRequest, users]);

  // Reset form
  const resetForm = () => {
    setForm({
      tripType: "",
      destination: "",
      purpose: "",
      startTime: null,
      endTime: null,
      travelerIds: [],
    });
    setError(null);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle traveler selection
  const toggleTraveler = (userId) => {
    setForm((prev) => {
      const alreadySelected = prev.travelerIds.includes(userId);
      if (alreadySelected) {
        return {
          ...prev,
          travelerIds: prev.travelerIds.filter((id) => id !== userId),
        };
      } else {
        return {
          ...prev,
          travelerIds: [...prev.travelerIds, userId],
        };
      }
    });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      form.startTime &&
      form.endTime &&
      new Date(form.endTime) <= new Date(form.startTime)
    ) {
      setError("End time must be after start time.");
      return;
    }

    if (form.travelerIds.length === 0) {
      setError("Please select at least one traveler.");
      return;
    }

    setError(null);
    await onSubmitRequest(form);
    handleCancel();
  };

  // Cancel handler
  const handleCancel = () => {
    setShowForm(false);
    setEditingRequest(null);
    resetForm();
    setShowTravelerPicker(false);
    setTravelerSearchTerm("");
    setSelectedDepartmentFilter("");
  };

  // Open traveler picker button handler
  const openTravelerPicker = () => {
    setShowTravelerPicker(true);
  };

  // Close traveler picker
  const closeTravelerPicker = () => {
    setShowTravelerPicker(false);
    setTravelerSearchTerm("");
    setSelectedDepartmentFilter("");
  };

  if (!showAddForm) return null;

  return (
    <div className="modal-bg">
      <div className="modal-card fit-form">
        <button className="modal-close" onClick={handleCancel}>
          &times;
        </button>

        <h2>
          {editingRequest ? "Edit Vehicle Request" : "New Vehicle Request"}
        </h2>

        {error && (
          <div className="error-message" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="request-grid-form">
          {/* Trip Type and Destination */}
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
                <option value="CITY_TRIP">City Trip</option>
                <option value="FIELD_TRIP">Field Trip</option>
                <option value="EMERGENCY_TRIP">Emergency Trip</option>
                <option value="NIGHT_SHIFT">Night Shift</option>
                <option value="SHUTTLE_SHIFT">Shuttle Shift</option>
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

          {/* Purpose */}
          <div className="form-row">
            <label htmlFor="purpose">Purpose:</label>
            <textarea
              id="purpose"
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              required
              placeholder="Enter purpose and description"
              rows="3"
            />
          </div>

          {/* Start and End Time */}
          <div className="form-grid-row">
            <div className="form-row">
              <label htmlFor="startTime">Start Time:</label>
              <DatePicker
                id="startTime"
                selected={form.startTime}
                onChange={(date) =>
                  setForm((prev) => ({ ...prev, startTime: date }))
                }
                showTimeSelect
                dateFormat="Pp"
                className="custom-datepicker"
                placeholderText="Select start time"
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="endTime">End Time:</label>
              <DatePicker
                id="endTime"
                selected={form.endTime}
                onChange={(date) =>
                  setForm((prev) => ({ ...prev, endTime: date }))
                }
                showTimeSelect
                dateFormat="Pp"
                className="custom-datepicker"
                placeholderText="Select end time"
                required
              />
            </div>
          </div>

          {/* Travelers Selection */}
          <div className="form-row">
            <label>Travelers:</label>
            <button
              type="button"
              className="action-btn select-travelers-btn"
              onClick={openTravelerPicker}
              style={{ width: "auto", marginBottom: "10px" }}
            >
              Select Travelers ({form.travelerIds.length} selected)
            </button>

            {form.travelerIds.length > 0 && (
              <div className="selected-travelers">
                <strong>Selected Travelers:</strong>
                <ul>
                  {users
                    .filter((user) => form.travelerIds.includes(user.id))
                    .map((user) => (
                      <li key={user.id}>
                        {user.name} - {user.department?.name || "No Department"}
                        <button
                          type="button"
                          className="remove-traveler-btn"
                          onClick={() => toggleTraveler(user.id)}
                          style={{
                            marginLeft: "8px",
                            color: "red",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                          aria-label={`Remove ${user.name}`}
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          {/* Traveler Picker Modal */}
          {showTravelerPicker && (
            <div
              className="traveler-picker-modal"
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "white",
                padding: "20px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                zIndex: 1000,
                maxHeight: "400px",
                overflowY: "auto",
                width: "90%",
                maxWidth: "400px",
                borderRadius: "8px",
              }}
            >
              <h3>Select Travelers</h3>

              {/* Search input */}
              <input
                type="text"
                placeholder="Search travelers by name or email..."
                value={travelerSearchTerm}
                onChange={(e) => setTravelerSearchTerm(e.target.value)}
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              />

              {/* Department filter dropdown */}
              <select
                value={selectedDepartmentFilter}
                onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              >
                <option value="">All Departments</option>
                {users
                  .map((u) => u.department)
                  .filter(
                    (d, i, arr) =>
                      d && arr.findIndex((dep) => dep.id === d.id) === i
                  ) // unique departments
                  .map((dep) => (
                    <option key={dep.id} value={dep.id.toString()}>
                      {dep.name}
                    </option>
                  ))}
              </select>

              {/* List filtered travelers */}
              <div
                style={{
                  maxHeight: "250px",
                  overflowY: "auto",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "10px",
                }}
              >
                {getFilteredTravelersUsers().length === 0 ? (
                  <p>No travelers found.</p>
                ) : (
                  getFilteredTravelersUsers().map((user) => (
                    <div key={user.id} style={{ marginBottom: "6px" }}>
                      <label>
                        <input
                          type="checkbox"
                          checked={form.travelerIds.includes(user.id)}
                          onChange={() => toggleTraveler(user.id)}
                        />{" "}
                        {user.name} - {user.department?.name || "No Department"}
                      </label>
                    </div>
                  ))
                )}
              </div>

              <div style={{ marginTop: "15px", textAlign: "right" }}>
                <button
                  type="button"
                  onClick={closeTravelerPicker}
                  className="action-btn"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Form actions */}
          <div className="form-actions" style={{ marginTop: "20px" }}>
            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : editingRequest ? "Update" : "Submit"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleRequestModal;
