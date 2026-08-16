import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import api from '../api/axios'; 
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icon
const vehicleIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [40, 40],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const VehicleMap = () => {
  const [locations, setLocations] = useState([]);

    useEffect(() => {
    fetchLocations();

    const interval = setInterval(() => {
        fetchLocations();
    }, 10000);

    return () => clearInterval(interval);
    }, []);

    const fetchLocations = async () => {
    try {
        const res = await api.get('/vehicles/locations');
        console.log('Fetched locations:', res.data);
        setLocations(res.data);
    } catch (error) {
        console.error('Failed to fetch vehicle locations:', error);
    }
    };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer center={[9.03, 38.75]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {locations.map(loc => (
          <Marker
            key={loc.id}
            position={[loc.latitude, loc.longitude]}
            icon={vehicleIcon}
          >
            <Popup>
              <b>Vehicle ID:</b> {loc.vehicleId}<br />
              <b>Speed:</b> {loc.speed} km/h<br />
              <b>Time:</b> {new Date(loc.timestamp).toLocaleTimeString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default VehicleMap;
