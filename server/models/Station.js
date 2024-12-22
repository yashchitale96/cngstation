const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    current_queue: {
        type: Number,
        default: 0
    },
    operating_hours: {
        open: String,
        close: String
    }
});

// Create geospatial index
stationSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Station', stationSchema);
