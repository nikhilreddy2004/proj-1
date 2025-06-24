import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import LocationPickerMap from './LocationPickerMap';
import './Volunteer.css';
import './LocationPickerMap.css';
import L from 'leaflet';

// Helper component to automatically adjust map bounds
const FitBounds = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        if (points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [points, map]);
    return null;
};

const VolunteerMap = ({ keyProp }) => {
    const [volunteers, setVolunteers] = useState([]);
    
    useEffect(() => {
        const fetchVolunteers = async () => {
            const querySnapshot = await getDocs(collection(db, "volunteers"));
            const volunteersList = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(v => v.latitude && v.longitude);
            setVolunteers(volunteersList);
        };
        fetchVolunteers();
    }, [keyProp]); // Re-fetch when the key changes

    const volunteerPoints = volunteers.map(v => [v.latitude, v.longitude]);

    // Centered on India, used only if there are no volunteers
    const initialPosition = [20.5937, 78.9629];

    return (
        <div className="map-container">
            <h3>Volunteer Locations</h3>
            <MapContainer center={initialPosition} zoom={5} scrollWheelZoom={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {volunteers.map(volunteer => (
                    <Marker key={volunteer.id} position={[volunteer.latitude, volunteer.longitude]}>
                        <Popup>
                            <strong>{volunteer.name}</strong><br />
                            {volunteer.location}
                        </Popup>
                    </Marker>
                ))}
                <FitBounds points={volunteerPoints} />
            </MapContainer>
        </div>
    );
};

const Volunteer = () => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [coordinates, setCoordinates] = useState(null);
    const [mapKey, setMapKey] = useState(Date.now());

    const handleLocationSelect = (latlng) => {
        setCoordinates(latlng);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !location || !coordinates) {
            alert('Please fill out the name, description, and select a location on the map.');
            return;
        }
        try {
            await addDoc(collection(db, "volunteers"), {
                name: name,
                location: location,
                latitude: coordinates.lat,
                longitude: coordinates.lng,
                assigned_center: '',
                resources: []
            });
            alert('Volunteer added!');
            setName('');
            setLocation('');
            setCoordinates(null);
            setMapKey(Date.now());
        } catch (error) {
            console.error("Error adding volunteer: ", error);
            alert('Error adding volunteer');
        }
    };

    return (
        <div className="volunteer-container">
            <VolunteerMap keyProp={mapKey} />
            <hr />
            <h2>Manage Volunteers</h2>
            <div className="volunteer-form">
                <h3>Add New Volunteer</h3>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <input type="text" placeholder="Location Description (e.g., Delhi Center)" value={location} onChange={(e) => setLocation(e.target.value)} />
                    
                    <LocationPickerMap onLocationSelect={handleLocationSelect} />

                    <button type="submit">Add Volunteer</button>
                </form>
            </div>
        </div>
    );
};

export default Volunteer; 