import React from 'react';
import {
  BarChart,
  Bar,
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const OperationalReport = ({ data }) => {
  if (!data || !data.tripStatusDistribution || !data.monthlyOperations || 
      !data.routeEfficiency || !data.resourceUtilization || !data.maintenanceSchedule) {
    return <div className="no-data-message">No data available for the selected date range</div>;
  }

  return (
    <div className="report-content">
      <div className="report-section">
        <h3>Trip Status Distribution</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.tripStatusDistribution}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.tripStatusDistribution.map((entry, index) => (
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
        <h3>Monthly Operations</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyOperations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="trips" stroke="#8884d8" name="Trips" />
              <Line type="monotone" dataKey="distance" stroke="#82ca9d" name="Distance" />
              <Line type="monotone" dataKey="fuel" stroke="#ffc658" name="Fuel" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="report-section">
        <h3>Route Efficiency</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.routeEfficiency}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="route" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="efficiency" fill="#8884d8" name="Efficiency" />
              <Bar dataKey="time" fill="#82ca9d" name="Time" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="report-section">
        <h3>Resource Utilization</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.resourceUtilization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="resource" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="utilization" fill="#8884d8" name="Utilization" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="report-section">
        <h3>Maintenance Schedule</h3>
        <div className="table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.maintenanceSchedule.map((item) => (
                <tr key={item.id}>
                  <td>{item.vehicleId}</td>
                  <td>{item.type}</td>
                  <td>{item.date}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OperationalReport; 