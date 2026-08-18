import { ca, de } from 'date-fns/locale';
import React from 'react';

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { format } from 'date-fns';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const RequestReport = ({ data }) => {
  if (!data || !data.requestTypes || !data.requestDetails) {
    return <div className="no-data-message">No data available for the selected date range</div>;
  }

  // Calculate status distribution
  const statusCounts = data.requestDetails.reduce((acc, request) => {
    acc[request.status] = (acc[request.status] || 0) + 1;
    return acc;
  }, {});

  const totalRequests = data.requestDetails.length;
  const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: ((count / totalRequests) * 100).toFixed(1)
  }));

  // Find approved requests without vehicle assignment for more than 7 days
  const today = new Date();
  const approvedUnassignedRequests = data.requestDetails.filter(request => {
    if (request.status === 1) {
      const requestDate = new Date(request.startTime);
      const daysDiff = Math.floor((today - requestDate) / (1000 * 60 * 60 * 24));
      return daysDiff > 7;
    }
    return false;
  });
  const getStatusName = (status) => {
    switch (status) {
      case 0:
      case '0':
         return 'Pending';
      case 1:
      case '1':
         return 'Approved';
      case 2:
      case '2':
         return 'Rejected';
      case 3:
      case '3':
         return 'Vehicle Assignment processing';
      case 4:
      case '4':
         return 'Vehicle Assigned';
      case 5:
      case '5':
         return 'In Journey progress';
      case 6:
      case '6':
         return 'Journey Completed';
      default: return 'Unknown';
    }
  }
  const formatDateTime=(isoString)=> {
  if (!isoString) return 'Invalid date';

  try {
    const date = new Date(isoString);
    return format(date, 'MMMM d, yyyy, h:mm a'); // Example: June 9, 2025, 10:02 AM
  } catch (err) {
    console.error('Date formatting error:', err);
    return 'Invalid date';
  }
}
  return (
    <div className="report-content">
      <div className="report-section">
        <h3>Request Type Distribution</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.requestTypes}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.requestTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="report-section">
        <h3>Request Status Distribution</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${getStatusName(name)}(${(percent * 100).toFixed(1)}%)`}
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {approvedUnassignedRequests.length > 0 && (
        <div className="report-section">
          <h3>Approved Requests Pending Vehicle Assignment (Over 7 days)</h3>
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Approval Date</th>
                  <th>Days Since Approval</th>
                </tr>
              </thead>
              <tbody>
                {approvedUnassignedRequests.map((item, index) => {
                  const approvalDate = new Date(item.date);
                  const daysSinceApproval = Math.floor((today - approvalDate) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={index}>
                      <td>{item.id}</td>
                      <td>{item.tripType}</td>
                      <td>{item.date}</td>
                      <td>{daysSinceApproval}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="report-section">
        <h3>All Request Details</h3>
        <div className="table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Start Time</th>
              </tr>
            </thead>
            <tbody>
              {data.requestDetails.map((item, index) => (
                <tr key={index}>
                  <td>{item.id}</td>
                  <td>{item.tripType}</td>
                  <td>{getStatusName(item.status)}</td>
                  <td>{formatDateTime(item.startTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RequestReport; 