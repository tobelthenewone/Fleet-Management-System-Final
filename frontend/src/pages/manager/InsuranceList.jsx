import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import './Manager.css';
import api from '../../api/axios';

import AddInsuranceModal from './AddInsuranceModal';
import EditInsuranceModal from './EditInsuranceModal';
import DeleteInsuranceDialog from './DeleteInsuranceDialog';
import './InsuranceList.css';

const InsuranceList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState('');
  const [viewItem, setViewItem] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  const [showAddModal, setAddPolicy] = useState(false);
  const [editPolicy, setEditPolicy] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    id: null,
    plateNumber: '',
    policyNumber: '',
    provider: '',
    startDate: '',
    endDate: '',
    premiumAmount: '',
    coverageType: '',
  });

  // Bulk import state
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

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
    const isExcelType = allowedTypes.includes(file.type) || allowedExtensions.some(ext => fileName.endsWith(ext));
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
        // Map header to DTO fields (prefer plateNumber for import)
        const mapped = rows.map(row => ({
          plateNumber: row[header.indexOf('plateNumber')],
          policyNumber: row[header.indexOf('policyNumber')],
          provider: row[header.indexOf('provider')],
          startDate: row[header.indexOf('startDate')],
          endDate: row[header.indexOf('endDate')],
          premiumAmount: row[header.indexOf('premiumAmount')],
          coverageType: row[header.indexOf('coverageType')],
        })).filter(row => row.plateNumber); // filter out empty rows
        if (!mapped.length) {
          setImportError('No valid rows found (missing plateNumber).');
          setImporting(false);
          return;
        }
        await api.post('/logistics/insurance-policies/bulk-import', mapped);
        setImporting(false);
        fetchData();
      } catch (err) {
        setImporting(false);
        setImportError('Bulk import failed.');
      }
    };
    reader.readAsBinaryString(file);
  };

  useEffect(() => {
    fetchData();
  }, []);

 const fetchData = async () => {
  try {
    const [policiesRes, vehiclesRes] = await Promise.all([
      api.get('/logistics/insurance-policies'),
      api.get('/vehicles')
    ]);
    setData(policiesRes.data);
    setVehicles(vehiclesRes.data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
};



  useEffect(() => {
    const s = search.toLowerCase();
    const filtered = data.filter((m) =>
      m.plateNumber?.toLowerCase().includes(s) ||
      m.policyNumber?.toLowerCase().includes(s) ||
      m.endDate?.includes(s)
    );
    setFilteredData(filtered);
  }, [search, data]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
const getAvailableVehicles = () => {
  const insuredPlateNumbers = new Set(data.map(d => d.plateNumber));
  return vehicles.filter(vehicle => !insuredPlateNumbers.has(vehicle.plateNumber));
};

 const handleAddSubmit = async (e) => {
  e.preventDefault();
  try {
    await api.post('/logistics/insurance-policies', form);
    setAddPolicy(false);
    setForm({
      id: null,
      plateNumber: '',
      policyNumber: '',
      provider: '',
      startDate: '',
      endDate: '',
      premiumAmount: '',
      coverageType: '',
    });
    fetchData();
  } catch (error) {
    console.error('Error adding policy:', error);
  }
};


  const handleEditSubmit = async (e) => {
  e.preventDefault();
  try {
    await api.put(`/logistics/insurance-policies/${form.id}`, form);
    setEditPolicy(null);
    setForm({
      id: null,
      plateNumber: '',
      policyNumber: '',
      provider: '',
      startDate: '',
      endDate: '',
      premiumAmount: '',
      coverageType: '',
    });
    fetchData();
  } catch (error) {
    console.error('Error updating policy:', error);
  }
};

  const handleDeleteConfirm = async (id) => {
  try {
   await api.delete(`/logistics/insurance-policies/${id}`);
    setDeleteTarget(null);
    fetchData();
  } catch (error) {
    console.error('Error deleting policy:', error);
  }
};


  return (
    <div className="manager-dashboard-layout">

       <Sidebar />
       <main className={`manager-dashboard-main ${showAddModal || editPolicy || deleteTarget ? 'blur' : ''}`}>
        <div className="dashboard-header">
          <h1 className="dashboard-title">Insurance Policy Records</h1>
          <NotificationBell />
        </div>


        <div className="vehicles-toolbar" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            className="vehicles-search"
            type="text"
            placeholder="Search by vehicle ID, description or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px', width: '100%' }}
          />
          <button className="add-btn small" onClick={() => setAddPolicy(true)}>Add Insurance</button>
          <label htmlFor="insurance-excel-upload" className="add-btn small" style={{ cursor: 'pointer', margin: 0, opacity: importing ? 0.6 : 1, color: importing ? 'gray' : 'black' }}>
            {importing ? 'Importing...' : 'Import'}
            <input
              id="insurance-excel-upload"
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={handleExcelUpload}
              disabled={importing}
            />
          </label>
        </div>
        {importError && <div style={{ color: 'red', margin: '8px 0' }}>{importError}</div>}

      <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }} className="vehicles-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Vechicle</th>
            <th>Policy Number</th>
            <th>Provider</th>
            {/* <th>Start Date</th>
            <th>End Date</th>
            <th>Premium Amount</th>
            <th>Coverage Type</th> */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((policy) => (
            <tr key={policy.id}>
              <td>{policy.id}</td>
              <td>{policy.plateNumber}</td>
              <td>{policy.policyNumber}</td>
              <td>{policy.provider}</td>
              {/* <td>{policy.startDate}</td>
              <td>{policy.endDate}</td>
              <td>{policy.premiumAmount}</td>
              <td>{policy.coverageType}</td> */}
              <td>
                <button className="action-btn view" onClick={() => setViewItem(policy)}>View</button>{' '}
                <button className="action-btn edit" onClick={() => {
                  setEditPolicy(true);
                  setForm(policy);
                }}>Edit</button>{' '}
                <button  className="action-btn delete"onClick={() => setDeleteTarget(policy)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </main>
      {/* View Modal */}
      {viewItem && (
  <div className="modal-overlay">
    <div className="modal-content view-modal">
      <button className="modal-close" onClick={() => setViewItem(null)}>&times;</button>
      <h2>Insurance Details</h2>
      <div className="vehicle-details">
        <p><strong>ID:</strong> {viewItem.id}</p>
        <p><strong>Vehicle:</strong> {viewItem.plateNumber}</p>
        <p><strong>Policy Number:</strong> {viewItem.policyNumber}</p>
        <p><strong>Provider:</strong> {viewItem.provider}</p>
        <p><strong>Start Date:</strong> {viewItem.startDate}</p>
        <p><strong>End Date:</strong> {viewItem.endDate}</p>
        <p><strong>Premium Amount:</strong> {viewItem.premiumAmount}</p>
        <p><strong>Coverage Type:</strong> {viewItem.coverageType}</p>
      </div>
      <button className="close-btn" onClick={() => setViewItem(null)}>Close</button>
    </div>
  </div>
)}
      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content view-modal">
            <button className="modal-close" onClick={() => {
              setAddPolicy(false);
              setForm({
                id: null,
                plateNumber: '',
                policyNumber: '',
                provider: '',
                startDate: '',
                endDate: '',
                premiumAmount: '',
                coverageType: '',
              });
            }}>&times;</button>
            
            <form className="insurance-form-modern" onSubmit={handleAddSubmit}>
              <h2 className="form-title">Add New Insurance Policy</h2>
              
              <div className="form-section-modern">
                <div className="section-header"><span className="section-icon">📄</span> Policy Information</div>
                <div className="form-grid-3col">
                  <div className="form-row">
                    <label>Vehicle *</label>
                    <select name="plateNumber" value={form.plateNumber} onChange={handleChange} required className="form-select">
                      <option value="">Select a vehicle</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.plateNumber}>
                          {vehicle.plateNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-row">
                    <label>Policy Number *</label>
                    <input
                      type="text"
                      name="policyNumber"
                      value={form.policyNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <label>Provider *</label>
                    <input
                      type="text"
                      name="provider"
                      value={form.provider}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section-modern">
                <div className="section-header"><span className="section-icon">📅</span> Policy Dates</div>
                <div className="form-grid-3col">
                  <div className="form-row">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <label>End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section-modern">
                <div className="section-header"><span className="section-icon">ℹ️</span> Coverage and Contact</div>
                <div className="form-grid-3col">
                  <div className="form-row">
                    <label>Premium *</label>
                    <input
                      type="number"
                      name="premiumAmount"
                      value={form.premiumAmount}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-row full-width">
                    <label>Coverage Type</label>
                    <input
                      type="text"
                      name="coverageType"
                      value={form.coverageType}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions-modern">
                <button type="submit" className="submit-btn-modern">
                  Add Insurance Policy
                </button>
                <button
                  type="button"
                  className="cancel-btn-modern"
                  onClick={() => {
                    setAddPolicy(false);
                    setForm({
                      id: null,
                      plateNumber: '',
                      policyNumber: '',
                      provider: '',
                      startDate: '',
                      endDate: '',
                      premiumAmount: '',
                      coverageType: '',
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

      {/* Edit Modal */}
      {editPolicy && (
        <div className="modal-overlay">
          <div className="modal-content insurance-form-modal">
            <button className="modal-close" onClick={() => {
              setEditPolicy(null);
              setForm({
                id: null,
                plateNumber: '',
                policyNumber: '',
                provider: '',
                startDate: '',
                endDate: '',
                premiumAmount: '',
                coverageType: '',
              });
            }}>&times;</button>
            
            <form className="insurance-form-modern" onSubmit={handleEditSubmit}>
              <h2 className="form-title">Edit Insurance Policy</h2>
              
              <div className="form-section-modern">
                <div className="section-header"><span className="section-icon">📄</span> Policy Information</div>
                <div className="form-grid-3col">
                  <div className="form-row">
                    <label>Vehicle *</label>
                    <select name="plateNumber" value={form.plateNumber} onChange={handleChange} required className="form-select">
                      <option value="">Select a vehicle</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.plateNumber}>
                          {vehicle.plateNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-row">
                    <label>Policy Number *</label>
                    <input
                      type="text"
                      name="policyNumber"
                      value={form.policyNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <label>Provider *</label>
                    <input
                      type="text"
                      name="provider"
                      value={form.provider}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section-modern">
                <div className="section-header"><span className="section-icon">📅</span> Policy Dates</div>
                <div className="form-grid-3col">
                  <div className="form-row">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <label>End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section-modern">
                <div className="section-header"><span className="section-icon">ℹ️</span> Coverage and Contact</div>
                <div className="form-grid-3col">
                  <div className="form-row">
                    <label>Premium *</label>
                    <input
                      type="number"
                      name="premiumAmount"
                      value={form.premiumAmount}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-row full-width">
                    <label>Coverage Type</label>
                    <input
                      type="text"
                      name="coverageType"
                      value={form.coverageType}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions-modern">
                <button type="submit" className="submit-btn-modern">
                  Update Insurance Policy
                </button>
                <button
                  type="button"
                  className="cancel-btn-modern"
                  onClick={() => {
                    setEditPolicy(null);
                    setForm({
                      id: null,
                      plateNumber: '',
                      policyNumber: '',
                      provider: '',
                      startDate: '',
                      endDate: '',
                      premiumAmount: '',
                      coverageType: '',
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

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteInsuranceDialog
          record={deleteTarget}
          onDeleteConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
  };
export default InsuranceList;
