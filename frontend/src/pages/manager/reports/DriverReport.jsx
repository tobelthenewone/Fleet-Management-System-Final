import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const formatDate = (dateStr) => {
  if (!dateStr) return 'Not assigned yet';
  const date = new Date(dateStr);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

const DriverReport = ({ data }) => {

const driverStatus = Object.entries(data.driverStatus || {})
  .filter(([key]) => key !== "totalDrivers")
  .map(([status, count]) => ({
    status: status === "availableDrivers" ? "Available" : "Occupied",
    count,
  }));
  
  const mostActiveDrivers = Array.isArray(data.mostActiveDrivers) ? data.mostActiveDrivers : [];
  const topPerformingDrivers = Array.isArray(data.topPerformingDrivers) ? data.topPerformingDrivers : [];
  const inactiveDrivers = Array.isArray(data.inactiveDrivers) ? data.inactiveDrivers : [];
  const driverDetails = Array.isArray(data.driverDetails) ? data.driverDetails : [];
  console.log("Top Performing Drivers", topPerformingDrivers);

  return (
    <div className="space-y-8 p-4">
      {/* Pie Chart */}
<div className="report-section">
  <h2 className="text-xl font-semibold mb-3 mt-5 flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded shadow-sm">
    Driver Status Distribution
  </h2>
    <div className="chart-container flex justify-center items-center w-full pl-20">
      {driverStatus.length > 0 ? (
        <PieChart width={400} height={300}>
          <Pie
            data={driverStatus}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {driverStatus.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      ) : (
        <p
          style={{
            padding: '18px 0',
            textAlign: 'center',
            fontSize: '1.1rem',
            color: '#2563eb',
            background: '#f0f6ff',
            borderRadius: '8px',
            margin: '10px 0'
          }}
        >
          No driver status data available.
        </p>
      )}
  </div>
</div>

      {/* Most Active Drivers */}
      <section>
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded shadow-sm">
          {/* <svg style={{ width: '3rem', height: '3rem' }} className="text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg> */}
          Most Active Drivers
        </h2>     
        <table className="w-full border table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Total Requests</th>
              <th className="border px-2 py-1">Completed</th>
              {/* <th className="border px-2 py-1">Performance</th> */}
              {/* <th className="border px-2 py-1">Last Active</th> */}
            </tr>
          </thead>
          <tbody>
            {mostActiveDrivers.map((driver) => (
              <tr key={driver.id}>
                <td className="border px-2 py-1">{driver.driverId}</td>
                <td className="border px-2 py-1">{driver.driverName}</td>
                <td className="border px-2 py-1">{driver.totalRequests}</td>
                <td className="border px-2 py-1">{driver.completedRequests}</td>
                {/* <td className="border px-2 py-1">{driver.performance}</td> */}
                {/* <td className="border px-2 py-1">{formatDate(driver.lastActive)}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Top Performing Drivers */}
      <section>
          <h2 className="text-xl  font-semibold mb-3 mt-5 flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded shadow-sm">
          {/* <svg style={{ width: '3rem', height: '3rem' }} className="text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg> */}
          Top Performing Drivers
        </h2> 
        <table className="w-full border table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Completed Requests</th>
              {/* <th className="border px-2 py-1">Distance (km)</th> */}
              {/* <th className="border px-2 py-1">Avg Rating</th>
              <th className="border px-2 py-1">Last Active</th> */}
            </tr>
          </thead>
          <tbody>
            {topPerformingDrivers.map((driver) => (
              <tr key={driver.driverId}>
                <td className="border px-2 py-1">{driver.driverId}</td>
                <td className="border px-2 py-1">{driver.driverName}</td>
                <td className="border px-2 py-1">{driver.completedTripCount}</td>
                {/* <td className="border px-2 py-1">{driver.totalDistance}</td>
                <td className="border px-2 py-1">{driver.averageRating}</td>
                <td className="border px-2 py-1">{formatDate(driver.lastActive)}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Inactive Drivers */}
      <section>
        <h2 className="text-xl  font-semibold mb-3 mt-5 flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded shadow-sm">
          {/* <svg style={{ width: '3rem', height: '3rem' }} className="text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg> */}
          Inactive Drivers (30+ days)
        </h2> 
        <ul className="list-disc pl-5">
          {inactiveDrivers.map((driver) => (
            <li key={driver.id}>
              {driver.name} (Last Active: {formatDate(driver.lastActive)})
            </li>
          ))}
        </ul>
      </section>

      {/* All Driver Details */}
      {/* <section>
        <h2 className="text-xl font-semibold mb-2">All Driver Details</h2>
        <table className="w-full border table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Performance</th>
              <th className="border px-2 py-1">Date</th>
            </tr>
          </thead>
          <tbody>
            {driverDetails.map((driver) => (
              <tr key={driver.id}>
                <td className="border px-2 py-1">{driver.id}</td>
                <td className="border px-2 py-1">{driver.name}</td>
                <td className="border px-2 py-1">{driver.status}</td>
                <td className="border px-2 py-1">{driver.performance}</td>
                <td className="border px-2 py-1">{driver.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section> */}
    </div>
  );
};

export default DriverReport;
