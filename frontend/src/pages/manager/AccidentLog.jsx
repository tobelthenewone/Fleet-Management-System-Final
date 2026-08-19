import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './AccidentLog.css';
import api from '../../api/axios';

const AccidentLog = () => {
  const [showForm, setShowForm] = useState(false);
  const [accidentLogs, setAccidentLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    vehicleId: '',
    accidentDate: '',
    fault: '',
    insuranceClaim: '',
    policeReport: '',
    remark: '',
    insuranceClaimedAt: null,
    policeReportedAt: null,
    insuranceSurveyedAt: null,
    repairedAt: null,
    releasedAt: null
  });
  const [search, setSearch] = useState('');
  const [viewAccident, setViewAccident] = useState(null);
  const [editAccident, setEditAccident] = useState(null);

  const statusOptions = [
    { value: 'INSURANCE_CLAIMED', label: 'Insurance Claimed' },
    { value: 'POLICE_REPORTED', label: 'Police Reported' },
    { value: 'INSURANCE_SURVEYED', label: 'Insurance Surveyed' },
    { value: 'REPAIRED', label: 'Repaired' },
    { value: 'RELEASED', label: 'Released' }
  ];

  useEffect(() => {
    fetchAccidentLogs();
    fetchVehicles();
  }, []);

  const fetchAccidentLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/logistics/accidents');
      if (response.status !== 200) {
        throw new Error('Failed to fetch accident logs');
      }
      setAccidentLogs(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      if (response.status !== 200) {
        throw new Error('Failed to fetch vehicles');
      }
      setVehicles(response.data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await api.post('/logistics/accidents', form);
      await fetchAccidentLogs();
      setShowForm(false);
      setForm({
        vehicleId: '',
        accidentDate: '',
        fault: '',
        insuranceClaim: '',
        policeReport: '',
        remark: '',
        insuranceClaimedAt: null,
        policeReportedAt: null,
        insuranceSurveyedAt: null,
        repairedAt: null,
        releasedAt: null
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async id => {
    // if (window.confirm('Are you sure you want to delete this accident record?')) {
      try {
        const response = await api.delete(`/logistics/accidents/${id}`);
        await fetchAccidentLogs();
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    // }
  };

  const getLatestStatus = (accident) => {
    const statuses = [
      { status: 'Released: ', timestamp: accident.releasedAt },
      { status: 'Repaired: ', timestamp: accident.repairedAt },
      { status: 'Insurance Surveyed: ', timestamp: accident.insuranceSurveyedAt },
      { status: 'Police Reported: ', timestamp: accident.policeReportedAt },
      { status: 'Insurance Claimed: ', timestamp: accident.insuranceClaimedAt }
    ];
    
    return statuses.find(s => s.timestamp) || { status: 'No Status', timestamp: null };
  };

  const handleEdit = a => {
    setEditAccident(a);
    setForm({
      vehicleId: a.vehicleId,
      accidentDate: a.accidentDate,
      fault: a.fault,
      insuranceClaim: a.insuranceClaim,
      policeReport: a.policeReport,
      remark: a.remark,
      insuranceClaimedAt: a.insuranceClaimedAt,
      policeReportedAt: a.policeReportedAt,
      insuranceSurveyedAt: a.insuranceSurveyedAt,
      repairedAt: a.repairedAt,
      releasedAt: a.releasedAt
    });
    setShowForm(true);
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    try {
      const response = await api.put(`/logistics/accidents/${editAccident.id}`, form);
      if (response.status !== 200) {
        throw new Error('Failed to update accident log');
      }
      await fetchAccidentLogs();
      setEditAccident(null);
      setShowForm(false);
      setForm({
        vehicleId: '',
        accidentDate: '',
        fault: '',
        insuranceClaim: '',
        policeReport: '',
        remark: '',
        insuranceClaimedAt: null,
        policeReportedAt: null,
        insuranceSurveyedAt: null,
        repairedAt: null,
        releasedAt: null
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (accidentId, status) => {
    try {
      const response = await api.put(`/logistics/accidents/${accidentId}/status?status=${status}`);
      await fetchAccidentLogs();
    } catch (error) {
      console.error('Failed to update accident status:', error);
      // alert('Failed to update accident status');
    }
  };

  const handleView = (accident) => {
    setViewAccident(accident);
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'Not set';
    return new Date(dateTimeStr).toLocaleString();
  };

  const filteredLogs = accidentLogs.filter(log => {
    const vehicle = vehicles.find(v => v.id === log.vehicleId);
    return (
      log.fault.toLowerCase().includes(search.toLowerCase()) ||
      log.insuranceClaim.toLowerCase().includes(search.toLowerCase()) ||
      log.policeReport.toLowerCase().includes(search.toLowerCase()) ||
      (vehicle && vehicle.plateNumber.toLowerCase().includes(search.toLowerCase()))
    );
  });

  if (loading) {
    return (
      <div className="manager-dashboard-layout">
        <Sidebar />
        <main className="manager-dashboard-main">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Accident Logs</h1>
          </div>
          <div className="loading">Loading accident logs...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="manager-dashboard-layout">
      <Sidebar />
      <main className="manager-dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Accident Logs</h1>
        </div>
        {error && <div className="error-message">{error}</div>}
        {!showForm ? (
          <>
            <div className="vehicles-toolbar">
              <input
                className="vehicles-search"
                type="text"
                placeholder="Search by fault, insurance claim, police report, or plate number..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button className="add-btn small" onClick={() => setShowForm(true)}>+ Add New Accident Record</button>
            </div>
            <div className="table-container">
              <table className="vehicles-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Date</th>
                    {/* <th>Fault</th> */}
                    {/* <th>Insurance Claim</th> */}
                    {/* <th>Police Report</th> */}
                    <th>Latest Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => {
                    const latestStatus = getLatestStatus(log);
                    return (
                      <tr key={log.id}>
                        <td>{index + 1}</td>
                        <td>{new Date(log.accidentDate).toLocaleDateString()}</td>
                        {/* <td>{log.fault}</td>
                        <td>{log.insuranceClaim}</td>
                        <td>{log.policeReport}</td> */}
                        <td>
                          <div className="latest-status">
                            <span className="status-label">{latestStatus.status}</span>
                            {latestStatus.timestamp && (
                              <span className="status-time">{formatDateTime(latestStatus.timestamp)}</span>
                            )}
                          </div>
                          <select
                            value=""
                            onChange={(e) => handleStatusChange(log.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="">Update Status</option>
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button className="action-btn view" onClick={() => handleView(log)}>View</button>
                          <button className="action-btn edit" onClick={() => handleEdit(log)}>Edit</button>
                          <button className="action-btn delete" onClick={() => handleDelete(log.id)}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="modal-overlay">
            <div className="modal-content accident-form-modal">
              <button className="modal-close" onClick={() => {
                setShowForm(false);
                setEditAccident(null);
                setForm({
                  vehicleId: '',
                  accidentDate: '',
                  fault: '',
                  insuranceClaim: '',
                  policeReport: '',
                  remark: '',
                  insuranceClaimedAt: null,
                  policeReportedAt: null,
                  insuranceSurveyedAt: null,
                  repairedAt: null,
                  releasedAt: null
                });
              }}>&times;</button>
              
              <form className="accident-form-modern" onSubmit={editAccident ? handleEditSubmit : handleSubmit}>
                <h2 className="form-title">{editAccident ? 'Edit Accident Record' : 'Add New Accident Record'}</h2>
                
                {/* Accident Information Section */}
                <div className="form-section-modern">
                  <div className="section-header"><span className="section-icon">🚨</span> Accident Information</div>
                  <div className="form-grid-3col">
                    <div className="form-row">
                      <label>Vehicle *</label>
                      <select name="vehicleId" value={form.vehicleId} onChange={handleChange} required className="form-select">
                        <option value="">Select a vehicle</option>
                        {vehicles.map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.plateNumber}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-row">
                      <label>Accident Date *</label>
                      <input
                        type="date"
                        name="accidentDate"
                        value={form.accidentDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="form-section-modern">
                  <div className="section-header"><span className="section-icon">📝</span> Accident Details</div>
                  <div className="form-grid-3col">
                    <div className="form-row">
                      <label>Fault *</label>
                      <input
                        type="text"
                        name="fault"
                        value={form.fault}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    {/* <div className="form-row">
                      <label>Insurance Claim *</label>
                      <input
                        type="text"
                        name="insuranceClaim"
                        value={form.insuranceClaim}
                        onChange={handleChange}
                        required
                      />
                    </div> */}
                    
                    {/* <div className="form-row">
                      <label>Police Report *</label>
                      <input
                        type="text"
                        name="policeReport"
                        value={form.policeReport}
                        onChange={handleChange}
                        required
                      />
                    </div> */}
                    
                    <div className="form-row">
                      <label>Remark</label>
                      <textarea
                        name="remark"
                        value={form.remark}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Status History Section (Display only in Edit mode) */}
                {editAccident && (
                  <div className="form-section-modern">
                    <div className="section-header"><span className="section-icon">⏳</span> Status History</div>
                    <div className="form-row">
                       {editAccident.insuranceClaimedAt && (
                         <p><strong>Insurance Claimed:</strong> {formatDateTime(editAccident.insuranceClaimedAt)}</p>
                       )}
                       {editAccident.policeReportedAt && (
                         <p><strong>Police Reported:</strong> {formatDateTime(editAccident.policeReportedAt)}</p>
                       )}
                       {editAccident.insuranceSurveyedAt && (
                         <p><strong>Insurance Surveyed:</strong> {formatDateTime(editAccident.insuranceSurveyedAt)}</p>
                       )}
                       {editAccident.repairedAt && (
                         <p><strong>Repaired:</strong> {formatDateTime(editAccident.repairedAt)}</p>
                       )}
                       {editAccident.releasedAt && (
                         <p><strong>Released:</strong> {formatDateTime(editAccident.releasedAt)}</p>
                       )}
                       {!editAccident.insuranceClaimedAt && !editAccident.policeReportedAt && !editAccident.insuranceSurveyedAt && !editAccident.repairedAt && !editAccident.releasedAt && (
                          <p>No status history available.</p>
                       )}
                    </div>
                  </div>
                )}
                
                <div className="form-actions-modern">
                  <button type="submit" className="submit-btn-modern">
                    {editAccident ? 'Update' : 'Add'} Accident Record
                  </button>
                  <button
                    type="button"
                    className="cancel-btn-modern"
                    onClick={() => {
                      setShowForm(false);
                      setEditAccident(null);
                      setForm({
                        vehicleId: '',
                        accidentDate: '',
                        fault: '',
                        insuranceClaim: '',
                        policeReport: '',
                        remark: '',
                        insuranceClaimedAt: null,
                        policeReportedAt: null,
                        insuranceSurveyedAt: null,
                        repairedAt: null,
                        releasedAt: null
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
      {viewAccident && (
        <div className="modal-overlay">
          <div className="modal-content view-modal">
            <button className="modal-close" onClick={() => setViewAccident(null)}>&times;</button>
            <h2>Accident Details</h2>
            <div className="accident-details-grid">
              <div><b>Vehicle:</b> {vehicles.find(v => v.id === viewAccident.vehicleId)?.plateNumber || 'Unknown'}</div>
              <div><b>Accident Date:</b> {new Date(viewAccident.accidentDate).toLocaleDateString()}</div>
              <div><b>Fault:</b> {viewAccident.fault}</div>
              <div><b>Insurance Claim:</b> {viewAccident.insuranceClaim}</div>
              <div><b>Police Report:</b> {viewAccident.policeReport}</div>
              <div><b>Remark:</b> {viewAccident.remark || 'N/A'}</div>
            </div>
            
            <div className="status-history-section">
              <h3>Status History</h3>
              <div className="status-timestamps">
                {viewAccident.insuranceClaimedAt && (
                  <div>Insurance Claimed: {formatDateTime(viewAccident.insuranceClaimedAt)}</div>
                )}
                {viewAccident.policeReportedAt && (
                  <div>Police Reported: {formatDateTime(viewAccident.policeReportedAt)}</div>
                )}
                {viewAccident.insuranceSurveyedAt && (
                  <div>Insurance Surveyed: {formatDateTime(viewAccident.insuranceSurveyedAt)}</div>
                )}
                {viewAccident.repairedAt && (
                  <div>Repaired: {formatDateTime(viewAccident.repairedAt)}</div>
                )}
                {viewAccident.releasedAt && (
                  <div>Released: {formatDateTime(viewAccident.releasedAt)}</div>
                )}
                {!viewAccident.insuranceClaimedAt && !viewAccident.policeReportedAt && !viewAccident.insuranceSurveyedAt && !viewAccident.repairedAt && !viewAccident.releasedAt && (
                   <div>No status history available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccidentLog; 