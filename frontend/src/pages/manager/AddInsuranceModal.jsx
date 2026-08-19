// src/components/AddInsuranceModal.jsx
import React from 'react';

const AddInsuranceModal = ({ form, handleChange, handleAddSubmit, setAddPolicy, availableVehicles }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content vehicle-form-modal">
        <button className="modal-close" onClick={() => setAddPolicy(false)}>&times;</button>
        
        <form className="vehicle-form-grid" onSubmit={handleAddSubmit}>
          <h2 className="form-title">Add Insurance Policy</h2>
          
          {/* Basic Information Section */}
          <div className="form-section">
            <h3 className="section-title">Policy Information</h3>
            <div className="form-grid-2">
              <div className="form-row">
                <label>Vehicle Plate Number *</label>
                <select 
                  name="plateNumber" 
                  value={form.plateNumber} 
                  onChange={handleChange} 
                  required 
                  className="form-select"
                >
                  <option value="">Select Vehicle</option>
                  {availableVehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.plateNumber}>
                      {vehicle.plateNumber} - {vehicle.manufacturer} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-row">
                <label>Policy Number *</label>
                <input
                  name="policyNumber"
                  value={form.policyNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <label>Provider *</label>
                <input
                  name="provider"
                  value={form.provider}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <label>Coverage Type *</label>
                <select 
                  name="coverageType" 
                  value={form.coverageType} 
                  onChange={handleChange} 
                  required 
                  className="form-select"
                >
                  <option value="">Select Coverage Type</option>
                  <option value="Comprehensive">Comprehensive</option>
                  <option value="Third Party">Third Party</option>
                  <option value="Collision">Collision</option>
                  <option value="Liability">Liability</option>
                </select>
              </div>
            </div>
          </div>

          {/* Policy Details Section */}
          <div className="form-section">
            <h3 className="section-title">Policy Details</h3>
            <div className="form-grid-3">
              <div className="form-row">
                <label>Start Date *</label>
                <input
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <label>End Date *</label>
                <input
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <label>Premium Amount *</label>
                <input
                  name="premiumAmount"
                  type="number"
                  step="0.01"
                  value={form.premiumAmount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-btn">Add Insurance Policy</button>
            <button type="button" className="cancel-btn" onClick={() => setAddPolicy(false)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInsuranceModal;
