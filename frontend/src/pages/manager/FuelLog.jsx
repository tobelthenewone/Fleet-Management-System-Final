import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./Manager.css";
import api from "../../api/axios";

const FuelLog = () => {
  const [showForm, setShowForm] = useState(false);
  const [showFormType, setShowFormType] = useState(null); // 'individual' or 'bulk'
  const [fuelLogs, setFuelLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    vehicleId: "",
    liters: "",
    pricePerLiter: "",
    date: "",
  });
  const [bulkForm, setBulkForm] = useState({
    date: "",
    pricePerLiter: "",
    vehicleLogs: [],
    excludedVehicles: [],
  });
  const [search, setSearch] = useState("");
  const [viewFuel, setViewFuel] = useState(null);
  const [editFuel, setEditFuel] = useState(null);

  // Fetch fuel logs and vehicles on component mount
  useEffect(() => {
    fetchFuelLogs();
    fetchVehicles();
  }, []);

  const fetchFuelLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/logistics/fuel-logs");
      if (response.status !== 200) {
        throw new Error("Failed to fetch fuel logs");
      }
      setFuelLogs(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get("/vehicles");
      if (response.status !== 200) {
        throw new Error("Failed to fetch vehicles");
      }
      setVehicles(response.data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBulkChange = (e) => {
    const { name, value } = e.target;
    setBulkForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVehicleLogChange = (vehicleId, value) => {
    setBulkForm((prev) => {
      const existingLog = prev.vehicleLogs.find(
        (log) => log.vehicleId === vehicleId
      );
      if (existingLog) {
        return {
          ...prev,
          vehicleLogs: prev.vehicleLogs.map((log) =>
            log.vehicleId === vehicleId ? { ...log, liters: value } : log
          ),
        };
      } else {
        return {
          ...prev,
          vehicleLogs: [...prev.vehicleLogs, { vehicleId, liters: value }],
        };
      }
    });
  };

  const handleExcludeVehicle = (vehicleId) => {
    setBulkForm((prev) => {
      const isExcluded = prev.excludedVehicles.includes(vehicleId);
      return {
        ...prev,
        excludedVehicles: isExcluded
          ? prev.excludedVehicles.filter((id) => id !== vehicleId)
          : [...prev.excludedVehicles, vehicleId],
        // Clear the liters value if excluding
        vehicleLogs: isExcluded
          ? prev.vehicleLogs
          : prev.vehicleLogs.filter((log) => log.vehicleId !== vehicleId),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/logistics/fuel-logs", form);

      if (response.status !== 200) {
        throw new Error("Failed to create fuel log");
      }

      await fetchFuelLogs();
      setShowForm(false);
      setForm({
        vehicleId: "",
        liters: "",
        pricePerLiter: "",
        date: "",
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      const promises = bulkForm.vehicleLogs
        .filter((log) => !bulkForm.excludedVehicles.includes(log.vehicleId))
        .map((log) =>
          api.post("/logistics/fuel-logs", {
            vehicleId: log.vehicleId,
            liters: log.liters,
            pricePerLiter: bulkForm.pricePerLiter,
            date: bulkForm.date,
          })
        );

      await Promise.all(promises);
      await fetchFuelLogs();
      setShowForm(false);
      setShowFormType(null);
      setBulkForm({
        date: "",
        pricePerLiter: "",
        vehicleLogs: [],
        excludedVehicles: [],
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    // if (window.confirm("Are you sure you want to delete this fuel record?")) {
      try {
        const response = await api.delete(`/logistics/fuel-logs/${id}`);

        if (response.status !== 200) {
          throw new Error("Failed to delete fuel log");
        }

        await fetchFuelLogs();
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    // }
  };

  const handleEdit = (f) => {
    setEditFuel(f);
    setForm({
      vehicleId: f.vehicleId,
      liters: f.liters,
      pricePerLiter: f.pricePerLiter,
      date: f.date,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(
        `/logistics/fuel-logs/${editFuel.id}`,
        form
      );

      if (response.status !== 200) {
        throw new Error("Failed to update fuel log");
      }

      await fetchFuelLogs();
      setEditFuel(null);
      setForm({
        vehicleId: "",
        liters: "",
        pricePerLiter: "",
        date: "",
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddNew = () => {
    setShowForm(true);
    setShowFormType(null);
  };

  const handleFormTypeSelect = (type) => {
    setShowFormType(type);
  };

  const filteredLogs = fuelLogs.filter((log) => {
    const vehicle = vehicles.find((v) => v.id === log.vehicleId);
    return (
      vehicle &&
      vehicle.plateNumber.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="manager-dashboard-layout">
        <Sidebar />
        <main className="manager-dashboard-main">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Fuel Logs</h1>
          </div>
          <div className="loading">Loading fuel logs...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="manager-dashboard-layout">
      <Sidebar />
      <main
        className={`manager-dashboard-main${
          viewFuel || editFuel ? " blurred-bg" : ""
        }`}
      >
        <div className="dashboard-header">
          <h1 className="dashboard-title">Fuel Logs</h1>
        </div>
        {error && <div className="error-message">{error}</div>}
        {!showForm ? (
          <>
            <div className="vehicles-toolbar">
              <input
                className="vehicles-search"
                type="text"
                placeholder="Search by plate number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="add-btn small" onClick={handleAddNew}>
                + Add New Fuel Record
              </button>
            </div>
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Vehicle</th>
                  <th>Liters</th>
                  {/* <th>Price per Liter</th> */}
                  {/* <th>Date</th> */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => {
                  const vehicle = vehicles.find((v) => v.id === log.vehicleId);
                  return (
                    <tr key={log.id}>
                      <td>{index + 1}</td>
                      <td>{vehicle ? vehicle.plateNumber : "Unknown"}-{vehicle && <span>({vehicle.model})</span>}</td>
                      <td>{log.liters} L</td>
                      {/* <td>${log.pricePerLiter}</td> */}
                      {/* <td>{new Date(log.date).toLocaleDateString()}</td> */}
                      <td>
                        <button
                          className="action-btn view"
                          onClick={() => setViewFuel(log)}
                        >
                          View
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={() => handleEdit(log)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(log.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        ) : !showFormType ? (
          <div className="modal-bg">
            <div
              className="modal-card fuel-form-modal"
              style={{ maxWidth: "600px" }}
            >
              <div className="form-type-selection">
                <h2>Select Entry Type</h2>
                <div className="form-type-buttons">
                  <button
                    className="form-type-btn individual"
                    onClick={() => handleFormTypeSelect("individual")}
                  >
                    Individual Vehicle Entry
                  </button>
                  <button
                    className="form-type-btn bulk"
                    onClick={() => handleFormTypeSelect("bulk")}
                  >
                    Mass Vehicle Entry
                  </button>
                </div>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setShowFormType(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : showFormType === "individual" ? (
          <div className="modal-bg">
            <div className="modal-card fuel-form-modal">
              <button
                className="modal-close"
                onClick={() => {
                  setShowForm(false);
                  setShowFormType(null);
                }}
              >
                &times;
              </button>

              <form className="vehicle-form-grid" onSubmit={handleSubmit}>
                <h2 className="form-title">Add Fuel Record</h2>

                <div className="form-section">
                  <h3 className="section-title">Fuel Information</h3>
                  <div className="form-grid-2">
                    <div className="form-row">
                      <label>Vehicle *</label>
                      <select
                        name="vehicleId"
                        value={form.vehicleId}
                        onChange={handleChange}
                        required
                        className="form-select"
                      >
                        <option value="">Select a vehicle</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.plateNumber} - {vehicle.manufacturer}{" "}
                            {vehicle.model}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-row">
                      <label>Date *</label>
                      <input
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <label>Liters *</label>
                      <input
                        name="liters"
                        type="number"
                        step="0.01"
                        value={form.liters}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <label>Price per Liter ($) *</label>
                      <input
                        name="pricePerLiter"
                        type="number"
                        step="0.01"
                        value={form.pricePerLiter}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    Add Record
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setShowForm(false);
                      setShowFormType(null);
                      setForm({
                        vehicleId: "",
                        liters: "",
                        pricePerLiter: "",
                        date: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="modal-overlay">
            <div
              className="modal-content vehicle-form-wrapper"
              style={{ maxWidth: "800px" }}
            >
              <form
                className="vehicle-form attractive"
                onSubmit={handleBulkSubmit}
              >
                <h2>Add Bulk Fuel Records</h2>

                <div className="form-row">
                  <label>Date</label>
                  <input
                    name="date"
                    type="date"
                    value={bulkForm.date}
                    onChange={handleBulkChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <label>Price per Liter ($)</label>
                  <input
                    name="pricePerLiter"
                    type="number"
                    step="0.01"
                    value={bulkForm.pricePerLiter}
                    onChange={handleBulkChange}
                    required
                  />
                </div>

                <div className="vehicle-logs-grid">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="vehicle-log-input">
                      <div className="vehicle-log-header">
                        <label>
                          {vehicle.plateNumber} - {vehicle.manufacturer}{" "}
                          {vehicle.model}
                        </label>
                        <div className="exclude-checkbox">
                          <input
                            type="checkbox"
                            id={`exclude-${vehicle.id}`}
                            checked={bulkForm.excludedVehicles.includes(
                              vehicle.id
                            )}
                            onChange={() => handleExcludeVehicle(vehicle.id)}
                          />
                          <label htmlFor={`exclude-${vehicle.id}`}>
                            Exclude
                          </label>
                        </div>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Liters"
                        value={
                          bulkForm.vehicleLogs.find(
                            (log) => log.vehicleId === vehicle.id
                          )?.liters || ""
                        }
                        onChange={(e) =>
                          handleVehicleLogChange(vehicle.id, e.target.value)
                        }
                        disabled={bulkForm.excludedVehicles.includes(
                          vehicle.id
                        )}
                      />
                    </div>
                  ))}
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    Submit All Records
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setShowForm(false);
                      setShowFormType(null);
                      setBulkForm({
                        date: "",
                        pricePerLiter: "",
                        vehicleLogs: [],
                        excludedVehicles: [],
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* View Modal */}
      {viewFuel && (
        <div className="modal-bg">
          <div className="modal-card">
            <button className="modal-close" onClick={() => setViewFuel(null)}>
              &times;
            </button>
            <h2>Fuel Details</h2>
            <div className="modal-info-grid">
              <div>
                <b>Vehicle:</b>{" "}
                {vehicles.find((v) => v.id === viewFuel.vehicleId)
                  ?.plateNumber || "Unknown"}
              </div>
              <div>
                <b>Vehicle Details:</b>{" "}
                {
                  vehicles.find((v) => v.id === viewFuel.vehicleId)
                    ?.manufacturer
                }{" "}
                {vehicles.find((v) => v.id === viewFuel.vehicleId)?.model}
              </div>
              <div>
                <b>Liters:</b> {viewFuel.liters} L
              </div>
              <div>
                <b>Price per Liter:</b> ${viewFuel.pricePerLiter}
              </div>
              <div>
                <b>Total Cost:</b> $
                {(viewFuel.liters * viewFuel.pricePerLiter).toFixed(2)}
              </div>
              <div>
                <b>Date:</b> {new Date(viewFuel.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editFuel && (
        <div className="modal-bg">
          <div className="modal-card fuel-form-modal">
            <button className="modal-close" onClick={() => setEditFuel(null)}>
              &times;
            </button>

            <form className="vehicle-form-grid" onSubmit={handleEditSubmit}>
              <h2 className="form-title">Edit Fuel Record</h2>

              <div className="form-section">
                <h3 className="section-title">Fuel Information</h3>
                <div className="form-grid-2">
                  <div className="form-row">
                    <label>Vehicle</label>
                    <input
                      type="text"
                      value={
                        vehicles.find((v) => v.id === editFuel.vehicleId)
                          ?.plateNumber || "Unknown"
                      }
                      disabled
                    />
                  </div>

                  <div className="form-row">
                    <label>Date *</label>
                    <input
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <label>Liters *</label>
                    <input
                      name="liters"
                      type="number"
                      step="0.01"
                      value={form.liters}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <label>Price per Liter ($) *</label>
                    <input
                      name="pricePerLiter"
                      type="number"
                      step="0.01"
                      value={form.pricePerLiter}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditFuel(null)}
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

export default FuelLog;
