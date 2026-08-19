import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './Manager.css';
import Sidebar from './Sidebar';

const TireLog = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const request = location.state?.request;
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const [form, setForm] = useState({
    plateNumber: request?.vehicle?.plateNumber || request?.vehiclePlateNumber || '',
    vehicleId: request?.vehicle?.id || request?.vehicleId || '',
    oldTireBrand: request?.oldTireBrand || '',
    oldTireSerialNumber: request?.oldTireSerialNumber || '',
    oldTireMountDate: request?.oldTireMountDate || '',
    tirePosition: request?.tirePosition || '',
    odometerAtReplacement: request?.odometerAtReplacement || '',
    newTireBrand: '',
    newTireSerialNumber: '',
    newTireMountDate: '',
    replacedById: '',
  });

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users'); // Update this endpoint as needed
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };
    fetchUsers();
  }, []);

  if (!request) {
    return (
      <p style={{ padding: '2rem', color: 'red' }}>
        No request selected. Please return to the approved requests page.
      </p>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...form,
        requestId: request.id,
      };

      await api.post('/tire-replacement/logs', payload);
      // alert('Tire replacement log saved successfully.');
      navigate('/fms/manager/tire-replacement');
    } catch (err) {
      setError('Failed to save log. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  

  return (
    <div className="manager-dashboard-layout">
      <Sidebar />
      <main className="manager-dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Add Tire Replacement Log</h1>
        </div>
        {error && <p className="error-message">{error}</p>}

        <form className="log-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Plate Number</label>
            <input type="text" name="plateNumber" value={form.plateNumber} disabled />
          </div>

          <div className="form-group">
            <label>Old Tire Brand</label>
            <input type="text" name="oldTireBrand" value={form.oldTireBrand} disabled />
          </div>

          <div className="form-group">
            <label>Old Tire Serial Number</label>
            <input type="text" name="oldTireSerialNumber" value={form.oldTireSerialNumber} disabled />
          </div>

          <div className="form-group">
            <label>Old Tire Mount Date</label>
            <input type="date" name="oldTireMountDate" value={form.oldTireMountDate} disabled />
          </div>

          <div className="form-group">
            <label>New Tire Brand</label>
            <input type="text" name="newTireBrand" value={form.newTireBrand} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>New Tire Serial Number</label>
            <input type="text" name="newTireSerialNumber" value={form.newTireSerialNumber} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>New Tire Mount Date</label>
            <input type="date" name="newTireMountDate" value={form.newTireMountDate} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Odometer at Replacement</label>
            <input type="number" name="odometerAtReplacement" value={form.odometerAtReplacement} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Replaced By</label>
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <div
                className="custom-dropdown-input"
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  padding: "8px 12px",
                  background: dropdownOpen ? "#fff" : "#f7f7f7",
                  cursor: "pointer",
                  minHeight: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
                onClick={() => setDropdownOpen((open) => !open)}
                tabIndex={0}
              >
                <span style={{ color: form.replacedById ? "#222" : "#888" }}>
                  {form.replacedById
                    ? (() => {
                        const selected = users.find(u => u.id === form.replacedById);
                        return selected ? `${selected.name} (${selected.role})` : "-- Select User --";
                      })()
                    : "-- Select User --"}
                </span>
                <span style={{ marginLeft: 8, fontSize: 18 }}>&#9662;</span>
              </div>
              {dropdownOpen && (
                <div
                  className="custom-dropdown-list"
                  style={{
                    position: "absolute",
                    top: 44,
                    left: 0,
                    width: "100%",
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    zIndex: 10,
                    maxHeight: 220,
                    overflowY: "auto"
                  }}
                >
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search user by name or username..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    style={{
                      width: "96%",
                      margin: "8px 2% 8px 2%",
                      padding: 6,
                      border: "1px solid #eee",
                      borderRadius: 4
                    }}
                  />
                  <div style={{ maxHeight: 160, overflowY: "auto" }}>
                    {users
                      .filter(user =>
                        user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                        user.username?.toLowerCase().includes(userSearch.toLowerCase())
                      )
                      .map((user) => (
                        <div
                          key={user.id}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            background: form.replacedById === user.id ? "#e6f7ff" : "#fff",
                            borderBottom: "1px solid #f0f0f0"
                          }}
                          onClick={() => {
                            setForm(f => ({ ...f, replacedById: user.id }));
                            setDropdownOpen(false);
                            setUserSearch("");
                          }}
                        >
                          {user.name} <span style={{ color: "#888" }}>({user.role})</span>
                        </div>
                      ))}
                    {users.filter(user =>
                        user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                        user.username?.toLowerCase().includes(userSearch.toLowerCase())
                      ).length === 0 && (
                        <div style={{ padding: 12, color: "#888", textAlign: "center" }}>
                          No users found
                        </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Saving...' : 'Submit Log'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default TireLog;
