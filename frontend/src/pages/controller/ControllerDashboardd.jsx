import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import './inspection.css';
import api from '../../api/axios';

const ControllerDashboardd = () => {
  const [computers, setComputers] = useState([]);
  const [formData, setFormData] = useState({
    ownerName: '',
    serialNumber: '',
    model: '',
    ownershipType: '',
  });
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const qrRefs = useRef({});

  const handleCancel = () => {
    setShowForm(false);
  };

  useEffect(() => {
    fetchComputers();
  }, []);

  const fetchComputers = async () => {
    try {
      const response = await api.get('/logistics/computers');
      setComputers(response.data);
    } catch (error) {
      setMessage('Failed to fetch computers');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/logistics/computers', formData);
      setMessage('Computer registered successfully');
      setFormData({
        ownerName: '',
        serialNumber: '',
        model: '',
        ownershipType: '',
      });
      setShowForm(false);
      fetchComputers();
    } catch (error) {
      setMessage('Failed to register computer');
    }
  };

  const handleGenerateQR = async (serialNumber) => {
    try {
      await api.post(`/logistics/computers/generate-qr/${serialNumber}`);
      setMessage('QR Code generated');
      fetchComputers();
    } catch (error) {
      setMessage('Failed to generate QR Code');
    }
  };

  const handleDownloadQR = (serialNumber) => {
    const svgElement = qrRefs.current[serialNumber];
    if (!svgElement || !(svgElement instanceof Node)) {
      // alert('QR code not found or not rendered properly.');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngFile;
      link.download = `${serialNumber}_QRCode.png`;
      link.click();

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const filteredComputers = computers.filter((comp) =>
    comp.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inspection-dashboard">
      <div className="inspection-header">
        <h2 className="inspection-title">💻 Computer Management</h2>
        <button 
          className="action-button primary-button" 
          onClick={() => setShowForm(true)}
        >
          + Register Computer
        </button>
      </div>

      {message && (
        <p className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by Serial Number or Owner Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={`inspection-table-container ${showForm ? 'blurred' : ''}`}>
        <table className="inspection-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Owner</th>
              <th>Serial</th>
              <th>Model</th>
              <th>Ownership</th>
              <th>QR Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComputers.map((comp, index) => (
              <tr key={comp.id}>
                <td>{index + 1}</td>
                <td>{comp.ownerName}</td>
                <td>{comp.serialNumber}</td>
                <td>{comp.model}</td>
                <td>{comp.ownershipType}</td>
                <td>
                  {comp.qrCode ? (
                    <div
                      className="qr-container"
                      ref={(el) => {
                        if (el) {
                          qrRefs.current[comp.serialNumber] = el.querySelector('svg');
                        }
                      }}
                    >
                      <QRCode value={comp.qrCode} size={64} />
                    </div>
                  ) : (
                    <span className="status-badge not-generated">Not Generated</span>
                  )}
                </td>
                <td>
                  {!comp.qrCode && (
                    <button 
                      className="action-button primary-button"
                      onClick={() => handleGenerateQR(comp.serialNumber)}
                    >
                      Generate QR
                    </button>
                  )}
                  {comp.qrCode && (
                    <button 
                      className="action-button secondary-button"
                      onClick={() => handleDownloadQR(comp.serialNumber)}
                    >
                      Download QR
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay">
          <form onSubmit={handleRegister} className="modal-content">
            <div className="form-group">
              <label htmlFor="ownerName">Owner Name</label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="serialNumber">Serial Number</label>
              <input
                type="text"
                id="serialNumber"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="model">Model</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="ownershipType">Ownership Type</label>
              <select
                id="ownershipType"
                name="ownershipType"
                value={formData.ownershipType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Ownership Type</option>
                <option value="ORGANIZATION">ORGANIZATION</option>
                <option value="PRIVATE">PRIVATE</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="action-button secondary-button"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="action-button primary-button"
              >
                Register Computer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ControllerDashboardd;
