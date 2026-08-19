import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './Vehicle.css';
import api from '../../api/axios';

const Vehicles = () => {
  const [showForm, setShowForm] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [form, setForm] = useState({
    plateNumber: '',
    type: '',
    model: '',
    manufacturer: '',
    chasseNumber: '',
    engineNumber: '',
    yearOfMade: '',
    enginCC: '',
    assignedAt: '',
    seatCapa: '',
    minLicenseLevel: '1',
    purchasedDate: '',
    vehicleAmount: '',
    inspection: '',
    inspectionReason: '',
    pincode: '',
    cardNumber: '',
    driverId: null,
    driverName: null,
    status: 'AVAILABLE',
    imageUrl: '', // Ensure imageUrl is always in form state
    mileage: '',
    kilometersSinceLastService: '',
    recentBreakdown: false,
    maintenanceLastMonth: false
  });
  const [viewVehicle, setViewVehicle] = useState(null);
  const [editVehicle, setEditVehicle] = useState(null);
  const [showJourneyLog, setShowJourneyLog] = useState(false);
  const [showMaintenanceLog, setShowMaintenanceLog] = useState(false);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [showFuelLog, setShowFuelLog] = useState(false);
  const [driverHistory, setDriverHistory] = useState([]);
  const [journeyLogs, setJourneyLogs] = useState([]);
  const [insurancePolicies, setInsurancePolicies] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [showDriverAssignmentModal, setShowDriverAssignmentModal] = useState(false);
  const [selectedVehicleForDriver, setSelectedVehicleForDriver] = useState(null);
  const [driverAssignmentForm, setDriverAssignmentForm] = useState({
    driverId: null,
    assignedAt: ''
  });
  const [timeInterval, setTimeInterval] = useState('week');
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [selectedFuelLog, setSelectedFuelLog] = useState(null);
  const [fuelStartDate, setFuelStartDate] = useState('');
  const [fuelEndDate, setFuelEndDate] = useState('');
  const [maintenanceStartDate, setMaintenanceStartDate] = useState('');
  const [maintenanceEndDate, setMaintenanceEndDate] = useState('');

  // Fetch vehicles, drivers, and insurance policies on component mount
  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
    fetchInsurancePolicies();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vehicles');
      // Sort vehicles by creation date in descending order (newest first)
      const sortedVehicles = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setVehicles(sortedVehicles);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/logistics/drivers');
      setDrivers(response.data);
    } catch (err) {
      console.error('Error fetching drivers:', err);
    }
  };

  const fetchInsurancePolicies = async () => {
    try {
      const response = await api.get('/logistics/insurance-policies');
      if (response.status !== 200) {
        throw new Error('Failed to fetch insurance policies');
      }
      setInsurancePolicies(response.data);
    } catch (err) {
      console.error('Error fetching insurance policies:', err);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'driverId') {
      const selectedDriver = drivers.find(d => d.id === parseInt(value));
      setForm(prev => ({
        ...prev,
        driverId: selectedDriver ? selectedDriver.id : null,
        driverName: selectedDriver ? selectedDriver.name : null
      }));
    } else if (name === 'inspection') {
      // If inspection status changes to Pass, clear the reason
      setForm(prev => ({
        ...prev,
        inspection: value,
        inspectionReason: value === 'Pass' ? '' : prev.inspectionReason
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  

  const handleSubmit = async e => {
    e.preventDefault();
    let imageUrl = form.imageUrl || '';
    if (imageFile) {
      const data = new FormData();
      data.append('file', imageFile);
      // Always upload to vehicle_images/ for vehicles
      data.append('subdir', 'vehicle_images');
      try {
        const uploadRes = await api.post('/uploads', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrl = uploadRes.data;
      } catch (err) {
        setError('Image upload failed');
        return;
      }
    }
    try {
      setLoading(true);
      // Format inspection status with reason if failed
      const formattedInspection = form.inspection === 'Fail' && form.inspectionReason 
        ? `Fail - ${form.inspectionReason}`
        : form.inspection;
      const submitData = {
        ...form,
        imageUrl,
        inspection: formattedInspection,
        // Convert string values to numbers for numeric fields
        mileage: parseFloat(form.mileage) || 0,
        kilometersSinceLastService: parseFloat(form.kilometersSinceLastService) || 0,
        // Ensure boolean values are properly set
        recentBreakdown: form.recentBreakdown === 'true' || form.recentBreakdown === true,
        maintenanceLastMonth: form.maintenanceLastMonth === 'true' || form.maintenanceLastMonth === true
      };
      if (form.driverId) {
        const selectedDriver = drivers.find(d => d.id === form.driverId);
        await api.put(`/logistics/drivers/${form.driverId}`, {
          ...selectedDriver,
          isOccupied: true
        });
      }
      const response = await api.post('/vehicles', submitData);
      if (response.status !== 200) {
        throw new Error('Failed to create vehicle');
      }
      fetchVehicles();
      setShowForm(false);
      resetForm();
      setImageFile(null);
      setError(null);
      fetchDrivers();
    } catch (err) {
      setError('Failed to create vehicle. Please try again.');
      console.error('Error creating vehicle:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    // if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        setLoading(true);
        // Get the vehicle to check if it has an assigned driver
        const vehicle = vehicles.find(v => v.id === id);
        
        if (vehicle && vehicle.driverId) {
          // Unassign the driver
          const driver = drivers.find(d => d.id === vehicle.driverId);
          await api.put(`/logistics/drivers/${vehicle.driverId}`, {
            ...driver,
            isOccupied: false
          });
        }
        // Delete the vehicle
        await api.delete(`/vehicles/logistics/${id}`);
        setVehicles(prev => prev.filter(v => v.id !== id));
        setError(null);
        // Refresh the drivers list to update occupied status
        fetchDrivers();
      } catch (err) {
        setError('Failed to delete vehicle. Please try again.');
        console.error('Error deleting vehicle:', err);
      } finally {
        setLoading(false);
      }
    // }
  };

   const handleEdit = v => {
    setEditVehicle(v);
    setForm({
      plateNumber: v.plateNumber,
      type: v.type,
      model: v.model,
      manufacturer: v.manufacturer,
      chasseNumber: v.chasseNumber,
      engineNumber: v.engineNumber,
      yearOfMade: v.yearOfMade,
      enginCC: v.enginCC,
      assignedAt: v.assignedAt || '',
      seatCapa: v.seatCapa,
      minLicenseLevel: v.minLicenseLevel || '1',
      purchasedDate: v.purchasedDate,
      vehicleAmount: v.vehicleAmount,
      inspection: v.inspection,
      inspectionReason: v.inspectionReason || '',
      pincode: v.pincode,
      cardNumber: v.cardNumber,
      driverId: v.driverId,
      driverName: v.driverName,
      status: v.status,
      imageUrl: v.imageUrl || '', // Preserve imageUrl on edit
      mileage: v.mileage || 0,
      kilometersSinceLastService: v.kilometersSinceLastService || 0,
      recentBreakdown: v.recentBreakdown || false,
      maintenanceLastMonth: v.maintenanceLastMonth || false
    });
    setShowForm(true);
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    let imageUrl = form.imageUrl || (editVehicle && editVehicle.imageUrl) || '';
    if (imageFile) {
      const data = new FormData();
      data.append('file', imageFile);
      // Always upload to vehicle_images/ for vehicles
      data.append('subdir', 'vehicle_images');
      try {
        const uploadRes = await api.post('/uploads', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrl = uploadRes.data;
      } catch (err) {
        setError('Image upload failed');
        return;
      }
    }
    try {
      setLoading(true);
      // Format inspection status with reason if failed
      const formattedInspection = form.inspection === 'Fail' && form.inspectionReason 
        ? `Fail - ${form.inspectionReason}`
        : form.inspection;
      const submitData = {
        ...form,
        imageUrl, // Always include imageUrl

        inspection: formattedInspection,
        // Convert string values to numbers for numeric fields
        mileage: parseFloat(form.mileage) || 0,
        kilometersSinceLastService: parseFloat(form.kilometersSinceLastService) || 0,
        // Ensure boolean values are properly set
        recentBreakdown: form.recentBreakdown === 'true' || form.recentBreakdown === true,
        maintenanceLastMonth: form.maintenanceLastMonth === 'true' || form.maintenanceLastMonth === true
      };

      // If there's a previous driver, unassign them
      if (editVehicle.driverId && editVehicle.driverId !== form.driverId) {
        const previousDriver = drivers.find(d => d.id === editVehicle.driverId);
        await api.put(`/logistics/drivers/${editVehicle.driverId}`, {
          ...previousDriver,
          isOccupied: false
        });
      }
      
      // If there's a new driver, assign them
      if (form.driverId && (!editVehicle.driverId || editVehicle.driverId !== form.driverId)) {
        const selectedDriver = drivers.find(d => d.id === form.driverId);
        await api.put(`/logistics/drivers/${form.driverId}`, {
          ...selectedDriver,
          isOccupied: true
        });
      }
      
      // Update the vehicle
      const response = await api.put(`/vehicles/logistics/${editVehicle.id}`, submitData);
      if (response.status !== 200) {
        throw new Error('Failed to update vehicle');
      }
      
      // Update the vehicles list with the new data
      setVehicles(prev => prev.map(v => v.id === editVehicle.id ? response.data : v));
      setEditVehicle(null);
      setShowForm(false);
      resetForm();
      setError(null);
      // Refresh the drivers list to update occupied status
      fetchDrivers();
    } catch (err) {
      setError('Failed to update vehicle. Please try again.');
      console.error('Error updating vehicle:', err);
    } finally {
      setLoading(false);
    }
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const steps = [
    { number: 1, title: 'Basic Information', icon: '🚘' },
    { number: 2, title: 'Vehicle Specifications', icon: '🔧' },
    { number: 3, title: 'Driver Assignment', icon: '🧑‍✈️' },
    { number: 4, title: 'Financial & Documentation', icon: '💳' }
  ];

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return form.plateNumber && form.type && form.status;
      case 2:
        return form.model && form.manufacturer && form.yearOfMade && 
               form.seatCapa && form.minLicenseLevel && 
               form.chasseNumber && form.engineNumber &&
               form.mileage && form.kilometersSinceLastService;
      case 3:
        return true; // Driver assignment is optional
      case 4:
        return form.purchasedDate && form.vehicleAmount && form.inspection && 
               form.pincode && form.cardNumber;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const resetFormSteps = () => {
    setCurrentStep(1);
    setCompletedSteps([]);
  };

  const resetForm = () => {
    setForm({
      plateNumber: '',
      type: '',
      model: '',
      manufacturer: '',
      chasseNumber: '',
      engineNumber: '',
      yearOfMade: '',
      enginCC: '',
      assignedAt: '',
      seatCapa: '',
      minLicenseLevel: '1',
      purchasedDate: '',
      vehicleAmount: '',
      inspection: '',
      inspectionReason: '',
      pincode: '',
      cardNumber: '',
      driverId: null,
      driverName: null,
      status: 'AVAILABLE',
      imageUrl: '', // Ensure imageUrl is always in form state
      mileage: '',
      kilometersSinceLastService: '',
      recentBreakdown: false,
      maintenanceLastMonth: false
    });
    resetFormSteps();
  };

  const getStatusCounts = () => {
    return {
      ALL: vehicles.length,
      AVAILABLE: vehicles.filter(v => v.status === 'AVAILABLE').length,
      OCCUPIED: vehicles.filter(v => v.status === 'OCCUPIED').length,
      UNDER_MAINTENANCE: vehicles.filter(v => v.status === 'UNDER_MAINTENANCE').length,
      DISPOSED: vehicles.filter(v => v.status === 'DISPOSED').length
    };
  };

  const filteredVehicles = vehicles.filter(v => {
    const searchLower = search?.toLowerCase();
    const matchesSearch =
      v.manufacturer?.toLowerCase().includes(searchLower) ||
      v.model?.toLowerCase().includes(searchLower) ||
      v.plateNumber?.toLowerCase().includes(searchLower) ||
      v.driverName?.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const closeViewModal = () => {
    setViewVehicle(null);
    setShowJourneyLog(false);
    setShowMaintenanceLog(false);
    setShowFuelLog(false);
  };

  const handleView = async (v) => {
    setViewVehicle(v);
    setShowJourneyLog(false);
    setShowMaintenanceLog(false);
    setShowFuelLog(false);
    
    // Fetch driver assignment history
    try {
      const response = await api.get(`/driver-assignment-history/vehicle/${v.id}`);
      setDriverHistory(response.data);
    } catch (err) {
      console.error('Error fetching driver history:', err);
      setDriverHistory([]);
    }
  };

   const fetchJourneyLogs = async (vehicleId) => {
    try {
      const response = await api.get(`/logistics/journeys/vehicle/${vehicleId}`);
      if (response.status !== 200) {
        throw new Error('Failed to fetch journey logs');
      }
      setJourneyLogs(response.data);
      setShowJourneyLog(true);
    } catch (err) {
      setError(err.message);
    }
  };
  const fetchMaintenanceLogs = async (vehicleId) => {
    try {
      const response = await api.get(`/logistics/maintenances/vehicle/${vehicleId}`, {
        params: {
          startDate: maintenanceStartDate,
          endDate: maintenanceEndDate
        }
      });
      if (response.status!==200) {
        throw new Error('Failed to fetch maintenance logs');
      }
      setMaintenanceLogs(response.data || []);
      setShowMaintenanceLog(true);
    } catch (err) {
      console.error('Error fetching maintenance logs:', err);
      setError(err.message);
      setMaintenanceLogs([]);
    }
  };

  const fetchFuelLogs = async (vehicleId) => {
    try {
      const response = await api.get(`/logistics/fuel-logs/vehicle/${vehicleId}`, {
        params: {
          startDate: fuelStartDate,
          endDate: fuelEndDate
        }
      });
      if (response.status!==200) {
        throw new Error('Failed to fetch fuel logs');
      }
      setFuelLogs(response.data || []);
      setShowFuelLog(true);
    } catch (err) {
      console.error('Error fetching fuel logs:', err);
      setError(err.message);
      setFuelLogs([]);
    }
  };

  // Add function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Add function to get insurance end date for a vehicle
  const getInsuranceEndDate = (plateNumber) => {
    const policy = insurancePolicies.find(p => p.plateNumber === plateNumber);
    return policy ? formatDate(policy.endDate) : 'No Insurance';
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Helper to prepend backend base URL to image paths
  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    // If already absolute (starts with http), return as is
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    // If it's a blob URL (local preview), return as is
    if (imageUrl.startsWith('blob:')) return imageUrl;
    // Change this to your backend base URL as needed
    const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://aps2.zemenbank.com/fmsapi/';
    // Ensure no double slashes
    return imageUrl.startsWith('/') ? `${BASE_URL}${imageUrl}` : `${BASE_URL}/${imageUrl}`;
  };

  // Debug: Log fetched vehicles to inspect imageUrl
  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      console.log('Fetched vehicles:', vehicles.map(v => ({ id: v.id, plateNumber: v.plateNumber, imageUrl: v.imageUrl })));
    }
  }, [vehicles]);

  const handleDriverAssignment = async (vehicle) => {
    setSelectedVehicleForDriver(vehicle);
    setDriverAssignmentForm({
      driverId: vehicle.driverId || '',
      assignedAt: vehicle.assignedAt || new Date().toISOString().split('T')[0]
    });
    // Fetch driver history for the vehicle using the same endpoint as handleView
    try {
      const response = await api.get(`/driver-assignment-history/vehicle/${vehicle.id}`);
      setDriverHistory(response.data);
    } catch (err) {
      console.error('Error fetching driver history:', err);
      setDriverHistory([]);
    }
    setShowDriverAssignmentModal(true);
  };

  const handleDriverAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const vehicle = selectedVehicleForDriver;
      
      // If there's a previous driver, unassign them
      if (vehicle.driverId && vehicle.driverId !== driverAssignmentForm.driverId) {
        const previousDriver = drivers.find(d => d.id === vehicle.driverId);
        await api.put(`/logistics/drivers/${vehicle.driverId}`, {
          ...previousDriver,
          isOccupied: false
        });
      }
      
      // If there's a new driver, assign them
      if (driverAssignmentForm.driverId) {
        const selectedDriver = drivers.find(d => d.id === driverAssignmentForm.driverId);
        await api.put(`/logistics/drivers/${driverAssignmentForm.driverId}`, {
          ...selectedDriver,
          isOccupied: true
        });
      }
      
      // Update the vehicle
      const response = await api.put(`/vehicles/logistics/${vehicle.id}`, {
        ...vehicle,
        driverId: driverAssignmentForm.driverId || null,
        driverName: driverAssignmentForm.driverId ? 
          drivers.find(d => d.id === driverAssignmentForm.driverId)?.name : null,
        assignedAt: driverAssignmentForm.assignedAt
      });
      
      // Update the vehicles list
      setVehicles(prev => prev.map(v => v.id === vehicle.id ? response.data : v));
      setShowDriverAssignmentModal(false);
      setSelectedVehicleForDriver(null);
      setError(null);
      // Refresh the drivers list
      fetchDrivers();
    } catch (err) {
      setError('Failed to update driver assignment. Please try again.');
      console.error('Error updating driver assignment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manager-dashboard-layout">
      <Sidebar />
      <main className="manager-dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">VEHICLES</h1>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="vehicles-filters-section">
          {/* Status filter buttons */}
          <div className="vehicle-status-filters">
            <button 
              className={`vehicle-status-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All Vehicles ({getStatusCounts().ALL})
            </button>
            <button 
              className={`vehicle-status-btn available ${statusFilter === 'AVAILABLE' ? 'active' : ''}`}
              onClick={() => setStatusFilter('AVAILABLE')}
            >
              Available ({getStatusCounts().AVAILABLE})
            </button>
            <button 
              className={`vehicle-status-btn occupied ${statusFilter === 'OCCUPIED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('OCCUPIED')}
            >
              Occupied ({getStatusCounts().OCCUPIED})
            </button>
            <button 
              className={`vehicle-status-btn maintenance ${statusFilter === 'UNDER_MAINTENANCE' ? 'active' : ''}`}
              onClick={() => setStatusFilter('UNDER_MAINTENANCE')}
            >
              Under Maintenance ({getStatusCounts().UNDER_MAINTENANCE})
            </button>
            <button 
              className={`vehicle-status-btn disposed ${statusFilter === 'DISPOSED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('DISPOSED')}
            >
              Disposed ({getStatusCounts().DISPOSED})
            </button>
          </div>

          <div className="vehicles-toolbar">
            <div className="search-filter-container">
              <input
                className="vehicles-search"
                type="text"
                placeholder="Search by manufacturer, model, plate number, or driver..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="add-btn small" onClick={() => {
              setEditVehicle(null);
              resetForm();
              setShowForm(true);
            }}>+ Add New Vehicle</button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading">Loading vehicles...</div>
        ) : (
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Plate Number</th>
                <th>Image</th>
                <th>Type</th>
                <th>Current Driver</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((v, index) => (
                <tr key={v.id}>
                  <td>{index + 1}</td>
                  <td>{v.plateNumber}</td>
                  <td>{v.imageUrl ? <img src={v.imageUrl.startsWith('blob:') ? v.imageUrl : getFullImageUrl(v.imageUrl)} alt={v.plateNumber} style={{width:'60px',height:'40px',objectFit:'cover',borderRadius:'8px'}} /> : <span>No Image</span>}</td>
                  <td>{v.type}</td>
                  <td>{v.driverName || 'Not Assigned'}</td>
                  <td>
                    <button className="action-btn view" onClick={() => handleView(v)}>View</button>
                    <button className="action-btn edit" onClick={() => handleEdit(v)}>Edit</button>
                    <button className="action-btn driver" onClick={() => handleDriverAssignment(v)}>Driver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Edit/Add Form Modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content vehicle-form-modern">
              <button className="modal-close" onClick={() => {
                setShowForm(false);
                setEditVehicle(null);
                resetForm();
              }}>&times;</button>
              
              <form className="vehicle-form-modern multi-step-form" onSubmit={editVehicle ? handleEditSubmit : handleSubmit}>
                <h2 className="form-title">{editVehicle ? 'Edit Vehicle' : 'Register New Vehicle'}</h2>

                {/* Step Indicator */}
                <div className="step-indicator">
                  {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                      <div className={`step ${currentStep === step.number ? 'active' : ''} ${completedSteps.includes(step.number) ? 'completed' : ''}`}>
                        <div className="step-number">{step.number}</div>
                        <span>{step.title}</span>
                      </div>
                      {index < steps.length - 1 && <div className="step-connector"></div>}
                    </React.Fragment>
                  ))}
                </div>

                {/* Form Steps Container */}
                <div className="form-steps-container">
                  <div className="form-steps-wrapper" style={{ transform: `translateX(-${(currentStep - 1) * 25}%)` }}>
                    
                    {/* Step 1: Basic Information */}
                    <div className="form-step">
                      <div className="form-section-modern">
                        <div className="section-header"><span className="section-icon">🚘</span> Basic Information</div>
                        <div className="form-grid-3col">
                          <div className="form-row"><label>Plate Number *</label><input name="plateNumber" value={form.plateNumber} onChange={handleChange} required /></div>
                          <div className="form-row"><label>Type *</label><input name="type" value={form.type} onChange={handleChange} required /></div>
                          <div className="form-row"><label>Status *</label>
                            <select name="status" value={form.status} onChange={handleChange} className="form-select">
                              <option value="AVAILABLE">Available</option>
                              <option value="OCCUPIED">Occupied</option>
                              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                              <option value="DISPOSED">Disposed</option>
                            </select>
                          </div>
                          <div className="form-row">
                            <label>Vehicle Image</label>
                            <input type="file" accept="image/*" onChange={handleImageChange} />
                            {(imageFile || form.imageUrl) && (
                              <div style={{marginTop:'0.5rem'}}>
                                <img
                                  src={imageFile ? URL.createObjectURL(imageFile) : getFullImageUrl(form.imageUrl)}
                                  alt="Vehicle Preview"
                                  style={{width:'100px',height:'60px',objectFit:'cover',borderRadius:'8px',border:'1px solid #ccc'}}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Step Navigation */}
                      <div className="step-navigation">
                        <div></div> {/* Empty div for spacing */}
                        <button type="button" className="step-nav-btn next-btn" onClick={nextStep} disabled={!validateStep(1)}>
                          Next
                        </button>
                      </div>
                    </div>

                    {/* Step 2: Vehicle Specifications */}
                    <div className="form-step">
                      <div className="form-section-modern">
                        <div className="section-header"><span className="section-icon">🔧</span> Vehicle Specifications</div>
                        <div className="form-grid-3col">
                          <div className="form-row"><label>Model *</label><input name="model" value={form.model} onChange={handleChange} required /></div>
                          <div className="form-row"><label>Manufacturer *</label><input name="manufacturer" value={form.manufacturer} onChange={handleChange} required /></div>
                          <div className="form-row"><label>Year of Manufacture *</label>
                            <select name="yearOfMade" value={form.yearOfMade} onChange={handleChange} required className="form-select">
                              <option value="">Select Year</option>
                              {Array.from({length: (new Date()).getFullYear() - 1980 + 1}, (v, k) => k + 1980).reverse().map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-row"><label>Seat Capacity *</label><input name="seatCapa" type="number" value={form.seatCapa} onChange={handleChange} required /></div>
                          <div className="form-row"><label>Minimum License Level *</label>
                            <select name="minLicenseLevel" value={form.minLicenseLevel} onChange={handleChange} required className="form-select">
                              <option value="1">Level 1</option>
                              <option value="2">Level 2</option>
                              <option value="3">Level 3</option>
                              <option value="4">Level 4</option>
                            </select>
                          </div>
                          <div className="form-row"><label>Mileage (km) *</label><input name="mileage" type="number" value={form.mileage} onChange={handleChange} required /></div>
                          <div className="form-row"><label>Kilometers Since Last Service *</label><input name="kilometersSinceLastService" type="number" value={form.kilometersSinceLastService} onChange={handleChange} required /></div>
                          <div className="form-row">
                            <label>Recent Breakdown</label>
                            <select name="recentBreakdown" value={form.recentBreakdown} onChange={handleChange} className="form-select">
                              <option value={false}>No</option>
                              <option value={true}>Yes</option>
                            </select>
                          </div>
                          <div className="form-row"><label>Chassis Number *</label><input name="chasseNumber" value={form.chasseNumber} onChange={handleChange} required /></div>
                          <div className="form-row"><label>Engine Number *</label><input name="engineNumber" value={form.engineNumber} onChange={handleChange} required /></div>
                        </div>
                      </div>
                      
                      {/* Step Navigation */}
                      <div className="step-navigation">
                        <button type="button" className="step-nav-btn prev-btn" onClick={prevStep}>
                          Previous
                        </button>
                        <button type="button" className="step-nav-btn next-btn" onClick={nextStep} disabled={!validateStep(2)}>
                          Next
                        </button>
                      </div>
                    </div>

                    {/* Step 3: Driver Assignment */}
                    <div className="form-step">
                      <div className="form-section-modern">
                        <div className="section-header"><span className="section-icon">🧑‍✈️</span> Driver Assignment</div>
                        <div className="form-grid-3col">
                          <div className="form-row">
                            <label>Assigned Driver</label>
                            <select name="driverId" value={form.driverId || ''} onChange={handleChange} className="form-select">
                              <option value="">No Driver Assigned</option>
                              {drivers
                                .filter(driver => {
                                  const isAvailable = !driver.isOccupied || driver.id === form.driverId;
                                  const hasRequiredLicense = parseInt(driver.licenseLevel) >= parseInt(form.minLicenseLevel);
                                  return isAvailable && hasRequiredLicense;
                                })
                                .map(driver => (
                                  <option key={driver.id} value={driver.id}>
                                    {driver.name} (License Level {driver.licenseLevel})
                                  </option>
                                ))}
                            </select>
                          </div>
                          <div className="form-row">
                            <label>Assigned At</label>
                            <input 
                              name="assignedAt" 
                              type="date" 
                              value={form.assignedAt} 
                              readOnly
                              className="form-select"
                              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Step Navigation */}
                      <div className="step-navigation">
                        <button type="button" className="step-nav-btn prev-btn" onClick={prevStep}>
                          Previous
                        </button>
                        <button type="button" className="step-nav-btn next-btn" onClick={nextStep}>
                          Next
                        </button>
                      </div>
                    </div>

                    {/* Step 4: Financial & Documentation */}
                    <div className="form-step">
                      <div className="form-section-modern">
                        <div className="section-header"><span className="section-icon">💳</span> Financial & Documentation</div>
                        <div className="form-grid-3col">
                          <div className="form-row"><label>Purchase Date *</label><input name="purchasedDate" type="date" value={form.purchasedDate} onChange={handleChange} required /></div>
                          <div className="form-row"><label>Vehicle Amount *</label><input name="vehicleAmount" type="number" value={form.vehicleAmount} onChange={handleChange} required /></div>
                          <div className="form-row"><label>Inspection Status *</label>
                            <select name="inspection" value={form.inspection} onChange={handleChange} required className="form-select">
                              <option value="">Select Status</option>
                              <option value="Pass">Pass</option>
                              <option value="Fail">Fail</option>
                            </select>
                          </div>
                          {form.inspection === 'Fail' && (
                            <div className="form-row">
                              <label>Failure Reason *</label>
                              <input name="inspectionReason" value={form.inspectionReason} onChange={handleChange} placeholder="Enter reason for failure" required />
                            </div>
                          )}
                          <div className="form-row"><label>PIN Code *</label><input name="pincode" value={form.pincode} onChange={handleChange} required /></div>
                          <div className="form-row"><label>Card Number *</label><input name="cardNumber" value={form.cardNumber} onChange={handleChange} required /></div>
                        </div>
                      </div>

                      {/* Step Navigation */}
                      <div className="step-navigation">
                        <button type="button" className="step-nav-btn prev-btn" onClick={prevStep}>
                          Previous
                        </button>
                        <div></div> {/* Empty div for spacing */}
                      </div>

                      {/* Final Step Actions */}
                      <div className="form-actions-modern">
                        <button type="submit" className="submit-btn-modern" disabled={loading}>
                          {loading ? 'Saving...' : (editVehicle ? 'Update Vehicle' : 'Register Vehicle')}
                        </button>
                        <button type="button" className="cancel-btn-modern" onClick={() => {
                          setShowForm(false);
                          setEditVehicle(null);
                          resetForm();
                        }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* View Vehicle Modal */}
        {viewVehicle && (
          <div className="modal-overlay">
            <div className="modal-content view-modal">
              <h2>Vehicle Details</h2>
              <div style={{ textAlign: 'center' }}>
                {viewVehicle.imageUrl && <img src={getFullImageUrl(viewVehicle.imageUrl)} alt={viewVehicle.plateNumber} style={{width:'200px',height:'120px',objectFit:'cover',borderRadius:'12px',marginBottom:'1rem'}} />}
              </div>
              <div className="vehicle-details">
                <p><strong>Plate Number:</strong> {viewVehicle.plateNumber}</p>
                <p><strong>Manufacturer:</strong> {viewVehicle.manufacturer}</p>
                <p><strong>Model:</strong> {viewVehicle.model}</p>
                <p><strong>Type:</strong> {viewVehicle.type}</p>
                <p><strong>Chassis Number:</strong> {viewVehicle.chasseNumber}</p>
                <p><strong>Engine Number:</strong> {viewVehicle.engineNumber}</p>
                <p><strong>Year of Manufacture:</strong> {viewVehicle.yearOfMade}</p>
                <p><strong>Seat Capacity:</strong> {viewVehicle.seatCapa}</p>
                <p><strong>Minimum License Level:</strong> Level {viewVehicle.minLicenseLevel}</p>
                <p><strong>Status:</strong> {viewVehicle.status}</p>
                <p><strong>Assigned At:</strong> {viewVehicle.assignedAt || 'Not Assigned'}</p>
                <p><strong>Purchase Date:</strong> {formatDate(viewVehicle.purchasedDate)}</p>
                <p><strong>Vehicle Amount:</strong> {viewVehicle.vehicleAmount}</p>
                <p><strong>Inspection Status:</strong> {viewVehicle.inspection}</p>
                <p><strong>Insurance End Date:</strong> {getInsuranceEndDate(viewVehicle.plateNumber)}</p>
                <p><strong>PIN Code:</strong> {viewVehicle.pincode}</p>
                <p><strong>Card Number:</strong> {viewVehicle.cardNumber}</p>
                <p><strong>Current Driver:</strong> {viewVehicle.driverName || 'Not Assigned'}</p>
                
                {/* New fields */}
                <p><strong>Mileage:</strong> {viewVehicle.mileage ? `${viewVehicle.mileage} km` : 'N/A'}</p>
                <p><strong>Kilometers Since Last Service:</strong> {viewVehicle.kilometersSinceLastService ? `${viewVehicle.kilometersSinceLastService} km` : 'N/A'}</p>
                <p><strong>Recent Breakdown:</strong> {viewVehicle.recentBreakdown ? 'Yes' : 'No'}</p>
                <p><strong>Maintenance Last Month:</strong> {viewVehicle.maintenanceLastMonth ? 'Yes' : 'No'}</p>
                {/* vehicle category */}
                <p><strong>Vehicle Category:</strong> {viewVehicle.vehicleCategory || 'N/A'}</p>
              </div>

              {/* Driver Assignment History */}
              <div className="driver-history-section">
                <h3>Driver Assignment History</h3>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Driver</th>
                      <th>License Number</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverHistory.map((record, index) => (
                      <tr key={index}>
                        <td>{new Date(record.assignedAt).toLocaleString()}</td>
                        <td>{record.driverName}</td>
                        <td>{record.driverLicenseNumber}</td>
                        <td>
                          <span className={`action-badge ${record.action?.toLowerCase()}`}>
                            {record.action}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {driverHistory.length === 0 && (
                      <tr>
                        <td colSpan="4" className="no-records">No assignment history available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="log-buttons">
                <button className="journey-log-btn" onClick={() => { setShowJourneyLog(true); fetchJourneyLogs(viewVehicle.id); }}>Journey Log</button>
                <button className="maintenance-log-btn" onClick={() => fetchMaintenanceLogs(viewVehicle.id)}>Maintenance Log</button>
                <button className="maintenance-log-btn" onClick={() => fetchFuelLogs(viewVehicle.id)}>Fuel Log</button>
              </div>
              <button className="close-btn" onClick={closeViewModal}>Close</button>
            </div>
          </div>
        )}

        {/* Journey Log Modal */}
        {showJourneyLog && viewVehicle && (
          <div className="modal-overlay">
            <div className="modal-content journey-modal">
              <button className="modal-close" onClick={() => setShowJourneyLog(false)}>&times;</button>
              <h2>Journey Log - {viewVehicle.plateNumber}</h2>
              
              {/* Time Filter */}
              <div className="journey-filter-section">
                <select 
                  className="time-filter-select"
                  value={timeInterval}
                  onChange={(e) => {
                    setTimeInterval(e.target.value);
                    fetchJourneyLogs(viewVehicle.id);
                  }}
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>

              {/* Journey Statistics */}
              <div className="journey-stats">
                <div className="stat-card">
                  <h3>Total Distance</h3>
                  <p>{journeyLogs.reduce((sum, log) => sum + (log.distance || 0), 0).toFixed(2)} km</p>
                </div>
                <div className="stat-card">
                  <h3>Total Trips</h3>
                  <p>{journeyLogs.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Average Distance</h3>
                  <p>
                    {journeyLogs.length > 0 
                      ? (journeyLogs.reduce((sum, log) => sum + (log.distance || 0), 0) / journeyLogs.length).toFixed(2)
                      : 0} km
                  </p>
                </div>
              </div>

              {/* Journey Table */}
              <div className="journey-table-container">
                <table className="journey-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Date</th>
                      <th>Driver</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Distance (km)</th>
                      <th>Start Location</th>
                      <th>End Location</th>
                      <th>Purpose</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {journeyLogs.length > 0 ? (
                      journeyLogs.map((log, index) => (
                        <tr key={log.id}>
                          <td>{index + 1}</td>
                          <td>{new Date(log.startTime).toLocaleDateString()}</td>
                          <td>{log.driver?.name || 'N/A'}</td>
                          <td>{new Date(log.startTime).toLocaleTimeString()}</td>
                          <td>{log.endTime ? new Date(log.endTime).toLocaleTimeString() : 'In Trip'}</td>
                          <td>{log.distance?.toFixed(2) || 'N/A'}</td>
                          <td>{log.startLocation || 'N/A'}</td>
                          <td>{log.endLocation}</td>
                          <td>{log.purpose}</td>
                          <td>
                            <span className={`status-badge status-${log.status?.toLowerCase()}`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="no-records">No journey logs found for this vehicle</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Journey Details Modal */}
              {selectedJourney && (
                <div className="journey-details-modal">
                  <div className="journey-details-content">
                    <button className="modal-close" onClick={() => setSelectedJourney(null)}>&times;</button>
                    <h3>Journey Details</h3>
                    <div className="journey-details-grid">
                      <div className="detail-section">
                        <h4>Vehicle Information</h4>
                        <p><strong>Plate Number:</strong> {selectedJourney.vehicle?.plateNumber}</p>
                        <p><strong>Type:</strong> {selectedJourney.vehicle?.type}</p>
                      </div>
                      <div className="detail-section">
                        <h4>Driver Information</h4>
                        <p><strong>Name:</strong> {selectedJourney.driver?.name}</p>
                        <p><strong>License:</strong> {selectedJourney.driver?.licenseNumber}</p>
                      </div>
                      <div className="detail-section">
                        <h4>Trip Details</h4>
                        <p><strong>Start Time:</strong> {new Date(selectedJourney.startTime).toLocaleString()}</p>
                        <p><strong>End Time:</strong> {selectedJourney.endTime ? new Date(selectedJourney.endTime).toLocaleString() : 'In Trip'}</p>
                        <p><strong>Distance:</strong> {selectedJourney.distance?.toFixed(2)} km</p>
                        <p><strong>Purpose:</strong> {selectedJourney.purpose}</p>
                      </div>
                      <div className="detail-section">
                        <h4>Location Details</h4>
                        <p><strong>Start Location:</strong> {selectedJourney.startLocation || 'N/A'}</p>
                        <p><strong>End Location:</strong> {selectedJourney.endLocation}</p>
                      </div>
                    </div>
                    <div className="journey-details-footer">
                      <button className="close-btn" onClick={() => setSelectedJourney(null)}>Close</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Maintenance Log Modal */}
        {showMaintenanceLog && viewVehicle && (
          <div className="modal-overlay">
            <div className="modal-content journey-modal">
              <button className="modal-close" onClick={() => setShowMaintenanceLog(false)}>&times;</button>
              <h2>Maintenance Log - {viewVehicle.plateNumber}</h2>
              
              {/* Date Filter */}
              <div className="maintenance-filter-section">
                <div className="date-filter">
                  <div className="filter-group">
                    <label>Start Date:</label>
                    <input
                      type="date"
                      value={maintenanceStartDate}
                      onChange={(e) => setMaintenanceStartDate(e.target.value)}
                      max={maintenanceEndDate || undefined}
                    />
                  </div>
                  <div className="filter-group">
                    <label>End Date:</label>
                    <input
                      type="date"
                      value={maintenanceEndDate}
                      onChange={(e) => setMaintenanceEndDate(e.target.value)}
                      min={maintenanceStartDate || undefined}
                    />
                  </div>
                  <button 
                    className="filter-btn"
                    onClick={() => fetchMaintenanceLogs(viewVehicle.id)}
                  >
                    Apply Filter
                  </button>
                  <button 
                    className="filter-btn clear"
                    onClick={() => {
                      setMaintenanceStartDate('');
                      setMaintenanceEndDate('');
                      fetchMaintenanceLogs(viewVehicle.id);
                    }}
                  >
                    Clear Filter
                  </button>
                </div>
              </div>

              {/* Maintenance Statistics */}
              <div className="maintenance-stats">
                <div className="stat-card">
                  <h3>Total Cost</h3>
                  <p>${maintenanceLogs.reduce((sum, log) => sum + (log.cost || 0), 0).toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Services</h3>
                  <p>{maintenanceLogs.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Average Cost</h3>
                  <p>
                    ${maintenanceLogs.length > 0 
                      ? (maintenanceLogs.reduce((sum, log) => sum + (log.cost || 0), 0) / maintenanceLogs.length).toFixed(2)
                      : 0}
                  </p>
                </div>
              </div>

              {/* Maintenance Table */}
              <div className="maintenance-table-container">
                <table className="maintenance-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Cost</th>
                      <th>Service Provider</th>
                      {/* <th>Status</th> */}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceLogs.length > 0 ? (
                      maintenanceLogs.map((log, index) => (
                        <tr key={log.id}>
                          <td>{index + 1}</td>
                          <td>{new Date(log.date).toLocaleDateString()}</td>
                          <td>{log.type}</td>
                          <td>{log.description}</td>
                          <td>${log.cost?.toFixed(2)}</td>
                          <td>{log.serviceProvider || 'N/A'}</td>
                          {/* <td>
                            <span className={`status-badge status-${log.status?.toLowerCase()}`}>
                              {log.status || 'Unknown'}
                            </span>
                          </td> */}
                          <td>
                            <button 
                              className="action-btn view"
                              onClick={() => setSelectedMaintenance(log)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="no-records">No maintenance logs found for this vehicle</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Maintenance Details Modal */}
              {selectedMaintenance && (
                <div className="maintenance-details-modal">
                  <div className="maintenance-details-content">
                    <button className="modal-close" onClick={() => setSelectedMaintenance(null)}>&times;</button>
                    <h3>Maintenance Details</h3>
                    <div className="maintenance-details-grid">
                      <div className="detail-section">
                        <h4>Service Information</h4>
                        <p><strong>Type:</strong> {selectedMaintenance.type}</p>
                        <p><strong>Date:</strong> {new Date(selectedMaintenance.date).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {selectedMaintenance.status}</p>
                      </div>
                      <div className="detail-section">
                        <h4>Cost Details</h4>
                        <p><strong>Total Cost:</strong> ${selectedMaintenance.cost?.toFixed(2)}</p>
                        <p><strong>Payment Status:</strong> {selectedMaintenance.paymentStatus || 'N/A'}</p>
                      </div>
                      <div className="detail-section">
                        <h4>Service Provider</h4>
                        <p><strong>Name:</strong> {selectedMaintenance.serviceProvider || 'N/A'}</p>
                        <p><strong>Contact:</strong> {selectedMaintenance.providerContact || 'N/A'}</p>
                      </div>
                      <div className="detail-section">
                        <h4>Additional Information</h4>
                        <p><strong>Description:</strong> {selectedMaintenance.description}</p>
                        <p><strong>Next Service Due:</strong> {selectedMaintenance.nextServiceDue ? new Date(selectedMaintenance.nextServiceDue).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="maintenance-details-footer">
                      <button className="close-btn" onClick={() => setSelectedMaintenance(null)}>Close</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fuel Log Modal */}
        {showFuelLog && viewVehicle && (
          <div className="modal-overlay">
            <div className="modal-content view-modal">
              <button className="modal-close" onClick={() => setShowFuelLog(false)}>&times;</button>
              <h2>Fuel Log - {viewVehicle.plateNumber}</h2>
              
              {/* Date Filter */}
              <div className="fuel-filter-section">
                <div className="date-filter">
                  <div className="filter-group">
                    <label>Start Date:</label>
                    <input
                      type="date"
                      value={fuelStartDate}
                      onChange={(e) => setFuelStartDate(e.target.value)}
                      max={fuelEndDate || undefined}
                    />
                  </div>
                  <div className="filter-group">
                    <label>End Date:</label>
                    <input
                      type="date"
                      value={fuelEndDate}
                      onChange={(e) => setFuelEndDate(e.target.value)}
                      min={fuelStartDate || undefined}
                    />
                  </div>
                  <button 
                    className="filter-btn"
                    onClick={() => fetchFuelLogs(viewVehicle.id)}
                  >
                    Apply Filter
                  </button>
                  <button 
                    className="filter-btn clear"
                    onClick={() => {
                      setFuelStartDate('');
                      setFuelEndDate('');
                      fetchFuelLogs(viewVehicle.id);
                    }}
                  >
                    Clear Filter
                  </button>
                </div>
              </div>

              {/* Fuel Statistics */}
              <div className="fuel-stats">
                <div className="stat-card">
                  <h3>Total Fuel</h3>
                  <p>{fuelLogs.reduce((sum, log) => sum + (log.liters || 0), 0).toFixed(2)} L</p>
                </div>
                <div className="stat-card">
                  <h3>Total Cost</h3>
                  <p>${fuelLogs.reduce((sum, log) => sum + (log.liters * log.pricePerLiter || 0), 0).toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <h3>Average Price/L</h3>
                  <p>
                    ${fuelLogs.length > 0 
                      ? (fuelLogs.reduce((sum, log) => sum + (log.pricePerLiter || 0), 0) / fuelLogs.length).toFixed(2)
                      : 0}
                  </p>
                </div>
              </div>

              {/* Fuel Table */}
              <div className="fuel-table-container">
                <table className="fuel-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Date</th>
                      <th>Liters</th>
                      <th>Price/L</th>
                      <th>Total Cost</th>
                      <th>Station</th>
                      <th>Odometer</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fuelLogs.length > 0 ? (
                      fuelLogs.map((log, index) => (
                        <tr key={log.id}>

                          <td>{index + 1}</td>
                          <td>{new Date(log.date).toLocaleDateString()}</td>
                          <td>{log.liters?.toFixed(2)} L</td>
                          <td>${log.pricePerLiter?.toFixed(2)}</td>
                          <td>${(log.liters * log.pricePerLiter)?.toFixed(2)}</td>
                          <td>{log.station || 'N/A'}</td>
                          <td>{log.odometer || 'N/A'}</td>
                          <td>
                            <button 
                              className="action-btn view"
                              onClick={() => setSelectedFuelLog(log)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="no-records">No fuel logs found for this vehicle</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Fuel Details Modal */}
              {selectedFuelLog && (
                <div className="fuel-details-modal">
                  <div className="fuel-details-content">
                    <button className="modal-close" onClick={() => setSelectedFuelLog(null)}>&times;</button>
                    <h3>Fuel Log Details</h3>
                    <div className="fuel-details-grid">
                      <div className="detail-section">
                        <h4>Transaction Information</h4>
                        <p><strong>Date:</strong> {new Date(selectedFuelLog.date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {new Date(selectedFuelLog.date).toLocaleTimeString()}</p>
                        <p><strong>Receipt Number:</strong> {selectedFuelLog.receiptNumber || 'N/A'}</p>
                      </div>
                      <div className="detail-section">
                        <h4>Fuel Details</h4>
                        <p><strong>Liters:</strong> {selectedFuelLog.liters?.toFixed(2)} L</p>
                        <p><strong>Price per Liter:</strong> ${selectedFuelLog.pricePerLiter?.toFixed(2)}</p>
                        <p><strong>Total Cost:</strong> ${(selectedFuelLog.liters * selectedFuelLog.pricePerLiter)?.toFixed(2)}</p>
                      </div>
                      <div className="detail-section">
                        <h4>Station Information</h4>
                        <p><strong>Name:</strong> {selectedFuelLog.station || 'N/A'}</p>
                        <p><strong>Location:</strong> {selectedFuelLog.location || 'N/A'}</p>
                      </div>
                      <div className="detail-section">
                        <h4>Vehicle Information</h4>
                        <p><strong>Odometer Reading:</strong> {selectedFuelLog.odometer || 'N/A'}</p>
                        <p><strong>Fuel Type:</strong> {selectedFuelLog.fuelType || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="fuel-details-footer">
                      <button className="close-btn" onClick={() => setSelectedFuelLog(null)}>Close</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add the Driver Assignment Modal */}
        {showDriverAssignmentModal && selectedVehicleForDriver && (
          <div className="modal-overlay">
            <div className="modal-content view-modal">
              <button className="modal-close" onClick={() => {
                setShowDriverAssignmentModal(false);
                setSelectedVehicleForDriver(null);
              }}>&times;</button>
              
              <h2>Driver Assignment</h2>
              <div className="vehicle-info">
                <p><strong>Vehicle:</strong> {selectedVehicleForDriver.plateNumber} - {selectedVehicleForDriver.manufacturer} {selectedVehicleForDriver.model}</p>
                <p><strong>Current Driver:</strong> {selectedVehicleForDriver.driverName || 'Not Assigned'}</p>
              </div>

              <form onSubmit={handleDriverAssignmentSubmit}>
                <div className="form-section-modern">
                  <div className="section-header"><span className="section-icon">🧑‍✈️</span> Assign Driver</div>
                  <div className="form-grid-2col">
                    <div className="form-row">
                      <label>Select Driver</label>
                      <select 
                        name="driverId" 
                        value={driverAssignmentForm.driverId || ''} 
                        onChange={(e) => setDriverAssignmentForm(prev => ({
                          ...prev,
                          driverId: e.target.value ? parseInt(e.target.value) : null
                        }))} 
                        className="form-select"
                      >
                        <option value="">No Driver Assigned</option>
                        {drivers
                          .filter(driver => {
                            const isAvailable = !driver.isOccupied || driver.id === selectedVehicleForDriver.driverId;
                            const hasRequiredLicense = parseInt(driver.licenseLevel) >= parseInt(selectedVehicleForDriver.minLicenseLevel);
                            return isAvailable && hasRequiredLicense;
                          })
                          .map(driver => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name} (License Level {driver.licenseLevel})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="form-row">
                      <label>Assignment Date</label>
                      <input 
                        type="date" 
                        name="assignedAt" 
                        value={driverAssignmentForm.assignedAt} 
                        readOnly
                        className="form-select"
                        style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Driver Assignment History */}
                <div className="driver-history-section">
                  <h3>Driver Assignment History</h3>
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Driver</th>
                        <th>License Number</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {driverHistory.map((record, index) => (
                        <tr key={index}>
                          <td>{new Date(record.assignedAt).toLocaleString()}</td>
                          <td>{record.driverName}</td>
                          <td>{record.driverLicenseNumber}</td>
                          <td>
                            <span className={`action-badge ${record.action?.toLowerCase()}`}>
                              {record.action}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {driverHistory.length === 0 && (
                        <tr>
                          <td colSpan="4" className="no-records">No assignment history available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="form-actions-modern">
                  <button type="submit" className="submit-btn-modern" disabled={loading}>
                    {loading ? 'Saving...' : 'Update Assignment'}
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn-modern" 
                    onClick={() => {
                      setShowDriverAssignmentModal(false);
                      setSelectedVehicleForDriver(null);
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
    </div>
  );
};

export default Vehicles;