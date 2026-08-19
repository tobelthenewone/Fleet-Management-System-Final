
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import './Manager.css';
import api from '../../api/axios';
import './InsuranceList.css';

const BoloList = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [search, setSearch] = useState('');
    const [viewItem, setViewItem] = useState(null);
    const [vehicles, setVehicles] = useState([]);

    const [showAddModal, setAddModal] = useState(false);
    const [editBolo, setEditBolo] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Bulk import state
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState('');
    // No need for bulkData state since import is immediate

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
                    inspectionPayment: row[header.indexOf('inspectionPayment')],
                    roadFundPayment: row[header.indexOf('roadFundPayment')],
                    boloPayment: row[header.indexOf('boloPayment')],
                    boloExpiredDate: row[header.indexOf('boloExpiredDate')],
                })).filter(row => row.plateNumber); // filter out empty rows
                if (!mapped.length) {
                    setImportError('No valid rows found (missing plateNumber).');
                    setImporting(false);
                    return;
                }
                await api.post('/logistics/bolos/bulk-import', mapped);
                setImporting(false);
                fetchBolos();
            } catch (err) {
                setImporting(false);
                setImportError('Bulk import failed.');
            }
        };
        reader.readAsBinaryString(file);
    };

    // Bulk import handler removed (no longer needed)

    const [form, setForm] = useState({
        id: null,
        vehicleId: '',
        inspectionPayment: '',
        roadFundPayment: '',
        boloPayment: '',
        boloExpiredDate: '',
    });

    useEffect(() => {
        // fetchBolos();
        fetchVehicles();
        fetchBolos();
    }, []);


    // fetch vehicles
    const fetchVehicles = async () => {
        try {
            const response = await api.get('/vehicles');
            setVehicles(response.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        }
    };
    // fetch bolos
    const fetchBolos = async () => {
        try {
            const response = await api.get('/logistics/bolos');//logistic/bolos
            setData(response.data);
        } catch (error) {
            console.error('Error fetching bolos:', error);
        }
    };

    useEffect(() => {
        const s = search.toLowerCase();
        const filtered = data.filter((m) =>
            m.vehicle?.plateNumber?.toLowerCase().includes(s) ||
            (m.inspectionPayment + '').includes(s) ||
            (m.roadFundPayment + '').includes(s) ||
            (m.boloPayment + '').includes(s) ||
            (m.boloExpiredDate || '').includes(s)
        );
        setFilteredData(filtered);
    }, [search, data]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/logistics/bolos', form);
            setAddModal(false);
            setForm({
                id: null,
                vehicleId: '',
                inspectionPayment: '',
                roadFundPayment: '',
                boloPayment: '',
                boloExpiredDate: '',
            });
            fetchBolos();
        } catch (error) {
            console.error('Error adding bolo:', error);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/logistics/bolos/${form.id}`, form);
            setEditBolo(null);
            setForm({
                id: null,
                vehicleId: '',
                inspectionPayment: '',
                roadFundPayment: '',
                boloPayment: '',
                boloExpiredDate: '',
            });
            fetchBolos();
        } catch (error) {
            console.error('Error updating bolo:', error);
        }
    };

    const handleDeleteConfirm = async (id) => {
        try {
            await api.delete(`/logistics/bolos/${id}`);
            setDeleteTarget(null);
            fetchBolos();
        } catch (error) {
            console.error('Error deleting bolo:', error);
        }
    };

    return (
        <div className="manager-dashboard-layout">
            <Sidebar />
            <main className={`manager-dashboard-main ${showAddModal || editBolo || deleteTarget ? 'blur' : ''}`}>
                <div className="dashboard-header">
                    <h1 className="dashboard-title">Bolo Records</h1>
                    <NotificationBell />
                </div>
                <div className="vehicles-toolbar" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                        className="vehicles-search"
                        type="text"
                        placeholder="Search by vehicle, payment, or date..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ padding: '8px', width: '100%' }}
                    />
                    <button className="add-btn small" onClick={() => setAddModal(true)}>Add Bolo</button>
                    <label htmlFor="bolo-excel-upload" className="add-btn small " style={{ cursor: 'pointer', margin: 0, opacity: importing ? 0.6 : 1, color: importing ? 'gray' : 'black' }}>
                        {importing ? 'Importing...' : 'Import'}
                        <input
                            id="bolo-excel-upload"
                            type="file"
                            accept=".xlsx,.xls"
                            style={{ display: 'none' }}
                            onChange={handleExcelUpload}
                            disabled={importing}
                        />
                    </label>
                </div>
                {importError && <div style={{ color: 'red', margin: '8px 0' }}>{importError}</div>}
                {/* No preview of bulkData, import is immediate */}
                <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }} className="vehicles-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Vehicle</th>
                            {/* <th>Inspection Payment</th> */}
                            {/* <th>Road Fund Payment</th> */}
                            {/* <th>Bolo Payment</th> */}
                            <th>Bolo Expired Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((bolo) => (
                            <tr key={bolo.id}>
                                <td>{bolo.id}</td>
                                <td>{bolo.vehicle?.plateNumber || '-'}</td>
                                {/* <td>{bolo.inspectionPayment}</td> */}
                                {/* <td>{bolo.roadFundPayment}</td> */}
                                {/* <td>{bolo.boloPayment}</td> */}
                                <td>{bolo.boloExpiredDate}</td>
                                <td>
                                    <button className="action-btn view" onClick={() => setViewItem(bolo)}>View</button>{' '}
                                    <button className="action-btn edit" onClick={() => {
                                        setEditBolo(true);
                                        setForm({
                                            id: bolo.id,
                                            vehicleId: bolo.vehicle?.id || '',
                                            inspectionPayment: bolo.inspectionPayment,
                                            roadFundPayment: bolo.roadFundPayment,
                                            boloPayment: bolo.boloPayment,
                                            boloExpiredDate: bolo.boloExpiredDate,
                                        });
                                    }}>Edit</button>{' '}
                                    <button className="action-btn delete" onClick={() => setDeleteTarget(bolo)}>Delete</button>
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
                        <h2>Bolo Details</h2>
                        <div className="vehicle-details">
                            <p><strong>ID:</strong> {viewItem.id}</p>
                            <p><strong>Vehicle:</strong> {viewItem.vehicle?.plateNumber || '-'}</p>
                            <p><strong>Inspection Payment:</strong> {viewItem.inspectionPayment}</p>
                            <p><strong>Road Fund Payment:</strong> {viewItem.roadFundPayment}</p>
                            <p><strong>Bolo Payment:</strong> {viewItem.boloPayment}</p>
                            <p><strong>Bolo Expired Date:</strong> {viewItem.boloExpiredDate}</p>
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
                            setAddModal(false);
                            setForm({
                                id: null,
                                vehicleId: '',
                                inspectionPayment: '',
                                roadFundPayment: '',
                                boloPayment: '',
                                boloExpiredDate: '',
                            });
                        }}>&times;</button>
                        <form className="insurance-form-modern" onSubmit={handleAddSubmit}>
                            <h2 className="form-title">Add New Bolo</h2>
                            <div className="form-section-modern">
                                <div className="section-header"><span className="section-icon">🚗</span> Vehicle & Payment</div>
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
                                        <label>Inspection Payment *</label>
                                        <input
                                            type="number"
                                            name="inspectionPayment"
                                            value={form.inspectionPayment}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Road Fund Payment *</label>
                                        <input
                                            type="number"
                                            name="roadFundPayment"
                                            value={form.roadFundPayment}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Bolo Payment *</label>
                                        <input
                                            type="number"
                                            name="boloPayment"
                                            value={form.boloPayment}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Bolo Expired Date *</label>
                                        <input
                                            type="date"
                                            name="boloExpiredDate"
                                            value={form.boloExpiredDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-actions-modern">
                                <button type="submit" className="submit-btn-modern">
                                    Add Bolo
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn-modern"
                                    onClick={() => {
                                        setAddModal(false);
                                        setForm({
                                            id: null,
                                            vehicleId: '',
                                            inspectionPayment: '',
                                            roadFundPayment: '',
                                            boloPayment: '',
                                            boloExpiredDate: '',
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
            {editBolo && (
                <div className="modal-overlay">
                    <div className="modal-content view-modal">
                        <button className="modal-close" onClick={() => {
                            setEditBolo(null);
                            setForm({
                                id: null,
                                vehicleId: '',
                                inspectionPayment: '',
                                roadFundPayment: '',
                                boloPayment: '',
                                boloExpiredDate: '',
                            });
                        }}>&times;</button>
                        <form className="insurance-form-modern" onSubmit={handleEditSubmit}>
                            <h2 className="form-title">Edit Bolo</h2>
                            <div className="form-section-modern">
                                <div className="section-header"><span className="section-icon">🚗</span> Vehicle & Payment</div>
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
                                        <label>Inspection Payment *</label>
                                        <input
                                            type="number"
                                            name="inspectionPayment"
                                            value={form.inspectionPayment}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Road Fund Payment *</label>
                                        <input
                                            type="number"
                                            name="roadFundPayment"
                                            value={form.roadFundPayment}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Bolo Payment *</label>
                                        <input
                                            type="number"
                                            name="boloPayment"
                                            value={form.boloPayment}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Bolo Expired Date *</label>
                                        <input
                                            type="date"
                                            name="boloExpiredDate"
                                            value={form.boloExpiredDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-actions-modern">
                                <button type="submit" className="submit-btn-modern">
                                    Update Bolo
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn-modern"
                                    onClick={() => {
                                        setEditBolo(null);
                                        setForm({
                                            id: null,
                                            vehicleId: '',
                                            inspectionPayment: '',
                                            roadFundPayment: '',
                                            boloPayment: '',
                                            boloExpiredDate: '',
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
                <div className="modal-overlay">
                    <div className="modal-content view-modal">
                        <h2>Delete Bolo</h2>
                        <p>Are you sure you want to delete this Bolo record?</p>
                        <div className="form-actions-modern">
                            <button className="submit-btn-modern" onClick={() => handleDeleteConfirm(deleteTarget.id)}>Delete</button>
                            <button className="cancel-btn-modern" onClick={() => setDeleteTarget(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BoloList;
