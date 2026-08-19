import Role from "../../enums/role";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./adminsidebar";
import Sidebar from "../manager/Sidebar";
import "./admin.css";
import api from "../../api/axios";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    phoneNumber: "",
    role: "EMPLOYEE",
    departmentId: "",
    password: "",
    confirmPassword: "",
  });
  const [deptQuery, setDeptQuery] = useState('');
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const deptRef = useRef(null);
  // const [passwordError, setPasswordError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // ...existing code...


  // Role options generated from Role enum
  const roleLabels = {
    ADMIN: "Admin",
    LOGISTICS_OFFICER: "Logistics Officer",
    LOGISTICS_HEAD: "Logistics Head",
    DEPARTMENT_HEAD: "Manager or Supervisor",
    DIRECTOR: "Director",
    EMPLOYEE: "Employee",
    MAINTENANCE_REQUESTER: "Maintenance Requester",
    JOURNEY_CONTROLLER: "Journey Controller",
  };
  const roleOptions = Object.entries(Role).map(([key, value]) => ({
    value,
    label: roleLabels[key] || value,
  }));

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (deptRef.current && !deptRef.current.contains(e.target)) {
        setDeptDropdownOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      if (response.status === 200) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");
      if (response.status === 200) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };




  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = (users || []).filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phoneNumber && user.phoneNumber.includes(searchTerm)) ||
      (user.department &&
        user.department.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  ).filter(user => {
    if (!roleFilter || roleFilter === "") return true;
    return user.role === roleFilter;
  });
  

  const handleAddUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }



    if (name === "username" && value) {
      {
        const existingUser = users.find(
          (user) =>
            user.username.toLowerCase() === value.toLowerCase() &&
            (!selectedUser || user.id !== selectedUser.id)
        );
        if (existingUser) {
          setFormErrors((prev) => ({
            ...prev,
            username: "username already exists",
          }));
        } else {
          setFormErrors((prev) => ({ ...prev, username: "" }));
        }
      }
    }

    if (name === "phoneNumber" && value) {
      const existingUser = users.find(
        (user) =>
          user.phoneNumber === value &&
          (!selectedUser || user.id !== selectedUser.id)
      );
      if (existingUser) {
        setFormErrors((prev) => ({
          ...prev,
          phoneNumber: "Phone number already exists",
        }));
      } else {
        setFormErrors((prev) => ({ ...prev, phoneNumber: "" }));
      }
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    // validate department selection
    if (!newUser.departmentId) {
      setFormErrors(prev => ({ ...prev, departmentId: 'Please select a department' }));
      return;
    }

    try {
      const userToAdd = {
        name: newUser.name,
        username: newUser.username,
        // phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        departmentId: parseInt(newUser.departmentId),
        // password: newUser.password,
      };

      let response;
      if (selectedUser) {
        console.log("Updating user:", userToAdd);
        response = await api.put(`/users/${selectedUser.id}`, userToAdd);
      } else {
        // console.log("userToAdd:", userToAdd);
        response = await api.post("/register", userToAdd);
      }

      if (response.status === 200 || response.status === 201) {
        setShowAddUserModal(false);
        resetForm();
        fetchUsers();
        // alert(
        //   selectedUser
        //     ? "User updated successfully!"
        //     : "User added successfully!"
        // );
      }
    } catch (error) {
      console.error("Error saving user:", error);
      // alert("Failed to save user. Please try again.");
    }
  };

  const resetForm = () => {
    setNewUser({
      name: "",
      username: "",
      phoneNumber: "",
      role: "EMPLOYEE",
      departmentId: "",
      password: "",
      confirmPassword: "",
    });
    setSelectedUser(null);
    // setPasswordError("");
    setFormErrors({});
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewUser({
      name: user.name,
      username: user.username,
      // phoneNumber: user.phoneNumber,
      role: user.role,
      departmentId: user.department ? user.department.id.toString() : "",
      password: "",
      confirmPassword: "",
    });
    setShowAddUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    // if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await api.delete(`/users/${userId}`);
        if (response.status === 200) {
          // alert("User deleted successfully!");
          // fetchUsers();
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        // alert("Failed to delete user. Please try again.");
      } finally {
        // setShowUserDetailsModal(false);
        // fetchUsers();
      }
    // }
  };


  const getRoleLabel = (role) => {
    const roleOption = roleOptions.find((option) => option.value === role);
    return roleOption ? roleOption.label : role;
  };

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
      <span>Loading users...</span>
    </div>
  );

  return (
    <div className="admin-dashboard-layout enhanced-users-page">
      <Sidebar />
      <main className="admin-dashboard-main">
        <div className="dashboard-header enhanced-header">
          <h1 className="dashboard-title">USER MANAGEMENT</h1>
          <div className="dashboard-user enhanced-user-info">
            <span className="user-icon">👤</span>
            <span className="user-info">
              {localStorage.getItem("name")}
              <br />
              <span className="user-type">{localStorage.getItem("role")}</span>
            </span>
          </div>
        </div>

        <div className="users-toolbar enhanced-toolbar">
          <input
            type="text"
            placeholder="Search users..."
            className="users-search enhanced-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <select
            id="roleFilter"
            className="users-role-filter enhanced-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            <option value="">All Roles</option>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            className="add-btn small enhanced-add-btn"
            onClick={() => {
              resetForm();
              setShowAddUserModal(true);
            }}
          >
            + Add User
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table enhanced-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Name</th>
                  <th>Username</th>
                  {/* <th>Phone</th> */}
                  {/* <th>Role</th> */}
                  {/* <th>Department</th> */}
                  {/* <th>Status</th> */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.username}</td>
                      {/* <td>{user.phoneNumber}</td> */}
                      {/* <td>{getRoleLabel(user.role)}</td> */}
                      {/* <td>{user.department?.name || "-"}</td> */}
                      <td>
                        <div className="action-buttons enhanced-actions">
                          <button
                            className="action-btn view enhanced-action-btn"
                            onClick={() => handleViewUser(user)}
                            title="View User"
                          >
                            <span style={{ display: "flex", alignItems: "center" }}>
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
                            className="action-btn edit enhanced-action-btn"
                            onClick={() => handleEditUser(user)}
                            title="Edit User"
                            style={{ marginLeft: 8 }}
                          >
                            <span style={{ display: "flex", alignItems: "center" }}>
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
                            className="action-btn delete enhanced-action-btn"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Delete User"
                            style={{ marginLeft: 8 }}
                          >
                            <span style={{ display: "flex", alignItems: "center" }}>
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
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      {searchTerm
                        ? "No users match your search."
                        : "No users found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit User Modal */}
        {showAddUserModal && (
          <div className="modal-bg enhanced-modal-bg">
            <div className="modal-card enhanced-modal-card">
              <button
                className="modal-close enhanced-modal-close"
                onClick={() => setShowAddUserModal(false)}
              >
                ×
              </button>
              <h2>{selectedUser ? "Edit User" : "Add New User"}</h2>
              <form onSubmit={handleAddUserSubmit} className="">
                <div className="form-row enhanced-form-row">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newUser.name}
                    onChange={handleAddUserChange}
                    required
                    className="enhanced-input"
                  />
                </div>
                <div className="form-row enhanced-form-row">
                    <label htmlFor="username">Username</label>
                    <input
                      type="username"
                      id="username"
                      name="username"
                      value={newUser.username}
                      onChange={handleAddUserChange}
                      required
                      className="enhanced-input"
                    />
                    {formErrors.username && (
                      <span className="form-error">{formErrors.username}</span>
                    )}
                </div>
                {/* <div className="form-row">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={newUser.phoneNumber}
                    onChange={handleAddUserChange}
                    required
                  />
                </div> */}
                <div className="form-row enhanced-form-row">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={newUser.role}
                    onChange={handleAddUserChange}
                    className="form-select enhanced-select"
                    required
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-row enhanced-form-row" ref={deptRef} style={{ position: 'relative' }}>
                  <label htmlFor="departmentId">Department</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Search department..."
                      value={deptQuery}
                      onChange={(e) => { setDeptQuery(e.target.value); setDeptDropdownOpen(true); }}
                      onFocus={() => setDeptDropdownOpen(true)}
                      className="enhanced-input"
                      style={{ flex: 1 }}
                    />
                    <button type="button" className="enhanced-select-toggle" onClick={() => setDeptDropdownOpen(open => !open)} style={{ padding: '6px 10px' }}>{deptDropdownOpen ? '▲' : '▾'}</button>
                  </div>

                  {deptDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 120, background: '#fff', border: '1px solid #eee', borderRadius: 8, maxHeight: 220, overflowY: 'auto', marginTop: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
                      {departments.filter(d => d.name.toLowerCase().includes(deptQuery.toLowerCase())).map(d => (
                        <div key={d.id} onClick={() => { setNewUser(prev => ({ ...prev, departmentId: d.id.toString() })); setDeptQuery(d.name); setDeptDropdownOpen(false); }} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #fbfbfb' }}>
                          {d.name}
                        </div>
                      ))}
                      {departments.filter(d => d.name.toLowerCase().includes(deptQuery.toLowerCase())).length === 0 && (
                        <div style={{ padding: 12, color: '#666' }}>No departments</div>
                      )}
                    </div>
                  )}

                  {formErrors.departmentId && (
                    <span className="form-error">{formErrors.departmentId}</span>
                  )}
                </div>
                {/* <div className="form-row">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleAddUserChange}
                    required={!selectedUser}
                    placeholder={
                      selectedUser ? "Leave blank to keep current password" : ""
                    }
                  />
                </div> */}
                {/* <div className="form-row">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={newUser.confirmPassword}
                    onChange={handleAddUserChange}
                    required={!selectedUser}
                    placeholder={
                      selectedUser ? "Leave blank to keep current password" : ""
                    }
                  />
                </div> */}
                <div className="form-actions enhanced-form-actions">
                  <button
                    type="button"
                    className="enhanced-cancel-btn"
                    onClick={() => setShowAddUserModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="enhanced-submit-btn"
                    onClick={(e) => {
                      handleAddUserSubmit(e);
                    }}
                  >
                    {selectedUser ? "Update User" : "Add User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showUserDetailsModal && selectedUser && (
          <div className="modal-bg enhanced-modal-bg">
            <div className="modal-card enhanced-modal-card">
              <button
                className="modal-close enhanced-modal-close"
                onClick={() => setShowUserDetailsModal(false)}
              >
                ×
              </button>
              <h2>User Details</h2>
              <div className="user-details enhanced-user-details">
                <div className="user-detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedUser.name}</span>
                </div>
                <div className="user-detail-item">
                  <span className="detail-label">Username:</span>
                  <span className="detail-value">{selectedUser.username}</span>
                </div>
                {/* <div className="user-detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">
                    {selectedUser.phoneNumber}
                  </span>
                </div> */}
                <div className="user-detail-item">
                  <span className="detail-label">Role:</span>
                  <span className="detail-value">
                    {getRoleLabel(selectedUser.role)}
                  </span>
                </div>
                <div className="user-detail-item">
                  <span className="detail-label">Department:</span>
                  <span className="detail-value">
                    {selectedUser.department?.name || "-"}
                  </span>
                </div>
              </div>
              <div className="form-actions enhanced-form-actions">
                <button
                  className="edit-btn enhanced-edit-btn"
                  onClick={() => {
                    setShowUserDetailsModal(false);
                    handleEditUser(selectedUser);
                  }}
                >
                  Edit User
                </button>
                <button
                  className="delete-btn enhanced-delete-btn"
                  onClick={() => {
                    setShowUserDetailsModal(false);
                    handleDeleteUser(selectedUser.id);
                  }}
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <style>{`
       
      `}</style>
    </div>
  );
};

export default Users;
