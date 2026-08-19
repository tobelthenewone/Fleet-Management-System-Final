import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./Manager.css";
import api from "../../api/axios";
import { getFullImageUrl } from "./imageUtils";

const Drivers = () => {
  const [showForm, setShowForm] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: "",
    licenseNumber: "",
    phoneNumber: "",
    email: "",
    isOccupied: false,
    licenseLevel: "1",
    imageUrl: "",
  });
  const [search, setSearch] = useState("");
  const [viewDriver, setViewDriver] = useState(null);
  const [editDriver, setEditDriver] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Fetch drivers on component mount
  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/logistics/drivers");
      if (response.status !== 200) {
        throw new Error("Failed to fetch drivers");
      }
      setDrivers(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, and WEBP images are allowed');
      setImageFile(null);
      return;
    }
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB');
      setImageFile(null);
      return;
    }
    setError(null);
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = form.imageUrl || "";
    if (imageFile) {
      const data = new FormData();
      data.append("file", imageFile);
      // Always upload to profile_images/ for drivers
      data.append("subdir", "profile_images");
      try {
        const uploadRes = await api.post("/uploads", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data;
      } catch (err) {
        setError("Image upload failed");
        return;
      }
    }
    try {
      const response = await api.post("/logistics/drivers", {
        ...form,
        imageUrl,
      });
      if (response.status !== 200) {
        throw new Error("Failed to create driver");
      }
      await fetchDrivers();
      setShowForm(false);
      setForm({
        name: "",
        licenseNumber: "",
        phoneNumber: "",
        email: "",
        isOccupied: false,
        licenseLevel: "1",
        imageUrl: "",
      });
      setImageFile(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/logistics/drivers/${id}`);
      if (response.status !== 204) {
        throw new Error("Failed to delete driver");
      }

      await fetchDrivers();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (d) => {
    setEditDriver(d);
    setForm({
      name: d.name,
      licenseNumber: d.licenseNumber,
      phoneNumber: d.phoneNumber,
      email: d.email,
      isOccupied: d.isOccupied,
      licenseLevel: d.licenseLevel,
      imageUrl: d.imageUrl,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = form.imageUrl || (editDriver && editDriver.imageUrl) || "";
    if (imageFile) {
      const data = new FormData();
      data.append("file", imageFile);
      // Always upload to profile_images/ for drivers
      data.append("subdir", "profile_images");
      try {
        const uploadRes = await api.post("/uploads", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data;
      } catch (err) {
        setError("Image upload failed");
        return;
      }
    }
    try {
      const response = await api.put(`/logistics/drivers/${editDriver.id}`, {
        ...form,
        imageUrl,
      });
      if (response.status !== 200) {
        throw new Error("Failed to update driver");
      }
      await fetchDrivers();
      setEditDriver(null);
      setForm({
        name: "",
        licenseNumber: "",
        phoneNumber: "",
        email: "",
        isOccupied: false,
        licenseLevel: "1",
        imageUrl: "",
      });
      setImageFile(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="manager-dashboard-layout">
        <Sidebar />
        <main className="manager-dashboard-main">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Drivers</h1>
          </div>
          <div className="loading">Loading drivers...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="manager-dashboard-layout">
      <Sidebar />
      <main
        className={`manager-dashboard-main${
          viewDriver || editDriver ? " blurred-bg" : ""
        }`}
      >
        <div className="dashboard-header">
          <h1 className="dashboard-title">Drivers</h1>
        </div>
        {error && <div className="error-message">{error}</div>}
        {showForm && (
          <div className="modal-bg">
            <div
              className="modal-card driver-form-modal"
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              <button
                className="modal-close"
                onClick={() => setShowForm(false)}
              >
                &times;
              </button>

              <form
                className="driver-form-grid"
                onSubmit={editDriver ? handleEditSubmit : handleSubmit}
              >
                <h2 className="form-title">
                  {editDriver ? "Edit Driver" : "Register New Driver"}
                </h2>

                {/* Personal Information Section */}
                <div className="form-section">
                  <h3 className="section-title">Personal Information</h3>
                  <div className="form-grid-2">
                    <div className="form-row">
                      <label>Full Name *</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div className="form-row">
                      <label>Email Address *</label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contact & License Information Section */}
                <div className="form-section">
                  <h3 className="section-title">
                    Contact & License Information
                  </h3>
                  <div className="form-grid-2">
                    <div className="form-row">
                      <label>Phone Number *</label>
                      <input
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        pattern="^\+?[0-9]{10,15}$"
                        title="Please enter a valid phone number (10-15 digits)"
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                    <div className="form-row">
                      <label>License Number *</label>
                      <input
                        name="licenseNumber"
                        value={form.licenseNumber}
                        onChange={handleChange}
                        placeholder="Enter license number"
                        required
                      />
                    </div>
                    <div className="form-row">
                      <label>License Level *</label>
                      <select
                        name="licenseLevel"
                        className="form-select"
                        value={form.licenseLevel}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select License Level</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </div>
                    <div className="form-row">
                      <label>Driver Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      {imageFile && (
                        <img
                          src={URL.createObjectURL(imageFile)}
                          alt="Preview"
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "50%",
                            marginTop: "0.5rem",
                          }}
                        />
                      )}
                      {!imageFile && form.imageUrl && (
                        <img
                          src={getFullImageUrl(form.imageUrl)}
                          alt="Current"
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "50%",
                            marginTop: "0.5rem",
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    {editDriver ? "Update Driver" : "Register Driver"}
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setShowForm(false);
                      setEditDriver(null);
                      setImageFile(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}{" "}
        <>
          <div className="vehicles-toolbar">
            <input
              className="vehicles-search"
              type="text"
              placeholder="Search by name, license number, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="add-btn small" onClick={() => setShowForm(true)}>
              + Add New Driver
            </button>
          </div>
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Name</th>
                {/* <th>License Number</th>
                <th>License Level</th>
                <th>Phone Number</th> */}
                {/* <th>Email</th> */}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>
                    {d.imageUrl ? (
                      <img
                        src={getFullImageUrl(d.imageUrl)}
                        alt={d.name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    ) : (
                      <span>No Image</span>
                    )}
                  </td>
                  <td>{d.name}</td>
                  {/* <td>{d.licenseNumber}</td>
                  <td>Level {d.licenseLevel}</td>
                  <td>{d.phoneNumber}</td>
                  <td>{d.email}</td> */}
                  <td>{d.isOccupied ? "Occupied" : "Available"}</td>
                  <td>
                    <button
                      className="action-btn view"
                      onClick={() => setViewDriver(d)}
                    >
                      View
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(d)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(d.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      </main>

      {/* View Modal */}
      {viewDriver && (
        <div className="modal-bg">
          <div className="modal-card">
            <button className="modal-close" onClick={() => setViewDriver(null)}>
              &times;
            </button>
            <h2>Driver Details</h2>
            <div className="modal-info-grid">
              {viewDriver.imageUrl && (
                <img
                  src={getFullImageUrl(viewDriver.imageUrl)}
                  alt={viewDriver.name}
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "50%",
                    marginBottom: "1rem",
                  }}
                />
              )}
              <div>
                <b>Name:</b> {viewDriver.name}
              </div>
              <div>
                <b>License Number:</b> {viewDriver.licenseNumber}
              </div>
              <div>
                <b>License Level:</b> Level {viewDriver.licenseLevel}
              </div>
              <div>
                <b>Phone Number:</b> {viewDriver.phoneNumber}
              </div>
              <div>
                <b>Email:</b> {viewDriver.email}
              </div>
              <div>
                <b>Status:</b>{" "}
                {viewDriver.isOccupied ? "Occupied" : "Available"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editDriver && (
        <div className="modal-bg">
          <div
            className="modal-card driver-form-modal"
            style={{ maxHeight: "90vh", overflowY: "auto" }}
          >
            <button className="modal-close" onClick={() => setEditDriver(null)}>
              &times;
            </button>

            <form className="driver-form-grid" onSubmit={handleEditSubmit}>
              <h2 className="form-title">Edit Driver</h2>
              {/* Personal Information Section */}
              <div className="form-section">
                <h3 className="section-title">Personal Information</h3>
                <div className="form-grid-2">
                  <div className="form-row">
                    <label>Full Name *</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label>Email Address *</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
              {/* Contact & License Information Section */}
              <div className="form-section">
                <h3 className="section-title">Contact & License Information</h3>
                <div className="form-grid-2">
                  <div className="form-row">
                    <label>Phone Number *</label>
                    <input
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      pattern="^\+?[0-9]{10,15}$"
                      title="Please enter a valid phone number (10-15 digits)"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label>License Number *</label>
                    <input
                      name="licenseNumber"
                      value={form.licenseNumber}
                      onChange={handleChange}
                      placeholder="Enter license number"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label>License Level *</label>
                    <select
                      name="licenseLevel"
                      className="form-select"
                      value={form.licenseLevel}
                      onChange={handleChange}
                      required
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <label>Driver Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {imageFile && (
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "50%",
                          marginTop: "0.5rem",
                        }}
                      />
                    )}
                    {!imageFile && form.imageUrl && (
                      <img
                        src={getFullImageUrl(form.imageUrl)}
                        alt="Current"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "50%",
                          marginTop: "0.5rem",
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Save
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setEditDriver(null);
                    setImageFile(null);
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

export default Drivers;
