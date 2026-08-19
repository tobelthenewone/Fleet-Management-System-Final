import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

  
import Sidebar from './Sidebar';
import './Manager.css';
import api from '../../api/axios';
import MaintenanceRequest from './MaintenanceRequest';

const MaintenanceLog = () => {
  const [showForm, setShowForm] = useState(false);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('maintenance');
  const [form, setForm] = useState({
    vehicleId: '',
    type: '',
    description: '',
    cost: '',
    date: '',
    requestId: '',
    contribution: 0,
    excess: 0
  });
  const [search, setSearch] = useState('');
  const [viewMaintenance, setViewMaintenance] = useState(null);
  const [editMaintenance, setEditMaintenance] = useState(null);
  // Bulk import state
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  useEffect(() => {
    fetchMaintenanceLogs();
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (viewMode === 'requests') {
      fetchMaintenanceRequests();
    }
  }, [viewMode]);

  const fetchMaintenanceLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/logistics/maintenances');
      if (response.status !== 200) throw new Error('Failed to fetch maintenance logs');
      setMaintenanceLogs(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceRequests = async () => {
    try {
      const response = await api.get('/driver/maintenance-requests');
      if (response.status === 200) {
        setMaintenanceRequests(response.data);
      }
    } catch (err) {
      console.error('Error fetching maintenance requests:', err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      if (response.status !== 200) throw new Error('Failed to fetch vehicles');
      setVehicles(response.data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        requestId: form.requestId || null // Convert empty string to null
      };

      const response = await api.post('/logistics/maintenances', payload);
      if (response.status !== 200 && response.status !== 201) throw new Error('Failed to create maintenance log');

      await fetchMaintenanceLogs();
      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async id => {
    // if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        const response = await api.delete(`/logistics/maintenances/${id}`);
        if (response.status !== 204) throw new Error('Failed to delete maintenance log');
        await fetchMaintenanceLogs();
      } catch (err) {
        setError(err.message);
      }
    // }
  };
// Excel upload handler: auto-import on file select
// Excel upload handler: auto-import on file select
const handleExcelUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Only allow Excel files
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];
  const allowedExtensions = ['.xlsx', '.xls'];
  const fileName = file.name.toLowerCase();
  const isExcelType =
    allowedTypes.includes(file.type) ||
    allowedExtensions.some((ext) => fileName.endsWith(ext));

  if (!isExcelType) {
    setImportError('Please select a valid Excel file (.xlsx or .xls)');
    return;
  }

  setImporting(true);
  setImportError('');
  const reader = new FileReader();

  reader.onload = async (evt) => {
    try {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      if (!data.length) {
        setImportError('Excel file is empty.');
        setImporting(false);
        return;
      }

      const [header, ...rows] = data;

      // Robust header mapping: keeps original case, trims spaces
      const normalizedHeader = header.map((h) =>
        h ? h.toString().trim() : null
      );
      const getCol = (name) => {
        const idx = normalizedHeader.indexOf(name);
        return idx >= 0 ? idx : null;
      };

      // Convert Excel serial dates → YYYY-MM-DD
      const excelDateToJSDate = (serial) => {
        if (typeof serial === 'number') {
          const utc_days = Math.floor(serial - 25569);
          const utc_value = utc_days * 86400;
          const date_info = new Date(utc_value * 1000);
          return date_info.toISOString().slice(0, 10);
        }
        return serial;
      };

      const mapped = rows
        .map((row) => ({
          plateNumber: row[getCol('plateNumber')],
          date: excelDateToJSDate(row[getCol('date')]),
          description: row[getCol('description')],
          cost: row[getCol('cost')],
          contribution: row[getCol('contribution')],
          excess: row[getCol('excess')],
          type: row[getCol('type')],
        }))
        .filter((row) => row.plateNumber); // filter out empty rows

      if (!mapped.length) {
        setImportError('No valid rows found (missing plateNumber).');
        setImporting(false);
        return;
      }

      await api.post('/logistics/maintenances/bulk-import', mapped);
      setImporting(false);
      fetchMaintenanceLogs(); // refresh list after import
    } catch (err) {
      console.error(err);
      setImporting(false);
      setImportError('Bulk import failed.');
    }
  };

  reader.readAsBinaryString(file);
};


  
  const handleAddToLog = async (request) => {
    try {
      const logData = {
        vehicleId: request.vehicleId,
        type: request.maintenanceType === 'PREVENTIVE' ? 'Preventive' : 
              request.maintenanceType === 'CORRECTIVE' ? 'Corrective' : 
              'From Request',
        description: request.maintenanceDetail,
        cost: request.cost || 0,
        date: new Date().toISOString().slice(0, 10),
        requestId: request.id,
      };
      const response = await api.post('/logistics/maintenances', logData);
      if (response.status === 200 || response.status === 201) {
        await fetchMaintenanceLogs();
        // alert('Added to maintenance log successfully!');
      }
    } catch (err) {
      console.error('Failed to add to maintenance log:', err);
      // alert('Error adding to log');
    }
  };

  const handleEdit = log => {
    setEditMaintenance(log);
    setForm({
      vehicleId: log.vehicleId,
      type: log.type,
      description: log.description,
      cost: log.cost,
      date: log.date,
      requestId: log.requestId,
      contribution: log.contribution || 0,
      excess: log.excess || 0,
    });
    setShowForm(true);
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    try {
      const response = await api.put(`/logistics/maintenances/${editMaintenance.id}`, form);
      if (response.status !== 200) throw new Error('Failed to update maintenance log');
      await fetchMaintenanceLogs();
      setEditMaintenance(null);
      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setForm({
      vehicleId: '',
      type: '',
      description: '',
      cost: '',
      date: '',
      requestId: ''
    });
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.patch(`/driver/maintenance-requests/${id}`, { status: newStatus });
      if (response.status === 200) {
        setMaintenanceRequests(prev =>
          prev.map(req => req.id === id ? { ...req, status: newStatus } : req)
        );
      }
    } catch (err) {
      console.error('Failed to update request status:', err);
    }
  };

  const handleAddToLogForm = (request) => {
    setForm({
      vehicleId: request.vehicleId,
      type: request.maintenanceType === 'PREVENTIVE' ? 'Preventive' : 
            request.maintenanceType === 'CORRECTIVE' ? 'Corrective' : 
            'From Request', // Convert to proper case format
      description: request.maintenanceDetail || '',
      cost: '',
      date: new Date().toISOString().slice(0, 10),
      requestId: request.id,
    });
    setShowForm(true);
  };

  const filteredLogs = maintenanceLogs.filter(log => {
    const vehicle = vehicles.find(v => v.id === log.vehicleId);
    return (
      log.type.toLowerCase().includes(search.toLowerCase()) ||
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      (vehicle && vehicle.plateNumber.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const filteredRequests = maintenanceRequests.filter(req => {
    const vehicle = vehicles.find(v => v.id === req.vehicleId);
    return vehicle && vehicle.plateNumber.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="manager-dashboard-layout">
        <Sidebar />
        <main className="manager-dashboard-main">
          <h1 className="dashboard-title">Maintenance Logs</h1>
          <div className="loading">Loading maintenance logs...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="manager-dashboard-layout">
      <Sidebar />
      <main className={`manager-dashboard-main${viewMaintenance || editMaintenance ? 'modal-open' : ''}`}>
        <div className="dashboard-header">
          <h1 className="dashboard-title">Maintenance Logs</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="add-btn small" onClick={() => setShowForm(true)}>
              Add Maintenance Log
            </button>
            <button className="add-btn small" onClick={() => setViewMode(viewMode === 'maintenance' ? 'requests' : 'maintenance')}>
              {viewMode === 'maintenance' ? 'Show Maintenance Requests' : 'Back to Maintenance Logs'}
            </button>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}

        {viewMode === 'requests' ? (
          <MaintenanceRequest
            requests={filteredRequests}
            onStatusChange={handleStatusChange}
            onAddToLogRequest={handleAddToLogForm}
          />
        ) : (
          <>
            <div className="vehicles-toolbar" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                className="vehicles-search"
                type="text"
                placeholder="Search by type, description, or plate number..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <label htmlFor="maintenance-excel-upload" className="add-btn small" style={{ cursor: 'pointer', margin: 0, opacity: importing ? 0.6 : 1, color: importing ? 'gray' : 'black' }}>
                {importing ? 'Importing...' : 'Import'}
                <input
                  id="maintenance-excel-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  onChange={handleExcelUpload}
                  disabled={importing}
                />
              </label>
            </div>
            {importError && <div style={{ color: 'red', margin: '8px 0' }}>{importError}</div>}

            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Vehicle</th>
                  <th>Type</th>
                  {/* <th>Description</th> */}
                  {/* <th>Cost</th> */}
                  <th>Date</th>
                  {/* <th>Request ID</th>  */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => {
                  const vehicle = vehicles.find(v => v.id === log.vehicleId);
                  return (
                    <tr key={log.id}>
                      <td>{index + 1}</td>
                      <td>{vehicle ? vehicle.plateNumber : 'Unknown'}</td>
                      <td>{log.type}</td>
                      {/* <td>{log.description}</td>
                      <td>${log.cost}</td> */}
                      <td>{new Date(log.date).toLocaleDateString()}</td>
                       {/* <td>{log.requestId ?? '—'}</td> //Show request ID here */}
                      <td>
                        <button className="action-btn view" onClick={() => setViewMaintenance(log)}>View</button>
                        <button className="action-btn edit" onClick={() => handleEdit(log)}>Edit</button>
                        {/* <button className="action-btn delete" onClick={() => handleDelete(log.id)}>Delete</button> */}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
        {viewMaintenance && (
  <div className="modal-bg">
    <div className="modal-card">
      <button className="modal-close" onClick={() => setViewMaintenance(null)}>&times;</button>
      <h2>Maintenance Details</h2>
      <p><strong>Vehicle:</strong> {vehicles.find(v => v.id === viewMaintenance.vehicleId)?.plateNumber}</p>
      <p><strong>Description:</strong> {viewMaintenance.description}</p>
      <p><strong>Cost:</strong> ${viewMaintenance.cost}</p>
      <p><strong>Date:</strong> {new Date(viewMaintenance.date).toLocaleDateString()}</p>
      <p><strong>Request ID:</strong> {viewMaintenance.requestId ?? '—'}</p>
      <p><strong>Contribution:</strong> ${viewMaintenance.contribution ?? '—'}</p>
      <p><strong>Excess:</strong> ${viewMaintenance.excess ?? '—'}</p>
    </div>
  </div>
)}

        {showForm && (
          <div className="modal-bg">
            <div className="modal-card" style={{ maxWidth: '600px' }}>
              <button className="modal-close" onClick={() => { setShowForm(false); setEditMaintenance(null); resetForm(); }}>&times;</button>
              <form className="vehicle-form attractive" onSubmit={editMaintenance ? handleEditSubmit : handleSubmit}>
                <h2>{editMaintenance ? 'Edit Maintenance Record' : 'Add Maintenance Record'}</h2>
                <div className="form-row">
                  <label>Vehicle {form.requestId && <span style={{ color: '#666', fontSize: '0.9em' }}>(From Request)</span>}</label>
                  <select 
                    name="vehicleId" 
                    value={form.vehicleId} 
                    onChange={handleChange} 
                    required
                    disabled={form.requestId}
                    style={{ 
                      backgroundColor: form.requestId ? '#f5f5f5' : 'white',
                      cursor: form.requestId ? 'not-allowed' : 'pointer',
                      opacity: form.requestId ? 0.7 : 1
                      
                    }}
                  >
                    <option value="" >Select a vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.plateNumber} - {vehicle.manufacturer} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <label>Type {form.requestId && <span style={{ color: '#666', fontSize: '0.9em' }}>(From Request)</span>}</label>
                  <select 
                    name="type" 
                    value={form.type} 
                    onChange={handleChange} 
                    required
                    disabled={form.requestId}
                    style={{ 
                      backgroundColor: form.requestId ? '#f5f5f5' : 'white',
                      cursor: form.requestId ? 'not-allowed' : 'pointer',
                      opacity: form.requestId ? 0.7 : 1
                    }}
                  >
                    <option value="">-- Select Type --</option>
                    <option value="Corrective">Corrective</option>
                    <option value="Preventive">Preventive</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <label>Cost</label>
                  <input type="number" name="cost" value={form.cost} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <label>excess</label>
                  <input type="number" name="excess" value={form.excess} onChange={handleChange} required />
                </div>
                  <div className="form-row">
                  <label>Contribution</label>
                  <input type="number" name="contribution" value={form.contribution} onChange={handleChange} required />
                </div>
                
                <div className="form-row">
                  <label>Maintenance Date</label>
                  <input type="date" name="date" value={form.date} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <label>Request ID</label>
                  <input 
                    type="text" 
                    name="requestId" 
                    value={form.requestId || ''} 
                    onChange={handleChange} 
                    placeholder="Leave empty if no request"
                    disabled // Always disable request ID field
                    style={{ backgroundColor: form.requestId ? '#f0f0f0' : 'white' }}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit">{editMaintenance ? 'Save Changes' : 'Add Record'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MaintenanceLog;
