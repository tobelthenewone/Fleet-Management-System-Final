import React, { useEffect, useState } from 'react';
import RequestNavigationBar from './RequestNavigationBar';
import './Request.css';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';


function RequestDashboard() {
  const [totalRequests, setTotalRequests] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [approvedRequests, setApprovedRequests] = useState(0);
  const [rejectedRequests, setRejectedRequests] = useState(0);
  const [completedRequests, setCompletedRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  

  const navigate = useNavigate();

  const STATUS = {
    PENDING: "PENDING",
    UNDER_MAINTENANCE: "UNDER_MAINTENANCE",
    REJECTED: "REJECTED",
    COMPLETED: "COMPLETED",
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/driver/maintenance-requests');
      if (response.status !== 200) throw new Error('Failed to fetch requests');

      const requests = response.data;

      setTotalRequests(requests.length);
     setPendingRequests(requests.filter(req => req.status === STATUS.PENDING).length);
setApprovedRequests(requests.filter(req => req.status === STATUS.UNDER_MAINTENANCE).length);
setRejectedRequests(requests.filter(req => req.status === STATUS.REJECTED).length);
setCompletedRequests(requests.filter(req => req.status === STATUS.COMPLETED).length);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error(err.message);
    }
  };

  const handleCardClick = (statusFilter) => {
    navigate('/request/maintenance-request', { state: { statusFilter } });
  };
   

  return (
    <div className="manager-dashboard-layout">
      <RequestNavigationBar />
      <main className="manager-dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Requester Dashboard</h1>
        </div>

        <div className="dashboard-summary-row">
  <button 
    className="dashboard-summary-card clickable" 
    onClick={() => handleCardClick('all')}
  >
    <div className="summary-value">{loading ? "..." : totalRequests}</div>
    <div className="summary-label">Total Requests</div>
  </button>

 <button 
  className="dashboard-summary-card clickable" 
  onClick={() => handleCardClick(STATUS.PENDING)}
>
  <div className="summary-value">{loading ? "..." : pendingRequests}</div>
  <div className="summary-label">Pending Requests</div>
</button>

<button 
  className="dashboard-summary-card clickable" 
  onClick={() => handleCardClick(STATUS.UNDER_MAINTENANCE)}
>
  <div className="summary-value">{loading ? "..." : approvedRequests}</div>
  <div className="summary-label">Under Maintenance (Approved)</div>
</button>

<button 
  className="dashboard-summary-card clickable" 
  onClick={() => handleCardClick(STATUS.REJECTED)}
>
  <div className="summary-value">{loading ? "..." : rejectedRequests}</div>
  <div className="summary-label">Rejected Requests</div>
</button>

<button 
  className="dashboard-summary-card clickable" 
  onClick={() => handleCardClick(STATUS.COMPLETED)}
>
  <div className="summary-value">{loading ? "..." : completedRequests}</div>
  <div className="summary-label">Completed Requests</div>
</button>

</div>


        
          {/* <h2>Notifications</h2>
          <div className="notification-item">
            <span className="notification-icon">🔔</span>
            <span className="notification-text">Your maintenance request has been approved.</span>
          </div> */}
          {/* <div className="notification-item">
            <span className="notification-icon">🔔</span>
            <span className="notification-text">New policy update available.</span>
          </div> */}
        
      </main>
    </div>
  );
}

export default RequestDashboard;
