
import React from 'react';
import './Manager.css';
import Sidebar from './Sidebar';
import VehicleMap from '../../components/VehicleMap';

const FleetTracking = () => {
  return (
     <div className="manager-dashboard-layout">
          <Sidebar />
          <main className={`manager-dashboard-main`}>
            <div className="dashboard-header">
              <h1 className="dashboard-title">Vehicles Location</h1>
            </div>
            <div className="dashboard-content">
              <VehicleMap />
            </div>
          </main>
     </div>
  );
}
export default FleetTracking;