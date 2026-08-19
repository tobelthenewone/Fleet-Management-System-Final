import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./adminsidebar";
import Sidebar from "../manager/Sidebar";
import "./admin.css";
import api from "../../api/axios";
import DepartmentLocation from "../../enums/DepartmentLocation";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showDepartmentDetailsModal, setShowDepartmentDetailsModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
    managerId: null,
    directorId: null,
    location: "",
  });

  const [users, setUsers] = useState([]);
  const [managerSearch, setManagerSearch] = useState("");
  const [directorSearch, setDirectorSearch] = useState("");
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedDirector, setSelectedDirector] = useState(null);


  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/departments");
      if (response.status === 200) setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      if (response.status === 200) setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredDepartments = (departments || []).filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dept.manager && dept.manager.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dept.director && dept.director.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredManagerUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(managerSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(managerSearch.toLowerCase())
  );

  const filteredDirectorUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(directorSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(directorSearch.toLowerCase())
  );

  const handleAddDepartmentChange = (e) => {
    const { name, value } = e.target;
    setNewDepartment((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setNewDepartment({ name: "", description: "", managerId: null, directorId: null, location: "" });
    setSelectedDepartment(null);
    setSelectedManager(null);
    setSelectedDirector(null);
    setManagerSearch("");
    setDirectorSearch("");
  };

  const handleAddDepartmentSubmit = async (e) => {
    e.preventDefault();

    const departmentPayload = {
      ...newDepartment,
      managerId: selectedManager ? selectedManager.id : null,
      directorId: selectedDirector ? selectedDirector.id : null,
    };

    try {
      let response;
      if (selectedDepartment) {
        response = await api.put(`/departments/${selectedDepartment.id}`, departmentPayload);
      } else {
        response = await api.post("/departments", departmentPayload);
      }

      if (response.status === 200 || response.status === 201) {
        setShowAddDepartmentModal(false);
        resetForm();
        fetchDepartments();
        // alert(
        //   selectedDepartment
        //     ? "Department updated successfully!"
        //     : "Department added successfully!"
        // );
      }
    } catch (error) {
      console.error("Error saving department:", error);
      // alert("Failed to save department. Please try again.");
    }
  };

  const handleViewDepartment = (department) => {
    setSelectedDepartment(department);
    setSelectedManager(department.manager || null);
    setSelectedDirector(department.director || null);
    setShowDepartmentDetailsModal(true);
  };

  const handleEditDepartment = (department) => {
    setSelectedDepartment(department);
    setNewDepartment({
      name: department.name,
      description: department.description || "",
      managerId: department.manager ? department.manager.id : null,
      directorId: department.director ? department.director.id : null,
      location: department.location || "",
    });
    setSelectedManager(department.manager || null);
    setSelectedDirector(department.director || null);
    setShowAddDepartmentModal(true);
  };

  const handleDeleteDepartment = async (departmentId) => {
    // if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        const response = await api.delete(`/departments/${departmentId}`);
        if (response.status === 200) {
          // alert("Department deleted successfully!");
          fetchDepartments();
        }
      } catch (error) {
        console.error("Error deleting department:", error);
        // alert("Failed to delete department. Please try again.");
      } finally {
        setShowDepartmentDetailsModal(false);
        fetchDepartments();
      }
    // }
  };

  const LoadingSpinner = () => (
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
      <span>Loading departments...</span>
    </div>
  );

  return (
    <div className="admin-dashboard-layout">
      <Sidebar/>
      <main className="admin-dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">DEPARTMENT MANAGEMENT</h1>
          <div className="dashboard-user">
            <span className="user-icon">👤</span>
            <span className="user-info">
              {localStorage.getItem("name")}
              <br />
              <span className="user-type">{localStorage.getItem("role")}</span>
            </span>
          </div>
        </div>

        <div className="users-toolbar">
          <input
            type="text"
            placeholder="Search departments..."
            className="users-search"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button
            className="add-btn small"
            onClick={() => {
              resetForm();
              setShowAddDepartmentModal(true);
            }}
          >
            + Add Department
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Name</th>
                {/* <th>Description</th> */}
                <th>Manager</th>
                <th>Director</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((dept, index) => (
                  <tr key={dept.id}>
                    <td>{index + 1}</td>
                    <td>{dept.name}</td>
                    {/* <td>{dept.description || "-"}</td> */}
                    <td>{dept.manager?.name || "-"}</td>
                    <td>{dept.director?.name || "-"}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view"
                          onClick={() => handleViewDepartment(dept)}
                          title="View Department"
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                          }}
                        >
                          <span
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="24"
                              width="24"
                              fill="#1976d2"
                            >
                              <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12c-4.97 0-8-4.03-8-5s3.03-5 8-5 8 4.03 8 5-3.03 5-8 5zm0-8a3 3 0 100 6 3 3 0 000-6zm0 4a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </span>
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={() => handleEditDepartment(dept)}
                          title="Edit Department"
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            marginLeft: 8,
                          }}
                        >
                          <span
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="24"
                              width="24"
                              fill="#388e3c"
                            >
                              <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm17.71-10.04a1.003 1.003 0 000-1.42l-2.5-2.5a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                            </svg>
                          </span>
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteDepartment(dept.id)}
                          title="Delete Department"
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            marginLeft: 8,
                          }}
                        >
                          <span
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="24"
                              width="24"
                              fill="#d32f2f"
                            >
                              <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" />
                            </svg>
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    {searchTerm ? "No departments match your search." : "No departments found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Add/Edit Department Modal */}
        {showAddDepartmentModal && (
          <div className="modal-bg">
            <div className="modal-card">
              <button
                className="modal-close"
                onClick={() => setShowAddDepartmentModal(false)}
              >
                ×
              </button>
              <h2>{selectedDepartment ? "Edit Department" : "Add New Department"}</h2>
              <form onSubmit={handleAddDepartmentSubmit} className="user-form">
                <div className="form-row">
                  <label htmlFor="name">Department Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newDepartment.name}
                    onChange={handleAddDepartmentChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={newDepartment.description}
                    onChange={handleAddDepartmentChange}
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="location">Location</label>
                  <select
                    id="location"
                    name="location"
                    value={newDepartment.location}
                    onChange={handleAddDepartmentChange}
                    required
                  >
                    <option value="">Select Location</option>
                    {Object.entries(DepartmentLocation).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                {/* Manager Field */}
                <div style={{ marginBottom: 20, color: "#2d3a4b" }}>
                  <label style={{ display: "block", marginBottom: 10 }}>Manager</label>
                  <input
                    type="text"
                    placeholder="Search and select manager..."
                    value={managerSearch}
                    onChange={(e) => setManagerSearch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid #b0bec5",
                      background: "#f7fafc",
                      marginBottom: 8
                    }}
                  />
                  {managerSearch && (
                    <div style={{
                      background: "#fff",
                      border: "1px solid #b0bec5",
                      borderRadius: 8,
                      maxHeight: 150,
                      overflowY: "auto",
                      marginBottom: 8
                    }}>
                      {filteredManagerUsers.map(u => (
                        <div
                          key={u.id}
                          style={{ padding: 8, cursor: "pointer" }}
                          onClick={() => {
                            setSelectedManager(u);
                            setManagerSearch("");
                          }}
                        >
                          {u.name} ({u.username})
                        </div>
                      ))}
                      {filteredManagerUsers.length === 0 && (
                        <div style={{ padding: 8, color: '#aaa' }}>No users found</div>
                      )}
                    </div>
                  )}
                  {selectedManager && (
                    <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ background: '#e0eafc', borderRadius: 12, padding: '4px 10px', display: 'inline-flex', alignItems: 'center' }}>
                        {selectedManager.name} ({selectedManager.username})
                        <button type="button" style={{ marginLeft: 6, background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontWeight: 700 }} onClick={() => setSelectedManager(null)}>&times;</button>
                      </span>
                    </div>
                  )}
                </div>

                {/* Director Field */}
                <div style={{ marginBottom: 20, color: "#2d3a4b" }}>
                  <label style={{ display: "block", marginBottom: 10 }}>Director</label>
                  <input
                    type="text"
                    placeholder="Search and select director..."
                    value={directorSearch}
                    onChange={(e) => setDirectorSearch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid #b0bec5",
                      background: "#f7fafc",
                      marginBottom: 8
                    }}
                  />
                  {directorSearch && (
                    <div style={{
                      background: "#fff",
                      border: "1px solid #b0bec5",
                      borderRadius: 8,
                      maxHeight: 150,
                      overflowY: "auto",
                      marginBottom: 8
                    }}>
                      {filteredDirectorUsers.map(u => (
                        <div
                          key={u.id}
                          style={{ padding: 8, cursor: "pointer" }}
                          onClick={() => {
                            setSelectedDirector(u);
                            setDirectorSearch("");
                          }}
                        >
                          {u.name} ({u.username})
                        </div>
                      ))}
                      {filteredDirectorUsers.length === 0 && (
                        <div style={{ padding: 8, color: '#aaa' }}>No users found</div>
                      )}
                    </div>
                  )}
                  {selectedDirector && (
                    <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ background: '#e0eafc', borderRadius: 12, padding: '4px 10px', display: 'inline-flex', alignItems: 'center' }}>
                        {selectedDirector.name} ({selectedDirector.username})
                        <button type="button" style={{ marginLeft: 6, background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontWeight: 700 }} onClick={() => setSelectedDirector(null)}>&times;</button>
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowAddDepartmentModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit">
                    {selectedDepartment ? "Update Department" : "Add Department"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Department Details Modal */}
        {showDepartmentDetailsModal && selectedDepartment && (
          <div className="modal-bg">
            <div className="modal-card">
              <button
                className="modal-close"
                onClick={() => setShowDepartmentDetailsModal(false)}
              >
                ×
              </button>
              <h2>Department Details</h2>
              <div className="user-details">
                <div className="user-detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedDepartment.name}</span>
                </div>
                <div className="user-detail-item">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{selectedDepartment.description || "-"}</span>
                </div>
                <div className="user-detail-item">
                  <span className="detail-label">Manager:</span>
                  <span className="detail-value">{selectedManager?.name || "-"}</span>
                </div>
                <div className="user-detail-item">
                  <span className="detail-label">Director:</span>
                  <span className="detail-value">{selectedDirector?.name || "-"}</span>
                </div>
                  <div className="user-detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{selectedDepartment.location || "-"}</span>
                </div>
              </div>
              <div className="form-actions">
                <button
                  className="edit-btn"
                  onClick={() => {
                    setShowDepartmentDetailsModal(false);
                    handleEditDepartment(selectedDepartment);
                  }}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => {
                    setShowDepartmentDetailsModal(false);
                    handleDeleteDepartment(selectedDepartment.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Departments;
