import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import './Manager.css';
import api from '../../api/axios'; // Adjust the import path as necessary
import * as XLSX from 'xlsx';
import { duration } from '@mui/material';
// Create axios instance with default config


const JourneyLog = () => {
  const [journeys, setJourneys] = useState([]);
  const [requests, setRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  // use explicit start/end date filtering instead of a preset dropdown
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJourney, setSelectedJourney] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {        
        // Fetch journeys
        const journeyRes = await api.get('/logistics/journeys');
        setJourneys(journeyRes.data);

        // Fetch requests
        const requestRes = await api.get('/requests');
        setRequests(requestRes.data);

        // Fetch vehicles
        const vehicleRes = await api.get('/vehicles');
        setVehicles(vehicleRes.data);

        // Fetch drivers
        const driverRes = await api.get('/logistics/drivers');
        setDrivers(driverRes.data);

      } catch (err) {
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          setError(`Server error: ${err.response.status} - ${err.response.data}`);
        } else if (err.request) {
          // The request was made but no response was received
          setError('No response from server. Please check if the backend is running.');
        } else {
          // Something happened in setting up the request that triggered an Error
          setError(`Error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper functions to get vehicle plate and driver name
  const getVehiclePlate = (vehicleId) => {
    const v = vehicles.find(v => v.id === vehicleId);
    return v ? v.plate_number || v.plateNumber : '-';
  };

  const getDriverName = (driverId) => {
    const d = drivers.find(d => d.id === driverId);
    return d ? d.name : '-';
  };

  // We now use explicit start/end date inputs (YYYY-MM-DD). Empty values mean unbounded.

  // Filter journeys by search and date
  const filteredJourneys = journeys.filter(journey => {
    const searchMatch =
      (journey.startLocation || journey.start_location || '').toLowerCase().includes(search.toLowerCase()) ||
      (journey.endLocation || journey.end_location || '').toLowerCase().includes(search.toLowerCase()) ||
      (journey.purpose || '').toLowerCase().includes(search.toLowerCase()) ||
      getVehiclePlate(journey.vehicleId).toLowerCase().includes(search.toLowerCase()) ||
      getDriverName(journey.driverId).toLowerCase().includes(search.toLowerCase());

    // If neither start nor end date selected, only apply search filter
    if (!startDate && !endDate) return searchMatch;

    const journeyStart = new Date(journey.startTime || journey.start_time);
    if (isNaN(journeyStart)) return false; // skip journeys without a valid start time when date range is used

    // build inclusive range from selected dates
    const rangeStart = startDate ? new Date(startDate + 'T00:00:00') : null;
    const rangeEnd = endDate ? new Date(endDate + 'T23:59:59.999') : null;

    if (rangeStart && journeyStart < rangeStart) return false;
    if (rangeEnd && journeyStart > rangeEnd) return false;

    return searchMatch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const d = dateString instanceof Date ? dateString : new Date(dateString);
    return d.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="manager-dashboard-layout">
        <Sidebar />
        <main className="manager-dashboard-main">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Journey Logs</h1>
          </div>
          <div style={{ color: 'red', padding: '20px' }}>
            Error loading data: {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="manager-dashboard-layout">
      <Sidebar />
      <main className="manager-dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Journey Logs</h1>
        </div>
        <div className="vehicles-toolbar">
          <input
            className="vehicles-search"
            type="text"
            placeholder="Search by location, purpose, vehicle, or driver..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="date-filter" style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="date"
              className="date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Start date"
            />
            <span style={{ margin: '0 8px' }}> to </span>
            <input
              type="date"
              className="date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="End date"
            />
            <button
              type="button"
              className="action-btn"
              onClick={() => { setStartDate(''); setEndDate(''); }}
              style={{ marginLeft: 8 }}
            >
              Clear
            </button>
          </div>
          <div style={{ marginLeft: 12 }}>
            <button className="add-btn small" onClick={() => exportJourneysXLSX(filteredJourneys)}>Export XLSX</button>
          </div>
        </div>
        {loading ? (
          <div style={{ padding: '20px' }}>Loading journey logs...</div>
        ) : filteredJourneys.length === 0 ? (
          <div style={{ padding: '20px' }}>No journey logs found.</div>
        ) : (
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>No. </th>
                <th>Vehicle</th>
                <th>Driver</th>
                {/* <th>Department</th> */}
                {/* <th>End Location</th> */}
                {/* <th>Start Time</th> */}
                {/* <th>End Time</th> */}
                {/* <th>Distance (km)</th> */}
                <th>Purpose</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJourneys.map((journey, index) => {
                // Find the corresponding request
                const request = requests.find(r => r.id === journey.requestId);
                return (
                  <tr key={journey.id}>
                    <td>{index + 1}</td>
                    <td>{journey.vehicle.plateNumber}</td>
                    <td>{journey.driver.name}</td>
                    {/* <td>{request?.requester?.department?.name || 'N/A'}</td>
                    <td>{journey.endLocation || journey.end_location}</td>
                    <td>{formatDate(journey.startTime || journey.start_time)}</td>
                    <td>{formatDate(journey.endTime || journey.end_time)}</td>
                    <td>{journey.distance}</td> */}
                    <td>{journey.purpose}</td>
                    <td>
                      <button 
                        className="action-btn view"
                        onClick={() => setSelectedJourney({...journey, ...request})}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* View Modal */}
        {selectedJourney && (
          <div className="modal-bg">
            <div className="modal-card">
              <button className="modal-close" onClick={() => setSelectedJourney(null)}>&times;</button>
              <h2>Trip Details</h2>
              <div className="modal-info-grid">
                {/* Vehicle Information */}
                <div className="modal-section">
                  <h3>Vehicle Information</h3>
                  <div className="info-item">
                    <span className="label">Plate Number:</span>
                    <span className="value">
                      {selectedJourney.vehicle?.plateNumber || 
                       selectedJourney.vehicle?.plate_number || 
                       getVehiclePlate(selectedJourney.vehicleId)}
                    </span>
                  </div>
                </div>

                {/* Driver Information */}
                <div className="modal-section">
                  <h3>Driver Information</h3>
                  <div className="info-item">
                    <span className="label">Name:</span>
                    <span className="value">
                      {selectedJourney.vehicle?.driverName || 
                       selectedJourney.driver?.name || 
                       getDriverName(selectedJourney.driverId)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Phone:</span>
                    <span className="value">
                      {selectedJourney.vehicle?.driverPhoneNumber || 
                       selectedJourney.driver?.phoneNumber || 
                       'N/A'}
                    </span>
                  </div>
                </div>

                {/* Requester Information */}
                <div className="modal-section">
                  <h3>Requester Information</h3>
                  <div className="info-item">
                    <span className="label">Name:</span>
                    <span className="value">
                      {selectedJourney.requester?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Department:</span>
                    <span className="value">
                      {selectedJourney.requester?.department?.name || 'N/A'}
                    </span>
                  </div>
                              <div className="info-item">
                                <span className="label">Request Time:</span>
                                <span className="value">
                                  {formatDate(
                                    selectedJourney.requestTime || selectedJourney.request_time || selectedJourney.createdAt || selectedJourney.created_at
                                  )}
                                </span>
                              </div>
                </div>

                {/* Trip Details */}
                <div className="modal-section">
                  <h3>Trip Details</h3>
                  <div className="info-item">
                    <span className="label">Destination:</span>
                    <span className="value">
                      {selectedJourney.endLocation || 
                       selectedJourney.end_location || 
                       'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Purpose:</span>
                    <span className="value">
                      {selectedJourney.purpose || 'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Distance:</span>
                    <span className="value">
                      {selectedJourney.distance ? `${selectedJourney.distance} km` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Time Information */}
                <div className="modal-section">
                  <h3>Time Information</h3>
                  <div className="info-item">
                    <span className="label">Start Time:</span>
                    <span className="value">
                      {formatDate(selectedJourney.startTime || selectedJourney.start_time)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">End Time:</span>
                    <span className="value">
                      {formatDate(selectedJourney.endTime || selectedJourney.end_time)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Duration:</span>
                    <span className="value">
                      {(() => {
                        const s = selectedJourney.startTime ? new Date(selectedJourney.startTime) : (selectedJourney.start_time ? new Date(selectedJourney.start_time) : null);
                        const e = selectedJourney.endTime ? new Date(selectedJourney.endTime) : (selectedJourney.end_time ? new Date(selectedJourney.end_time) : null);
                        if (!s || !e) return 'N/A';
                        let diff = Math.max(0, Math.floor((e - s) / 1000));
                        const hours = Math.floor(diff / 3600);
                        diff %= 3600;
                        const minutes = Math.floor(diff / 60);
                        const seconds = diff % 60;
                        const pad = n => String(n).padStart(2, '0');
                        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
                      })()}
                    </span>
                  </div>
                </div>

                {/* Travelers Section */}
                <div className="modal-section full-width">
                  <h3>Travelers</h3>
                  <div className="travelers-list">
                    {selectedJourney.travelerNames && selectedJourney.travelerNames.length > 0 ? (
                      <ul>
                        {selectedJourney.travelerNames.map((name, index) => (
                          <li key={index}>{name}</li>
                        ))}
                      </ul>
                    ) : selectedJourney.travelers && selectedJourney.travelers.length > 0 ? (
                      <ul>
                        {selectedJourney.travelers.map((traveler, index) => (
                          <li key={index}>
                            {traveler.name ? traveler.name : `Traveler ${index + 1}`}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="no-travelers">No travelers assigned</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="action-btn cancel" onClick={() => setSelectedJourney(null)}>
                  Close
                </button>
                <button className="add-btn small" onClick={() => exportJourneyXLSX(selectedJourney)} style={{ marginLeft: 8 }}>
                  Export This Journey (XLSX)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
// --- XLSX export utilities using SheetJS ---
function exportJourneysXLSX(journeys) {
  if (!Array.isArray(journeys) || journeys.length === 0) {
    alert('No journeys to export');
    return;
  }

  const rows = journeys.map(j => normalizeJourneyForExport(j));
  const worksheet = XLSX.utils.json_to_sheet(rows, { skipHeader: false });
  // mark date cells so Excel recognizes them as dates (Excel will show them in local timezone)
  markDateCellsAsDates(worksheet, rows, ['startTime', 'endTime', 'requestTime', 'createdAt', 'updatedAt']);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Journeys');
  XLSX.writeFile(workbook, `journeys_export_${new Date().toISOString().slice(0,10)}.xlsx`);
}

function exportJourneyXLSX(journey) {
  if (!journey) return alert('No journey selected');
  const row = normalizeJourneyForExport(journey);
  const worksheet = XLSX.utils.json_to_sheet([row], { skipHeader: false });
  markDateCellsAsDates(worksheet, [row], ['startTime', 'endTime', 'requestTime', 'createdAt', 'updatedAt']);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Journey');
  XLSX.writeFile(workbook, `journey_${journey.id || 'export'}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

function normalizeJourneyForExport(j) {
  // parse start/end times (support both camelCase and snake_case) and request/created times
  const s = j.startTime ? new Date(j.startTime) : (j.start_time ? new Date(j.start_time) : null);
  const e = j.endTime ? new Date(j.endTime) : (j.end_time ? new Date(j.end_time) : null);
  const req = j.requestTime ? new Date(j.requestTime) : (j.request_time ? new Date(j.request_time) : (j.createdAt ? new Date(j.createdAt) : (j.created_at ? new Date(j.created_at) : null)));

  let durationSeconds = '';
  let duration = '';
  if (s && e && !isNaN(s.getTime()) && !isNaN(e.getTime())) {
    durationSeconds = Math.max(0, Math.floor((e.getTime() - s.getTime()) / 1000));
    let rem = durationSeconds;
    const hours = Math.floor(rem / 3600);
    rem = rem % 3600;
    const minutes = Math.floor(rem / 60);
    const seconds = rem % 60;
    const pad = n => String(n).padStart(2, '0');
    duration = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return {
    plateNumber: j.vehicle?.plateNumber || j.vehicle?.plate_number || '',
    driverName: j.driver?.name || j.driver?.driverName || '',
    departmentName: j.department?.name || (j.requester?.department?.name) || '',
    requestTime: j.request?.createdAt || '',
    startTime: j.startTime || '',
    endTime: j.endTime || '',
    duration,
    startingKilometer: j.startingKilometer || j.starting_kilometer || '',
    endingKilometer: j.endingKilometer || j.ending_kilometer || '',
    distance: j.distance || '',
    Location: j.endLocation || j.end_location || '',
    purpose: j.purpose || '',
    durationSeconds,
    travelers: (j.travelers || j.travelerNames || []).map(t => t.name || t).join('; '),
  };
}

function markDateCellsAsDates(worksheet, rows, dateKeys) {
  if (!worksheet || !rows || rows.length === 0) return;
  const header = Object.keys(rows[0]);
  dateKeys.forEach(key => {
    const colIndex = header.indexOf(key);
    if (colIndex === -1) return;
    for (let r = 0; r < rows.length; r++) {
      const cellAddress = XLSX.utils.encode_cell({ c: colIndex, r: r + 1 });
      const cell = worksheet[cellAddress];
      if (!cell) continue;
      if (cell.v && !(cell.v instanceof Date)) {
        const parsed = new Date(cell.v);
        if (!isNaN(parsed)) {
          cell.t = 'd';
          cell.v = parsed;
          // set number format so Excel displays date+time with seconds in local view
          cell.z = 'yyyy-mm-dd HH:MM:SS';
        }
      } else if (cell.v instanceof Date) {
        cell.t = 'd';
        cell.z = 'yyyy-mm-dd HH:MM:SS';
      }
    }
  });
}

export default JourneyLog;