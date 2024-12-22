import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PropTypes from 'prop-types';
import RouteInfo from './RouteInfo';
import './Map.css';

// Map update component that also handles routing
const MapController = ({ center, zoom, onMapReady }) => {
    const map = useMap();
    
    useEffect(() => {
        map.setView(center, zoom);
        if (onMapReady) {
            onMapReady(map);
        }
    }, [center, zoom, map, onMapReady]);
    
    return null;
};

const Map = forwardRef(({ onStationsUpdate, onError, onLocationEnabled }, ref) => {
    const [userLocation, setUserLocation] = useState(null);
    const [selectedStation, setSelectedStation] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);
    const [routeLayer, setRouteLayer] = useState(null);
    const [map, setMap] = useState(null);
    const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
    const [mapZoom, setMapZoom] = useState(5);

    const getRoute = async (userLoc, station) => {
        if (!map) return false;

        try {
            // Get route from OSRM
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/` +
                `${userLoc.lng},${userLoc.lat};${station.coordinates.lng},${station.coordinates.lat}` +
                `?overview=full&geometries=polyline&steps=true`
            );

            if (!response.ok) {
                throw new Error('Route calculation failed');
            }

            const data = await response.json();

            if (!data.routes || !data.routes[0]) {
                throw new Error('No route found');
            }

            const route = data.routes[0];
            
            // Get ML-based time estimation
            const timeEstimationResponse = await fetch('/api/time/estimate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    distance: route.distance / 1000, // Convert to kilometers
                    traffic_condition: 'medium', // TODO: Get real-time traffic data
                    weather: 'clear', // TODO: Get real-time weather data
                    time_of_day: getCurrentTimeOfDay(),
                    road_type: getRoadType(route),
                    day_of_week: new Date().getDay() === 0 || new Date().getDay() === 6 ? 'weekend' : 'weekday'
                }),
            });

            if (!timeEstimationResponse.ok) {
                throw new Error('Time estimation failed');
            }

            const timeEstimation = await timeEstimationResponse.json();
            
            // Decode polyline
            const coordinates = decodePolyline(route.geometry).map(coord => [coord[0], coord[1]]);

            // Create route layer
            if (routeLayer) {
                routeLayer.remove();
            }

            const newRouteLayer = L.polyline(coordinates, {
                color: '#4285F4',
                weight: 6,
                opacity: 0.8,
                lineCap: 'round',
                lineJoin: 'round'
            });

            newRouteLayer.addTo(map);
            setRouteLayer(newRouteLayer);

            // Fit map to show entire route
            const bounds = L.latLngBounds(coordinates);
            map.fitBounds(bounds, { padding: [50, 50] });

            // Process route information
            const steps = route.legs[0].steps.map(step => ({
                text: step.maneuver.instruction || step.name,
                distance: step.distance,
                time: step.duration
            }));

            setRouteInfo({
                distance: route.distance,
                time: timeEstimation.estimated_time * 60, // Convert minutes to seconds
                confidence: timeEstimation.confidence,
                method: timeEstimation.method,
                steps
            });

            return true;
        } catch (error) {
            console.error('Error getting route:', error);
            onError('Unable to calculate route. Please try again.');
            return false;
        }
    };

    // Helper function to determine time of day
    const getCurrentTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 10) return 'morning';
        if (hour >= 10 && hour < 16) return 'afternoon';
        if (hour >= 16 && hour < 20) return 'evening';
        return 'night';
    };

    // Helper function to determine road type based on route
    const getRoadType = (route) => {
        // Simple heuristic based on average speed
        const avgSpeed = route.distance / route.duration * 3.6; // Convert to km/h
        if (avgSpeed > 80) return 'highway';
        if (avgSpeed > 40) return 'main_road';
        return 'local_road';
    };

    // Function to decode Google's encoded polyline format
    const decodePolyline = (str) => {
        var index = 0,
            lat = 0,
            lng = 0,
            coordinates = [],
            shift = 0,
            result = 0,
            byte = null,
            latitude_change,
            longitude_change;

        while (index < str.length) {
            byte = null;
            shift = 0;
            result = 0;

            do {
                byte = str.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);

            latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

            shift = result = 0;

            do {
                byte = str.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);

            longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

            lat += latitude_change;
            lng += longitude_change;

            coordinates.push([lat / 1e5, lng / 1e5]);
        }

        return coordinates;
    };

    useImperativeHandle(ref, () => ({
        getRoute: async (station) => {
            if (!userLocation) {
                throw new Error('Please enable location services to get directions');
            }
            setSelectedStation(station);
            setMapCenter([userLocation.lat, userLocation.lng]);
            setMapZoom(13);
            return await getRoute(userLocation, station);
        }
    }));

    useEffect(() => {
        const getUserLocation = () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude: lat, longitude: lng } = position.coords;
                        setUserLocation({ lat, lng });
                        setMapCenter([lat, lng]);
                        setMapZoom(13);
                        onLocationEnabled(true);
                        fetchNearbyStations(lat, lng);
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        onError('Unable to get your location. Please enable location services.');
                        onLocationEnabled(false);
                    }
                );
            } else {
                onError('Geolocation is not supported by your browser');
                onLocationEnabled(false);
            }
        };

        getUserLocation();
    }, [onError, onLocationEnabled]);

    const fetchNearbyStations = async (lat, lng) => {
        try {
            // Simulated API call - replace with actual API endpoint
            const mockStations = [
                {
                    id: 1,
                    name: "Central CNG Station",
                    location: "123 Main St",
                    coordinates: { lat: lat + 0.01, lng: lng + 0.01 },
                    price: 85.5,
                    status: "Open",
                    distance: 1.2,
                    hours: "24/7",
                    queueLength: 3,
                    waitingTime: 15,
                    services: ["Car", "Bus", "Truck"]
                },
                // Add more mock stations as needed
            ];
            onStationsUpdate(mockStations);
        } catch (error) {
            console.error('Error fetching stations:', error);
            onError('Failed to fetch nearby stations');
        }
    };

    return (
        <div className="map-container">
            <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController 
                    center={mapCenter} 
                    zoom={mapZoom} 
                    onMapReady={setMap}
                />

                {userLocation && (
                    <Marker 
                        position={[userLocation.lat, userLocation.lng]}
                        icon={L.divIcon({
                            className: 'user-location-marker',
                            html: '<div class="pulse"></div>'
                        })}
                    >
                        <Popup>You are here</Popup>
                    </Marker>
                )}

                {selectedStation && (
                    <Marker
                        position={[selectedStation.coordinates.lat, selectedStation.coordinates.lng]}
                        icon={L.divIcon({
                            className: 'station-marker',
                            html: '<div class="station-point"></div>'
                        })}
                    >
                        <Popup>{selectedStation.name}</Popup>
                    </Marker>
                )}
            </MapContainer>

            {routeInfo && (
                <RouteInfo 
                    distance={routeInfo.distance}
                    time={routeInfo.time}
                    confidence={routeInfo.confidence}
                    method={routeInfo.method}
                    steps={routeInfo.steps}
                    onClose={() => {
                        setRouteInfo(null);
                        if (routeLayer) {
                            routeLayer.remove();
                            setRouteLayer(null);
                        }
                    }}
                />
            )}
        </div>
    );
});

Map.displayName = 'Map';

Map.propTypes = {
    onStationsUpdate: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    onLocationEnabled: PropTypes.func.isRequired
};

export default Map;
