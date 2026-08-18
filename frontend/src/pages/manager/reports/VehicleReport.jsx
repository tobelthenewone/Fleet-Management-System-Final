import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const VehicleReport = ({ data }) => {
  if (!data ||
    !Array.isArray(data.type_destribution) || data.type_destribution.length === 0 ||
    !Array.isArray(data.status_report) || data.status_report.length === 0 ||
    !Array.isArray(data.vehicle_summery) || data.vehicle_summery.length === 0
  ) {
    console.log("object is empty or not an array");
    return <div className="no-data-message">No data available for the selected date range</div>;
  }
  const summaryMap = Object.fromEntries(
    data.vehicle_summery.map(vehicle => [vehicle.plateNumber, vehicle])
  );
  const combinedData = data.status_report.map(vehicle => {
    const summary = summaryMap[vehicle.plateNumber] || {};
    return {
      plateNumber: vehicle.plateNumber,
      type: vehicle.type,
      status: vehicle.maintenanceStatus,
      lastAssignment: vehicle.lastAssignment,
      daysSinceLastAssignment: vehicle.daysSinceLastAssignment,
      totalDistance: summary.totalDistance || 0,
      totalJourneys: summary.totalJourneys || 0,
      totalMaintenances: summary.totalMaintenances || 0,
      totalAccidents: summary.totalAccidents || 0
    };
  });

  const mostUsed = [...combinedData]
    .filter(v => v.totalJourneys !== null)
    .sort((a, b) => b.totalJourneys - a.totalJourneys)
    .slice(0, 5);
  const mostAccidentProne = [...combinedData]
  .filter(v => v.totalAccidents !== null && v.totalAccidents > 0)
  .sort((a, b) => b.totalAccidents - a.totalAccidents)
  .slice(0, 5);
  console.log("combinedData", combinedData);
  const mostMaintained = [...combinedData]
    .filter(v => v.totalMaintenances !== null)
    .sort((a, b) => b.totalMaintenances - a.totalMaintenances)
    .slice(0, 5);
  console.log("most maintained", mostMaintained);
  const idleVehicles = combinedData.filter(v => v.daysSinceLastAssignment > 30);

  return (
    <div className="report-content">
      {/* Vehicle Type Pie Chart */}
      <div className="report-section">
        <h2 className="text-xl  font-semibold mb-3 mt-5 flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded shadow-sm">
            Vehicle Type Distribution
          </h2>

        <h3></h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.type_destribution}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.type_destribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Most Frequently Used Vehicles */}
      <div className="report-section">
        <h2 className="text-xl  font-semibold mb-3 mt-5 flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded shadow-sm">
            Most Frequently Used Vehicles
          </h2>
        {mostUsed.every(v => v.totalJourneys === 0) ? (
          <p
            style={{
              padding: '35px 0',
              textAlign: 'center',
              fontSize: '1.1rem',
              color: '#Ff0000',
              background: '#f3f4f6',
              borderRadius: '8px',
              margin: '10px 0'
            }}
          >
            No vehicle assignment till now for request.
          </p>
        ) : (
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Plate Number</th>
                  <th>Type</th>
                  <th>Total Journeys</th>
                  <th>Total Distance (km)</th>
                </tr>
              </thead>
              <tbody>
                {mostUsed.map((v, index) => (
                  <tr key={index}>
                    <td>{v.plateNumber}</td>
                    <td>{v.type}</td>
                    <td>{v.totalJourneys}</td>
                    <td>{v.totalDistance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Most Accident-Prone Vehicles */}
      <div className="report-section">
        <h2 className="text-xl font-semibold mb-3 mt-5 flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded shadow-sm">
          Vehicles with Highest Accident Records
        </h2>
        {mostAccidentProne.length === 0 ? (
          <p style={{
            padding: '35px 0',
            textAlign: 'center',
            fontSize: '1.1rem',
            color: '#Ff0000',
            background: '#f3f4f6',
            borderRadius: '8px',
            margin: '10px 0'
          }}>
            No accident records yet.
          </p>
        ) : (
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Plate Number</th>
                  <th>Type</th>
                  <th>Total Accidents</th>
                  <th>Total Journeys</th>
                  <th>Total Distance (km)</th>
                </tr>
              </thead>
              <tbody>
                {mostAccidentProne.map((v, index) => (
                  <tr key={index}>
                    <td>{v.plateNumber}</td>
                    <td>{v.type}</td>
                    <td>{v.totalAccidents}</td>
                    <td>{v.totalJourneys}</td>
                    <td>{v.totalDistance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Most Maintained Vehicles */}
      <div className="report-section">
        <h2 className="text-xl  font-semibold mb-3 mt-5 flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded shadow-sm">
            Most Maintained Vehicles
          </h2>
        {combinedData.every(v => v.totalMaintenances === 0 || v.totalMaintenances == null) ? (
          <p
            style={{
              padding: '35px 0',
              textAlign: 'center',
              fontSize: '1.1rem',
              color: '#Ff0000',
              background: '#f3f4f6',
              borderRadius: '8px',
              margin: '10px 0'
            }}
          >
            No maintenance records yet
          </p>
        ) : (
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Plate Number</th>
                  <th>Type</th>
                  <th>Maintenance Count</th>
                  <th>Total Distance (km)</th>
                </tr>
              </thead>
              <tbody>
                {mostMaintained.map((v, index) => (
                  <tr key={index}>
                    <td>{v.plateNumber}</td>
                    <td>{v.type}</td>
                    <td>{v.totalMaintenances}</td>
                    <td>{v.totalDistance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Idle Vehicles */}
      <div className="report-section">
          <h2 className="text-xl  font-semibold mb-3 mt-5 flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded shadow-sm">
            Most Idle Vehicles (Not Assigned in the Last 30 Days)
          </h2>
        {idleVehicles.length === 0 ? (
          <p
            style={{
              padding: '35px 0',
              textAlign: 'center',
              fontSize: '1.1rem',
              color: '#Ff0000',
              background: '#f3f4f6',
              borderRadius: '8px',
              margin: '10px 0'
            }}
          >
            No idle vehicles for the last 30 days.
          </p>
        ) : (
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Plate Number</th>
                  <th>Type</th>
                  <th>Last Assignment</th>
                  <th>Days Since Assignment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {idleVehicles.map((v, index) => (
                  <tr key={index}>
                    <td>{v.plateNumber}</td>
                    <td>{v.type}</td>
                    <td>{v.lastAssignment || 'Never'}</td>
                    <td>{v.daysSinceLastAssignment}</td>
                    <td>{v.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleReport;
