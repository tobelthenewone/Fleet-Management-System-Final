import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './Vehicle.css';
import api from '../../api/axios';
import axios from 'axios';

const AIMaintenanceSuggestion = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState({});

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vehicles');
      setVehicles(response.data);
      // After fetching vehicles, get predictions for each
      await getPredictions(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasAllRequiredInputs = (vehicle) => {
    return (
      vehicle.yearOfMade != null &&
      vehicle.mileage != null && vehicle.mileage > 0 &&
      vehicle.kilometersSinceLastService != null && vehicle.kilometersSinceLastService > 0 &&
      vehicle.recentBreakdown != null &&
      vehicle.maintenanceLastMonth != null
    );
  };

  const getPredictions = async (vehicles) => {
    const newPredictions = {};
    
    for (const vehicle of vehicles) {
      try {
        if (!hasAllRequiredInputs(vehicle)) {
          newPredictions[vehicle.id] = 'Inputs not available';
          continue;
        }

        const age = calculateVehicleAge(vehicle.yearOfMade);
        const predictionData = {
          age: age,
          mileage: vehicle.mileage || 0,
          last_service_km: vehicle.kilometersSinceLastService || 0,
          recent_breakdown: vehicle.recentBreakdown ? 1 : 0,
          maintenance_last_month: vehicle.maintenanceLastMonth ? 1 : 0
        };

        const response = await axios({
          method: 'post',
          url: 'http://127.0.0.1:5000/predict',
          data: predictionData,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: false
        });

        console.log('Prediction response:', response.data); // Debug log
        newPredictions[vehicle.id] = response.data.maintenance_required === 1 ? 'Maintenance needed' : 'Not needed';
      } catch (err) {
        console.error(`Error getting prediction for vehicle ${vehicle.id}:`, err);
        console.error('Error details:', err.response?.data || err.message); // Debug log
        newPredictions[vehicle.id] = 'Error getting prediction';
      }
    }
    
    setPredictions(newPredictions);
  };

  const calculateVehicleAge = (yearOfMade) => {
    const currentYear = new Date().getFullYear();
    return currentYear - yearOfMade;
  };

  const getStatusBadgeClass = (prediction) => {
    if (prediction === 'Maintenance needed') return 'status-fail';
    if (prediction === 'Not needed') return 'status-pass';
    return 'status-warning'; // For "Inputs not available" and other states
  };

  return (
    <div className="manager-dashboard-layout">
      <Sidebar />
      <main className="manager-dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">AI MAINTENANCE SUGGESTIONS</h1>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading">Loading vehicles and getting AI predictions...</div>
        ) : (
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Plate Number</th>
                <th>Vehicle Age</th>
                <th>Mileage (km)</th>
                <th>Km Since Last Service</th>
                <th>Recent Breakdown</th>
                <th>Maintenance Last Month</th>
                <th>Maintenance Needed</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(vehicle => (
                <tr key={vehicle.id}>
                  <td>{vehicle.model}</td>
                  <td>{vehicle.plateNumber}</td>
                  <td>{calculateVehicleAge(vehicle.yearOfMade)} years</td>
                  <td>{vehicle.mileage ? `${vehicle.mileage} km` : 'N/A'}</td>
                  <td>{vehicle.kilometersSinceLastService ? `${vehicle.kilometersSinceLastService} km` : 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${vehicle.recentBreakdown ? 'status-fail' : 'status-pass'}`}>
                      {vehicle.recentBreakdown ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${vehicle.maintenanceLastMonth ? 'status-pass' : 'status-fail'}`}>
                      {vehicle.maintenanceLastMonth ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(predictions[vehicle.id])}`}>
                      {predictions[vehicle.id] || 'Loading...'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
};

export default AIMaintenanceSuggestion; 