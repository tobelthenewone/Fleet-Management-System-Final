import React from 'react';

const DeleteInsuranceDialog = ({ record, onDeleteConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <h2>Confirm Delete</h2>
        <p>Are you sure you want to delete the insurance policy for vehicle <strong>{record.plateNumber}</strong>?</p>
        <p>Policy Number: <strong>{record.policyNumber}</strong></p>
        <div className="form-actions">
          <button 
            className="submit-btn" 
            style={{ background: '#dc3545' }}
            onClick={() => onDeleteConfirm(record.id)}
          >
            Delete
          </button>
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteInsuranceDialog;
