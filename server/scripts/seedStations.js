const mongoose = require('mongoose');
const Station = require('../models/Station');
require('dotenv').config();

const stations = [
    {
        name: "CNG Station - Pune Central",
        location: "MG Road, Pune",
        coordinates: {
            type: "Point",
            coordinates: [73.8567, 18.5204] // [longitude, latitude]
        },
        current_queue: 3,
        avg_service_time: 5,
        operating_hours: {
            open: "06:00",
            close: "22:00"
        }
    },
    {
        name: "CNG Station - Kothrud",
        location: "Kothrud, Pune",
        coordinates: {
            type: "Point",
            coordinates: [73.8132, 18.5074]
        },
        current_queue: 5,
        avg_service_time: 4,
        operating_hours: {
            open: "00:00",
            close: "24:00"
        }
    },
    {
        name: "CNG Station - Hinjewadi",
        location: "Hinjewadi Phase 1, Pune",
        coordinates: {
            type: "Point",
            coordinates: [73.7379, 18.5913]
        },
        current_queue: 7,
        avg_service_time: 6,
        operating_hours: {
            open: "06:00",
            close: "23:00"
        }
    },
    {
        name: "CNG Station - Hadapsar",
        location: "Hadapsar, Pune",
        coordinates: {
            type: "Point",
            coordinates: [73.9300, 18.5089]
        },
        current_queue: 2,
        avg_service_time: 5,
        operating_hours: {
            open: "06:00",
            close: "22:00"
        }
    },
    {
        name: "CNG Station - Baner",
        location: "Baner Road, Pune",
        coordinates: {
            type: "Point",
            coordinates: [73.7868, 18.5590]
        },
        current_queue: 4,
        avg_service_time: 5,
        operating_hours: {
            open: "05:00",
            close: "23:00"
        }
    }
];

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        
        // Clear existing stations
        await Station.deleteMany({});
        console.log('Cleared existing stations');

        // Insert new stations
        await Station.insertMany(stations);
        console.log('Added sample stations');

        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
