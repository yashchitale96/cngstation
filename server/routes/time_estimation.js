const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

// Time estimation constants
const TRAFFIC_MULTIPLIERS = {
    low: 1,
    medium: 1.3,
    high: 1.8
};

const WEATHER_MULTIPLIERS = {
    clear: 1,
    rain: 1.4,
    snow: 1.8
};

const TIME_OF_DAY_MULTIPLIERS = {
    morning: 1.2,
    afternoon: 1,
    evening: 1.3,
    night: 0.8
};

const ROAD_TYPE_MULTIPLIERS = {
    highway: 0.8,
    main_road: 1,
    local_road: 1.2
};

const DAY_TYPE_MULTIPLIERS = {
    weekday: 1,
    weekend: 0.9
};

// Base speed in km/h for different road types
const BASE_SPEEDS = {
    highway: 80,
    main_road: 50,
    local_road: 30
};

router.post('/estimate', (req, res) => {
    try {
        const {
            distance, // in kilometers
            traffic_condition = 'moderate',
            weather = 'sunny',
            time_of_day = 'afternoon',
            road_type = 'main_road',
            day_of_week = 'weekday'
        } = req.body;

        console.log('Estimating time with params:', {
            distance,
            traffic_condition,
            weather,
            time_of_day,
            road_type,
            day_of_week
        });

        if (!distance || isNaN(distance)) {
            return res.status(400).json({ error: 'Valid distance is required' });
        }

        // Convert time_of_day to ML model format
        const timeOfDayMap = {
            'morning': 'morning_peak',
            'afternoon': 'afternoon',
            'evening': 'evening_peak',
            'night': 'night'
        };

        // Convert traffic_condition to ML model format
        const trafficMap = {
            'low': 'light',
            'medium': 'moderate',
            'high': 'heavy'
        };

        // Prepare input for ML model
        const mlInput = {
            distance: parseFloat(distance),
            traffic_condition: trafficMap[traffic_condition] || 'moderate',
            weather: weather === 'clear' ? 'sunny' : weather,
            time_of_day: timeOfDayMap[time_of_day] || 'afternoon',
            road_type: road_type === 'local_road' ? 'inner_road' : road_type,
            day_of_week
        };

        // Spawn Python process to run prediction
        const pythonProcess = spawn('python', [
            path.join(__dirname, '../ml/predict.py'),
            JSON.stringify(mlInput)
        ]);

        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('ML prediction error:', error);
                // Fallback to rule-based system if ML fails
                const baseSpeed = {
                    highway: 80,
                    main_road: 50,
                    local_road: 30
                }[road_type] || 50;

                const baseTime = (distance / baseSpeed) * 60;

                const multipliers = {
                    traffic: { low: 1, medium: 1.3, high: 1.8 }[traffic_condition] || 1.3,
                    weather: { clear: 1, rain: 1.4, snow: 1.8 }[weather] || 1,
                    timeOfDay: { morning: 1.2, afternoon: 1, evening: 1.3, night: 0.8 }[time_of_day] || 1,
                    roadType: { highway: 0.8, main_road: 1, local_road: 1.2 }[road_type] || 1,
                    dayType: { weekday: 1, weekend: 0.9 }[day_of_week] || 1
                };

                const estimatedTime = Math.round(
                    baseTime *
                    multipliers.traffic *
                    multipliers.weather *
                    multipliers.timeOfDay *
                    multipliers.roadType *
                    multipliers.dayType
                );

                return res.json({
                    estimated_time: estimatedTime,
                    confidence: 0.7, // Lower confidence for rule-based fallback
                    method: 'rule-based'
                });
            }

            try {
                const mlResult = JSON.parse(result);
                res.json({
                    estimated_time: Math.round(mlResult.estimated_time),
                    confidence: mlResult.confidence,
                    method: 'ml'
                });
            } catch (parseError) {
                console.error('Error parsing ML result:', parseError);
                res.status(500).json({ error: 'Failed to parse ML prediction' });
            }
        });

    } catch (error) {
        console.error('Error estimating time:', error);
        res.status(500).json({ error: 'Failed to estimate time' });
    }
});

module.exports = router;
