import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './Manager.css';
import api from '../../api/axios';

const MaintenanceRequest = ({ viewMode = 'logistics' , onAddToLogRequest }) => {
  const [requests, setRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedRequestIds, setLoggedRequestIds] = useState([]);

const fetchLoggedRequests = async () => {
  try {
    const res = await api.get('/logistics/maintenances'); // adjust endpoint
    const ids = res.data.map(log => log.requestId); // adjust field name if needed
    setLoggedRequestIds(ids);
  } catch (err) {
    console.error('Failed to fetch logged requests');
  }
};


  useEffect(() => {
    fetchRequests();
    fetchVehicles();
    fetchLoggedRequests();
  }, []);;

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/driver/maintenance-requests');
      setRequests(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch maintenance requests');
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data);
    } catch (err) {
      console.error('Error fetching vehicles');
    }
  };

 const handleStatusChange = async (id, newStatus) => {
  try {
    const { data: fullRequest } = await api.get(`/driver/maintenance-requests/${id}`);

    // Construct correct DTO format
    const updatedRequest = {
      id: fullRequest.id,
      vehicleId: fullRequest.vehicleId,
      plateNumber: fullRequest.plateNumber,
      licenseNumber: fullRequest.licenseNumber,
      driverName: fullRequest.driverName,
      urgencyLevel: fullRequest.urgencyLevel,
      maintenanceDetail: fullRequest.maintenanceDetail,
      maintenanceType: fullRequest.maintenanceType,
      requestedDate: fullRequest.requestedDate,
      status: newStatus
    };

    console.log('Sending status update:', updatedRequest);

    await api.put(`/driver/maintenance-requests/${id}`, updatedRequest);
    await fetchRequests();
  } catch (err) {
    console.error(err);
    setError('Failed to update request status');
  }
};



  const handleAddToLog = async (req) => {
    try {
      await api.post('/logistics/maintenances', req); // adjust endpoint based on your backend
      // alert('Request added to log successfully');
    } catch (err) {
      console.error(err);
      setError('Failed to add to log');
    }
  };

  const filteredRequests = requests
    .filter(req =>
      req.maintenanceDetail.toLowerCase().includes(search.toLowerCase()) ||
      vehicles.find(v => v.id === req.vehicleId)?.plateNumber?.toLowerCase().includes(search.toLowerCase())
    )
    .filter(req => {
      // Only show relevant requests based on viewMode
      if (viewMode === 'logistics') {
        return ['PENDING', 'UNDER_MAINTENANCE', 'COMPLETED'].includes(req.status);
      }
      return true;
    });

  return (
    <div className="manager-dashboard-layout">
      <Sidebar />
      <main className="manager-dashboard-mainn">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Maintenance Requests</h1>
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
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Plate</th>
                <th>Driver Name</th>
                <th>Maintenance Type</th>
                <th>Request Detail</th>
                <th>Urgency</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(req => {
                const vehicle = vehicles.find(v => v.id === req.vehicleId);
                return (
                  <tr key={req.id}>
                    <td>{req.id}</td>
                    <td>{vehicle?.plateNumber || 'N/A'}</td>
                    <td>{req.driverName}</td>
                    <td>{req.maintenanceType || 'N/A'}</td>
                    <td>{req.maintenanceDetail}</td>
                    <td>{req.urgencyLevel}</td>
                    <td>{req.requestedDate}</td>
                    <td>{req.status}</td>
                    <td>
                      {req.status === 'PENDING' && viewMode === 'logistics' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(req.id, 'UNDER_MAINTENANCE')}
                            className="btn btn-sm btn-info"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(req.id, 'REJECTED')}
                            className="btn btn-sm btn-secondary"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {req.status === 'UNDER_MAINTENANCE' && viewMode === 'logistics' && (
                        <button
                          onClick={() => handleStatusChange(req.id, 'COMPLETED')}
                          className="btn btn-sm btn-warning"
                        >
                          Mark as Completed
                        </button>
                      )}
                      {req.status === 'COMPLETED' && viewMode === 'logistics' && !loggedRequestIds.includes(req.id) && (
                        <button
                          onClick={() => onAddToLogRequest(req)}
                          className="btn btn-sm btn-success"
                        >
                          Add to Log
                        </button>
                      )}
                      {req.status === 'COMPLETED' && viewMode === 'logistics' && loggedRequestIds.includes(req.id) && (
                        <button className="btn btn-sm btn-outline-secondary" disabled>
                          Already Logged
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
};

export default MaintenanceRequest;
