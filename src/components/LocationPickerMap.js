import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


const LocationMarker = ({ position, setPosition }) => {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

const LocationPickerMap = ({ onLocationSelect }) => {
    const [position, setPosition] = useState(null);
    const indiaCenter = [20.5937, 78.9629];

    // Define the bounding box for India [south-west corner, north-east corner]
    const indiaBounds = [
        [6.74, 68.11], // Approx. South-West
        [37.09, 97.41]  // Approx. North-East
    ];

    const handlePositionChange = (latlng) => {
        setPosition(latlng);
        onLocationSelect(latlng);
    }

    return (
        <div className="location-picker-container">
            <h4>Select Location by Clicking on the Map</h4>
            <MapContainer 
                center={indiaCenter} 
                zoom={5} 
                scrollWheelZoom={true}
                maxBounds={indiaBounds} // Restrict panning to India
                minZoom={5}             // Prevent zooming out too far
                style={{ height: '500px', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> | Map data provided by Maps of India'
                />
                <LocationMarker position={position} setPosition={handlePositionChange} />
            </MapContainer>
            {position && (
                <p>
                    Selected Coordinates: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                </p>
            )}
        </div>
    );
};

export default LocationPickerMap; 