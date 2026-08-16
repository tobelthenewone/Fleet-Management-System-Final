import React, { useState, useEffect, useRef } from 'react';
import RequestNavigationBar from './RequestNavigationBar';
import api from '../../api/axios';
import { useLocation } from 'react-router-dom';

const statusMap = {
  PENDING: 'PENDING',
  UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
};

const emptyForm = {
  vehicleId: '',
  maintenanceDetail: '',
  maintenanceType: '',
  urgencyLevel: '',
  requestedDate: '',
};

const MaintenanceRequest = () => {
  const [requests, setRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null); // request being edited
  const [filterStatus, setFilterStatus] = useState(useLocation().state?.statusFilter || null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchRequests();
    fetchVehicles();
  }, []);

  useEffect(() => {
    // close action menu on outside click
    const handleDoc = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleDoc);
    return () => document.removeEventListener('click', handleDoc);
  }, []);

  const showToast = (message, type = 'success', ttl = 4000) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 7);
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), ttl);
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/driver/maintenance-requests');
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data || []);
    } catch (err) {
      console.error('Error fetching vehicles', err);
    }
  };

  const openCreateForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (req) => {
    setEditing(req);
    setForm({
      vehicleId: String(req.vehicleId || ''),
      maintenanceDetail: req.maintenanceDetail || '',
      maintenanceType: req.maintenanceType || '',
      urgencyLevel: req.urgencyLevel || '',
      requestedDate: req.requestedDate || '',
    });
    setShowForm(true);
    setOpenMenuId(null);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      const selectedVehicle = vehicles.find(v => v.id === parseInt(form.vehicleId));
      const payload = {
        ...form,
        plateNumber: selectedVehicle?.plateNumber || '',
        status: editing ? editing.status : 'PENDING',
      };

      if (editing) {
        await api.put(`/driver/maintenance-requests/${editing.id}`, payload);
        showToast('Request updated');
      } else {
        await api.post('/driver/maintenance-requests', payload);
        showToast('Request created');
      }

      await fetchRequests();
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      setError(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to save request', 'error');
      setError('Failed to submit maintenance request');
    }
  };

  const handleDelete = async (reqId) => {
    if (!window.confirm('Delete this maintenance request?')) return;
    try {
      await api.delete(`/driver/maintenance-requests/${reqId}`);
      showToast('Request deleted');
      await fetchRequests();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete', 'error');
    }
    setOpenMenuId(null);
  };

  const filteredRequests = requests.filter(req =>
    (filterStatus ? req.status === filterStatus : true) &&
    (
      (req.maintenanceDetail || '').toLowerCase().includes(search.toLowerCase()) ||
      (vehicles.find(v => v.id === req.vehicleId)?.plateNumber || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="manager-dashboard-layout">
      <RequestNavigationBar />
      <main
        className={`manager-dashboard-main ${showForm ? 'blurred' : ''}`}
        style={{
          width: '100vw',
          maxWidth: 1500,
          margin: '0 auto',
          padding: '32px',
          background: '#fafbfc',
          minHeight: 'calc(100vh - 64px)',
          boxSizing: 'border-box',
          overflowX: 'auto',
          borderRadius: 18,
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        }}
      >
        <div className="dashboard-header">
          <h1 className="dashboard-title">Maintenance Requests</h1>
          <button onClick={openCreateForm} className="btn  new-request-btn">New Request</button>
        </div>

        <div className="filter-tabs">
          {['PENDING', 'UNDER_MAINTENANCE', 'COMPLETED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`tab-btn ${filterStatus === status ? 'active' : ''}`}
            >
              {status === 'PENDING' ? 'Submitted' : status.charAt(0) + status.slice(1).toLowerCase()} Requests
            </button>
          ))}
          <button onClick={() => setFilterStatus(null)} className={`tab-btn ${filterStatus === null ? 'active' : ''}`}>
            All
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="search-input"
        />

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Plate</th>
                  <th>Driver Name</th>
                  <th>Type</th>
                  <th>Request Detail</th>
                  <th>Urgency</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req, index) => {
                  const vehicle = vehicles.find(v => v.id === req.vehicleId);
                  return (
                    <tr key={req.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '10px 12px' }}>{index + 1}</td>
                      <td style={{ padding: '10px 12px' }}>{vehicle?.plateNumber || 'N/A'}</td>
                      <td style={{ padding: '10px 12px' }}>{req.driverName}</td>
                      <td style={{ padding: '10px 12px' }}>{req.maintenanceType || 'N/A'}</td>
                      <td style={{ padding: '10px 12px', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.maintenanceDetail}</td>
                      <td style={{ padding: '10px 12px' }}>{req.urgencyLevel}</td>
                      <td style={{ padding: '10px 12px' }}>{req.requestedDate}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ padding: '6px 10px', borderRadius: 8, background: '#f7f9fb', border: '1px solid #eef3fb', fontSize: 12 }}>{statusMap[req.status] || req.status}</span>
                      </td>
                      <td style={{ padding: '6px 12px', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }} ref={menuRef}>
                        <button
                          onClick={() => openEditForm(req)}
                          title="Edit"
                          style={{ background: '#fff', border: '1px solid #d9e2ef', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(req.id)}
                          title="Delete"
                          style={{ background: '#fff', border: '1px solid #f3c6c6', color: '#c33', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}
                        >
                          Delete
                        </button>

                        <div style={{ position: 'relative' }}>
                          {/* <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === req.id ? null : req.id); }}
                            style={{ padding: '6px 10px', borderRadius: 6, background: '#fff', border: '1px solid #e6eef8', cursor: 'pointer' }}
                            aria-haspopup="true"
                            aria-expanded={openMenuId === req.id}
                          >
                            ⋮
                          </button> */}
{/* 
                          {openMenuId === req.id && (
                            <div style={{
                              position: 'absolute',
                              right: 0,
                              top: '36px',
                              background: '#fff',
                              border: '1px solid #eee',
                              borderRadius: 8,
                              boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                              zIndex: 80,
                              minWidth: 140,
                            }}>
                              <button onClick={() => { openEditForm(req); }} style={{ display: 'block', width: '100%', padding: 10, border: 'none', background: 'transparent', textAlign: 'left' }}>Edit</button>
                              <button onClick={() => { handleDelete(req.id); }} style={{ display: 'block', width: '100%', padding: 10, border: 'none', background: 'transparent', textAlign: 'left', color: '#c00' }}>Delete</button>
                            </div>
                          )} */}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showForm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="view-modal" style={{ width: 760, maxWidth: '96%', background: '#fff', padding: 0, borderRadius: 10, display: 'flex', flexDirection: 'column', maxHeight: '80vh', overflow: 'hidden' }}>
            <div style={{ padding: 18, borderBottom: '1px solid #f1f3f5' }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>{editing ? 'Edit Maintenance Request' : 'New Maintenance Request'}</h2>
            </div>

            <form onSubmit={submitForm} className="modal-form" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div style={{ padding: 18, overflowY: 'auto', flex: 1 }}>
                <select name="vehicleId" value={form.vehicleId} onChange={handleChange} required style={{ width: '100%', marginBottom: 10 }}>
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plateNumber}</option>
                  ))}
                </select>

                <label htmlFor="maintenanceType">Maintenance Type</label>
                <select
                  name="maintenanceType"
                  value={form.maintenanceType}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', marginBottom: 10 }}
                >
                  <option value="">Select Type</option>
                  <option value="PREVENTIVE">Preventive</option>
                  <option value="CORRECTIVE">Corrective</option>
                </select>

                <label htmlFor="maintenanceDetail">Maintenance Detail</label>
                <textarea
                  name="maintenanceDetail"
                  value={form.maintenanceDetail}
                  onChange={handleChange}
                  placeholder="Describe the maintenance needed..."
                  required
                  rows="6"
                  style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />

                <label htmlFor="urgencyLevel">Urgency Level</label>
                <select name="urgencyLevel" value={form.urgencyLevel} onChange={handleChange} required style={{ width: '100%', marginBottom: 10 }}>
                  <option value="">Select Urgency</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>

                <label htmlFor="requestedDate">Requested Date</label>
                <input
                  type="date"
                  name="requestedDate"
                  value={form.requestedDate}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', marginBottom: 14 }}
                />
              </div>

              <div className="modal-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: 12, borderTop: '1px solid #f1f3f5' }}>
                <button type="button" className="add-btn small" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
                <button type="submit" className="add-btn">{editing ? 'Save' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 200 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: t.type === 'error' ? '#ffe6e6' : '#fff', border: '1px solid #eee', padding: '10px 14px', borderRadius: 8, marginTop: 8, minWidth: 180 }}>
            {t.message}
          </div>
        ))}
      </div>
         {/* Inline CSS for hover effects */}
      <style>{`
        .new-request-btn:hover {
          background: #1976d2 !important;
          color: #fff !important;
          border: 1px solid #1976d2 !important;
          box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);

        }
        .new-request-btn{
            border: 1px solid #1976d2 !important;
            box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
            font-weight: 600;
          }
        .tab-btn {
          transition: background 0.2s, color 0.2s;
        }
        .tab-btn:hover:not(.active) {
          background: #e3eafc;
          color: #1976d2;
        }
        .action-btn {
          transition: background 0.2s, color 0.2s, border 0.2s;
        }
        .edit-btn:hover {
          background: #e3eafc;
          color: #1976d2;
          border: 1px solid #1976d2;
        }
        .delete-btn:hover {
          background: #fbe9e9;
          color: #c33;
          border: 1px solid #c33;
        }
        .add-btn:hover {
          background: #1976d2;
          color: #fff;
        }

      `}</style>
    </div>
  );
};

export default MaintenanceRequest;
