import React, { useState } from "react";
import api from "../api/axios"; // Adjust the path as needed
import JourneyStatus from "../enums/JourneyStatus";

const PreApprovedTripForm = ({onClose}) => {
  const [users, setUsers]=useState([]);
  const [preApprovedTrips, setPreApprovedTrips] = useState([]);
  const [department, setDepartment] = useState(""); // department id
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [vehicleKilometers, setVehicleKilometers] = useState({});
  const [departmentVehicles, setDepartmentVehicles] = useState({});
  const [departments, setDepartments] = useState([]);
  const [travelerSearch, setTravelerSearch] = useState("");
  const [selectedTravelers, setSelectedTravelers] = useState([]); // user ids

  React.useEffect(() => { 
    fetchPreApprovedTrips();
    fetchUsers();
  }, []);

  const handleDepartmentChange = (e) => {
    setDepartment(e.target.value); // department id
    setSelectedVehicles([]);
    setVehicleKilometers({});
    setTravelerSearch("");
    setSelectedTravelers([]);
  };

  const fetchPreApprovedTrips = async () => {
    try {
      const response = await api.get("/pre-approved-trips");
      setPreApprovedTrips(response.data);
      if(response.status !== 200) {
        throw new Error("Failed to fetch pre-approved trips");
      }
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid data format for pre-approved trips");
      }
      // Set departments as array of {id, name}
      setDepartments(
        Array.from(
          response.data.reduce((acc, trip) => {
            if (trip.department && trip.department.id && trip.department.name) {
              acc.set(trip.department.id, trip.department.name);
            }
            return acc;
          }, new Map())
        ).map(([id, name]) => ({ id, name }))
      );
      // Use department id as key for vehicles
      setDepartmentVehicles(
        response.data.reduce((acc, trip) => {
          const deptId = trip.department?.id;
          if (!deptId) return acc;
          if (!acc[deptId]) {
            acc[deptId] = [];
          }
          trip.vehicles.forEach((vehicle) => {
            // Store both id and plateNumber for each vehicle
            if (!acc[deptId].some(v => v.id === vehicle.id)) {
              acc[deptId].push({ id: vehicle.id, plateNumber: vehicle.plateNumber });
            }
          });
          return acc;
        }, {})
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pre-approved trips:", error);
      return [];
    }
  };
  const fetchUsers= async ()=>{
    try {
      const response = await api.get("/users");
      setUsers(response.data);
      if(response.status !== 200) {
        throw new Error("Failed to fetch users");
      }
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid data format for users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  // Handle kilometer input change
  const handleKilometerChange = (vehicleId, value) => {
    setVehicleKilometers((prev) => ({
      ...prev,
      [vehicleId]: value,
    }));
  };

  // Handle cancel button
  const handleCancel = () => {
    setDepartment("");
    setSelectedVehicles([]);
    setVehicleKilometers({});
    onClose(); // Call the onClose prop to close the form
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    // send the data to the server via API endpoint /pre-approved-trips
    const tripData = {
      departmentId: department,
      travelerIds: selectedTravelers,
      journeyStartInput: selectedVehicles.map((vehicleId) => ({
  vehicleId: vehicleId,
  startKilometer: parseFloat(vehicleKilometers[vehicleId]) || 0.0,
      })),
    };
    try {
      await api.post("/logistics/journeys/start/pre-approved", tripData);
      console.log("Submitting pre-approved trip:", tripData);
    } catch (error) {
      console.error("Error submitting pre-approved trip:", error);
    }
    finally {
      handleCancel();
      fetchPreApprovedTrips();
    }
  };
  // ...handleKilometerChange, handleCancel, handleSubmit...

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "40px auto",
        padding: 24,
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 24, color: "#2d3a4b" }}>
        Pre-Approved Trip Form
      </h2>
      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: 12, color: "#2d3a4b" }}>
          Department
          <select
            value={department}
            onChange={handleDepartmentChange}
            required
            style={{
              width: "100%",
              padding: "8px 12px",
              marginTop: 6,
              borderRadius: 8,
              border: "1px solid #b0bec5",
              background: "#f7fafc",
            }}
          >
            <option value="">Select Department</option>
            {departments.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.name}
              </option>
            ))}
          </select>
        </label>

        {department && (
          <>
            {/* Travelers field */}
            <div style={{ marginBottom: 20, color: "#2d3a4b" }}>
              <label style={{ display: "block", marginBottom: 10 }}>
                Travelers
              </label>
              <input
                type="text"
                placeholder="Search and select travelers..."
                value={travelerSearch}
                onChange={e => setTravelerSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #b0bec5",
                  background: "#f7fafc",
                  marginBottom: 8
                }}
              />
              {/* Show filtered users for selection */}
              {travelerSearch && (
                <div style={{
                  background: "#fff",
                  border: "1px solid #b0bec5",
                  borderRadius: 8,
                  maxHeight: 150,
                  overflowY: "auto",
                  marginBottom: 8
                }}>
                  {users
                    .filter(u => u.department && String(u.department.id) === String(department))
                    .filter(u =>
                      (u.name && u.name.toLowerCase().includes(travelerSearch.toLowerCase())) ||
                      (u.username && u.username.toLowerCase().includes(travelerSearch.toLowerCase()))
                    )
                    .filter(u => !selectedTravelers.includes(u.id))
                    .map(u => (
                      <div
                        key={u.id}
                        style={{ padding: 8, cursor: "pointer" }}
                        onClick={() => {
                          setSelectedTravelers(prev => [...prev, u.id]);
                          setTravelerSearch("");
                        }}
                      >
                        {u.name} ({u.username})
                      </div>
                    ))}
                  {users.filter(u => u.department && String(u.department.id) === String(department))
                    .filter(u =>
                      (u.name && u.name.toLowerCase().includes(travelerSearch.toLowerCase())) ||
                      (u.username && u.username.toLowerCase().includes(travelerSearch.toLowerCase()))
                    ).length === 0 && (
                    <div style={{ padding: 8, color: '#aaa' }}>No users found</div>
                  )}
                </div>
              )}
              {/* Show selected travelers */}
              {selectedTravelers.length > 0 && (
                <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selectedTravelers.map(id => {
                    const user = users.find(u => u.id === id);
                    return user ? (
                      <span key={id} style={{ background: '#e0eafc', borderRadius: 12, padding: '4px 10px', display: 'inline-flex', alignItems: 'center' }}>
                        {user.name} ({user.username})
                        <button type="button" style={{ marginLeft: 6, background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontWeight: 700 }} onClick={() => setSelectedTravelers(prev => prev.filter(uid => uid !== id))}>&times;</button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
            {/* Vehicles field */}
            <div style={{ marginBottom: 20, color: "#2d3a4b" }}>
              <label style={{ display: "block", marginBottom: 10 }}>
                Vehicles
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(departmentVehicles[department] || []).map((vehicle) => {
                  // Find if this vehicle is occupied by checking preApprovedTrips for this department
                  const isOccupied = preApprovedTrips.some(trip =>
                    trip.department?.id === Number(department) &&
                    trip.vehicles.some(v => v.id === vehicle.id && v.status === 'OCCUPIED')
                  );
                  return (
                    <label
                      key={vehicle.id}
                      style={{ display: "flex", alignItems: "center", gap: 8, opacity: isOccupied ? 0.6 : 1 }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedVehicles.includes(vehicle.id)}
                        disabled={isOccupied}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVehicles((prev) => [...prev, vehicle.id]);
                            setVehicleKilometers((prev) => ({
                              ...prev,
                              [vehicle.id]: prev[vehicle.id] || "",
                            }));
                          } else {
                            setSelectedVehicles((prev) =>
                              prev.filter((v) => v !== vehicle.id)
                            );
                            setVehicleKilometers((prev) => {
                              const updated = { ...prev };
                              delete updated[vehicle.id];
                              return updated;
                            });
                          }
                        }}
                      />
                      {vehicle.plateNumber}
                      {isOccupied && (
                        <span style={{ color: '#ff4d4f', marginLeft: 8, fontWeight: 500, fontSize: 13 }}>
                          (Already Occupied)
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {selectedVehicles.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: "#2d3a4b", marginBottom: 10 }}>
              Selected Vehicles & Start Kilometer
            </h4>
            {selectedVehicles.map((vehicleId) => {
              const vehicle = (departmentVehicles[department] || []).find(v => v.id === vehicleId);
              return (
                <div key={vehicleId} style={{ marginBottom: 12 }}>
                  <span style={{ marginRight: 12 }}>{vehicle ? vehicle.plateNumber : vehicleId}</span>
                  <input
                    type="number"
                    min="0.0"
                    step="0.01"
                    value={
                      vehicleKilometers[vehicleId] !== undefined && vehicleKilometers[vehicleId] !== null
                        ? parseFloat(vehicleKilometers[vehicleId])
                        : 0.0
                    }
                    onChange={(e) =>
                      handleKilometerChange(vehicleId, e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    required
                    placeholder="Enter start kilometer"
                    style={{
                      width: 180,
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid #b0bec5",
                      background: "#f7fafc",
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="submit"
            disabled={
              selectedVehicles.length === 0 ||
              selectedTravelers.length === 0 ||
              selectedVehicles.some(
                (vehicleId) =>
                  !vehicleKilometers[vehicleId] && vehicleKilometers[vehicleId] <=0.0
              )
            }
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 8,
              border: "none",
              background: selectedVehicles.length === 0 || selectedTravelers.length === 0
                ? "#b0bec5"
                : "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
              color: selectedVehicles.length === 0 || selectedTravelers.length === 0 ? "#888" : "#fff",
              fontWeight: "bold",
              fontSize: 16,
              cursor: selectedVehicles.length === 0 || selectedTravelers.length === 0 ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px rgba(67,206,162,0.15)",
            }}
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 8,
              border: "none",
              background: "#b0bec5",
              color: "#2d3a4b",
              fontWeight: "bold",
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(67,206,162,0.10)",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PreApprovedTripForm;
