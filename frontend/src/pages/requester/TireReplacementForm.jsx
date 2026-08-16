import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import RequestNavigationBar from './RequestNavigationBar';
import './Request.css';

const statusMap = {
  'PENDING': 'Pending',
  'VERIFIED': 'Verified',
  'APPROVED': 'Approved',
  'REJECTED': 'Rejected',
};

const TireReplacementRequest = () => {
  const [vehicles, setVehicles] = useState([]);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  const [formData, setFormData] = useState({
    dateOfRequest: '',
    vehicleId: '',
    oldTireMountDate: '',
    oldTireBrand: '',
    oldTireSerialNumber: '',
    tirePosition: '',
    odometerAtMounting: '',
    currentOdometer: '',
    reasonForReplacement: ''
  });

  useEffect(() => {
    fetchRequests();
    fetchVehicles();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tire-replacement');
      setRequests(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch tire replacement requests');
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data);
    } catch (err) {
      setError('Failed to load vehicles');
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/tire-replacement/${editingId}`, formData);
      } else {
        await api.post('/tire-replacement/request', formData);
      }
      fetchRequests();
      resetForm();
    } catch (err) {
      setError('Failed to submit request');
    }
  };

  const resetForm = () => {
    setFormData({
      dateOfRequest: '',
      vehicleId: '',
      oldTireMountDate: '',
      oldTireBrand: '',
      oldTireSerialNumber: '',
      tirePosition: '',
      odometerAtMounting: '',
      currentOdometer: '',
      reasonForReplacement: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (request) => {
    setFormData({
      dateOfRequest: request.dateOfRequest?.split('T')[0] || '',
      vehicleId: request.vehicleId || '',
      oldTireMountDate: request.oldTireMountDate || '',
      oldTireBrand: request.oldTireBrand || '',
      oldTireSerialNumber: request.oldTireSerialNumber || '',
      tirePosition: request.tirePosition || '',
      odometerAtMounting: request.odometerAtMounting || '',
      currentOdometer: request.currentOdometer || '',
      reasonForReplacement: request.reasonForReplacement || ''
    });
    setEditingId(request.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tire replacement request?')) return;
    try {
      await api.delete(`/tire-replacement/${id}`);
      await fetchRequests();
    } catch (err) {
      setError('Failed to delete tire replacement request');
    }
  };

  const filteredRequests = requests.filter(req =>
    (filterStatus ? req.status === filterStatus : true) &&
    (
      vehicles.find(v => v.id === req.vehicleId)?.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      req.reasonForReplacement.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="manager-dashboard-layout">
      <RequestNavigationBar />
      <main className={`manager-dashboard-main ${showForm ? 'blurred' : ''}`}
              style={{
          width: '100vw',
          maxWidth: 1500,
          margin: '0 auto',
          padding: '32px 32px 32px 32px',
          background: '#fafbfc',
          minHeight: 'calc(100vh - 64px)',
          boxSizing: 'border-box',
          overflowX: 'auto',
          borderRadius: 18,
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        }}>
        <div className="dashboard-header">
          <h1 className="dashboard-title">Tire Replacement Requests</h1>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary new-request-btn"
            style={{
              background: '#fff',
              color: '#000000',
              border: 'none',
              borderRadius: 6,
              padding: '10px 20px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '1px 2px 8px rgba(25, 118, 210, 0.08)',
              transition: 'background 0.2s, color 0.2s'
            }}
          >
            New Request
          </button>
        </div>

        <div className="filter-tabs">
          {['PENDING', 'VERIFIED', 'APPROVED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`tab-btn ${filterStatus === status ? 'active' : ''}`}
            >
              {statusMap[status]}
            </button>
          ))}
          <button onClick={() => setFilterStatus(null)} className={`tab-btn ${filterStatus === null ? 'active' : ''}`}>
            All
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by Plate or Reason..."
          className="search-input"
        />

        {loading ? <p>Loading...</p> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Plate Number</th>
                  <th>Request Date</th>
                  <th>Tire Position</th>
                  <th>Mount Date</th>
                  <th>Brand</th>
                  <th>Serial</th>
                  <th>Odometer At Mounting</th>
                  <th>Current Odometer</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                 {filteredRequests.map((req, index) => {
                const vehicle = vehicles.find(v => v.id === req.vehicleId);
                
                  return (
                    <tr key={req.id}>
                      <td>{index + 1}</td>
                      <td>{vehicle?.plateNumber || 'N/A'}</td>
                      <td>{new Date(req.dateOfRequest).toLocaleDateString()}</td>
                      <td>{req.tirePosition}</td>
                      <td>{req.oldTireMountDate}</td>
                      <td>{req.oldTireBrand}</td>
                      <td>{req.oldTireSerialNumber}</td>
                      <td>{req.odometerAtMounting}</td>
                      <td>{req.currentOdometer}</td>
                      <td>{req.reasonForReplacement}</td>
                      <td>{statusMap[req.status]}</td>
                      <td style={{ padding: '6px 12px', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleEdit(req)}
                          title="Edit"
                          className="action-btn edit-btn"
                          style={{
                            background: '#fff',
                            border: '1px solid #d9e2ef',
                            padding: '6px 10px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            transition: 'background 0.2s, color 0.2s, border 0.2s'
                          }}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(req.id)}
                          title="Delete"
                          className="action-btn delete-btn"
                          style={{
                            background: '#fff',
                            border: '1px solid #f3c6c6',
                            color: '#c33',
                            padding: '6px 10px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            transition: 'background 0.2s, color 0.2s, border 0.2s'
                          }}
                        >
                          Delete
                        </button>
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
        <div className="modal-overlay">
          <div className="modal-content view-modal">
            <h2>{editingId ? 'Edit Tire Replacement Request' : 'New Tire Replacement Request'}</h2>
            <form onSubmit={handleSubmit} className="modal-form">
              <label>Date of Request</label>
              <input type="date" name="dateOfRequest" value={formData.dateOfRequest} onChange={handleChange} required />

              <label>Vehicle</label>
              <select name="vehicleId" value={formData.vehicleId} onChange={handleChange} required>
                <option value="">Select Vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.plateNumber}</option>
                ))}
              </select>

              <label>Date of Mounting (Old Tire)</label>
              <input type="date" name="oldTireMountDate" value={formData.oldTireMountDate} onChange={handleChange} required />

              <label>Brand</label>
              <input type="text" name="oldTireBrand" value={formData.oldTireBrand} onChange={handleChange} required />

              <label>Serial Number</label>
              <input type="text" name="oldTireSerialNumber" value={formData.oldTireSerialNumber} onChange={handleChange} required />

              <label>Position</label>
              <select name="tirePosition" value={formData.tirePosition} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="FRONT_LEFT">Front Left</option>
                <option value="FRONT_RIGHT">Front Right</option>
                <option value="REAR_LEFT">Rear Left</option>
                <option value="REAR_RIGHT">Rear Right</option>
                <option value="SPARE">Spare</option>
              </select>

              <label>Odometer at Mounting</label>
              <input type="number" name="odometerAtMounting" value={formData.odometerAtMounting} onChange={handleChange} required />

              <label>Current Odometer</label>
              <input type="number" name="currentOdometer" value={formData.currentOdometer} onChange={handleChange} required />

              <label>Reason for Replacement</label>
              <textarea name="reasonForReplacement" value={formData.reasonForReplacement} onChange={handleChange} required />

              <div className="modal-buttons">
                <button type="button" className="add-btn small" onClick={resetForm}>Cancel</button>
                <button type="submit" className="add-btn">{editingId ? 'Update' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inline CSS for hover effects */}
      <style>{`
        .new-request-btn:hover {
          background: #1976d2 !important;
          color: #fff !important;
        }
        .new-request-btn{
            border: 1px solid #1976d2 !important;
            box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
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

export default TireReplacementRequest;
