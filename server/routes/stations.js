const express = require('express');
const router = express.Router();
const axios = require('axios');

// Mock data for CNG stations in Pune
const stations = [
    {
        id: 1,
        name: "Vadgaon HP CNG Station",
        location: "Vadgaon Budruk, Near Sinhgad College",
        coordinates: [73.8276, 18.4575],
        services: ['CNG', 'Car Wash'],
        hours: '24/7',
        contact: '+91 1234567890',
        status: 'Open',
        price: 85.50,
        queueLength: 3,
        waitingTime: 10
    },
    {
        id: 2,
        name: "Dhayari CNG Pump",
        location: "Dhayari Phata, Pune",
        coordinates: [73.8199, 18.4482],
        services: ['CNG', 'Air'],
        hours: '24/7',
        contact: '+91 9876543210',
        status: 'Open',
        price: 85.50,
        queueLength: 5,
        waitingTime: 15
    },
    {
        id: 3,
        name: "Narhe IOCL CNG",
        location: "Narhe Industrial Area, Pune",
        coordinates: [73.8234, 18.4447],
        services: ['CNG'],
        hours: '6 AM - 11 PM',
        contact: '+91 8765432109',
        status: 'Open',
        price: 85.50,
        queueLength: 2,
        waitingTime: 8
    },
    {
        id: 4,
        name: "Warje CNG Station",
        location: "Mumbai-Bangalore Highway, Warje",
        coordinates: [73.8082, 18.4872],
        services: ['CNG', 'Car Wash', 'Air'],
        hours: '24/7',
        contact: '+91 7654321098',
        status: 'Open',
        price: 85.50,
        queueLength: 7,
        waitingTime: 20
    },
    {
        id: 5,
        name: "Kothrud CNG Station",
        location: "Karve Road, Kothrud",
        coordinates: [73.8125, 18.5089],
        services: ['CNG', 'Air'],
        hours: '24/7',
        contact: '+91 6543210987',
        status: 'Open',
        price: 85.50,
        queueLength: 4,
        waitingTime: 12
    }
];

// Get all stations
router.get('/all', (req, res) => {
    res.json(stations);
});

// Get nearby stations based on location
router.get('/nearby', (req, res) => {
    try {
        const { lat, lng, radius = 5 } = req.query;
        console.log('Received nearby request:', { lat, lng, radius });
        
        if (!lat || !lng) {
            console.log('Missing coordinates');
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        if (isNaN(userLat) || isNaN(userLng)) {
            console.log('Invalid coordinates:', { userLat, userLng });
            return res.status(400).json({ error: 'Invalid coordinates' });
        }

        console.log('Searching for stations near:', { userLat, userLng });

        // Filter stations within radius (using Haversine formula)
        const nearbyStations = stations.map(station => {
            const distance = calculateDistance(
                userLat,
                userLng,
                station.coordinates[1],
                station.coordinates[0]
            );
            return { ...station, distance };
        }).filter(station => station.distance <= radius)
          .sort((a, b) => a.distance - b.distance);

        console.log(`Found ${nearbyStations.length} nearby stations`);
        res.json(nearbyStations);
    } catch (error) {
        console.error('Error finding nearby stations:', error);
        res.status(500).json({ error: 'Failed to find nearby stations' });
    }
});

// Get route between two points
router.get('/route', async (req, res) => {
    try {
        const { fromLat, fromLng, toLat, toLng } = req.query;

        if (!fromLat || !fromLng || !toLat || !toLng) {
            return res.status(400).json({ error: 'Start and end coordinates are required' });
        }

        const startLat = parseFloat(fromLat);
        const startLng = parseFloat(fromLng);
        const endLat = parseFloat(toLat);
        const endLng = parseFloat(toLng);

        if ([startLat, startLng, endLat, endLng].some(isNaN)) {
            return res.status(400).json({ error: 'Invalid coordinates' });
        }

        // Get OSRM route
        const osrmResponse = await axios.get(
            `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}`, {
                params: {
                    overview: 'full',
                    geometries: 'geojson',
                    steps: true,
                    annotations: true
                }
            }
        );

        if (!osrmResponse.data.routes || !osrmResponse.data.routes[0]) {
            throw new Error('No route found');
        }

        const route = osrmResponse.data.routes[0];
        const { coordinates } = route.geometry;
        const { distance } = route;

        // Get current conditions
        const currentHour = new Date().getHours();
        const isWeekend = [0, 6].includes(new Date().getDay());
        
        // Get traffic condition based on time
        const getTrafficCondition = (hour) => {
            if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
                return 'heavy';
            } else if ((hour >= 7 && hour <= 11) || (hour >= 16 && hour <= 20)) {
                return 'moderate';
            }
            return 'light';
        };

        // Get weather condition (mock - in real app, would call weather API)
        const getWeatherCondition = () => {
            const conditions = ['clear', 'rain', 'fog'];
            return conditions[Math.floor(Math.random() * conditions.length)];
        };

        // Calculate estimated time using our ML model
        const timeEstimationResponse = await axios.post(`${process.env.API_URL || 'http://localhost:5000'}/api/time/estimate`, {
            distance: distance / 1000, // Convert to km
            traffic_condition: getTrafficCondition(currentHour),
            weather: getWeatherCondition(),
            time_of_day: currentHour,
            road_type: 'urban',
            day_type: isWeekend ? 'weekend' : 'weekday'
        });

        // Get steps with adjusted duration based on our ML model
        const durationMultiplier = timeEstimationResponse.data.estimated_time / route.duration;
        const steps = route.legs[0].steps.map(step => ({
            instruction: step.maneuver.type === 'turn' ? `${step.maneuver.modifier} onto ${step.name}` : step.maneuver.type,
            distance: step.distance,
            duration: step.duration * durationMultiplier,
            coordinates: step.geometry.coordinates
        }));

        res.json({
            distance,
            duration: timeEstimationResponse.data.estimated_time,
            confidence: timeEstimationResponse.data.confidence,
            coordinates,
            steps,
            conditions: {
                traffic: getTrafficCondition(currentHour),
                weather: getWeatherCondition(),
                time: currentHour,
                isWeekend
            }
        });
    } catch (error) {
        console.error('Error calculating route:', error);
        res.status(500).json({ error: 'Failed to calculate route' });
    }
});

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function toRad(degrees) {
    return degrees * (Math.PI/180);
}

module.exports = router;
