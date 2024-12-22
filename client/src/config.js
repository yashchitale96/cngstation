// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Map configuration
export const DEFAULT_CENTER = [73.8567, 18.5204]; // Pune
export const DEFAULT_ZOOM = 12;

// Time estimation constants
export const TRAFFIC_CONDITIONS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};

export const WEATHER_CONDITIONS = {
    CLEAR: 'clear',
    RAIN: 'rain',
    SNOW: 'snow'
};

export const TIME_OF_DAY = {
    MORNING: 'morning',
    AFTERNOON: 'afternoon',
    EVENING: 'evening',
    NIGHT: 'night'
};

// Helper functions
export const getCurrentTrafficCondition = () => {
    const hour = new Date().getHours();
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
        return TRAFFIC_CONDITIONS.HIGH;
    } else if ((hour >= 11 && hour <= 16) || (hour >= 20 && hour <= 22)) {
        return TRAFFIC_CONDITIONS.MEDIUM;
    }
    return TRAFFIC_CONDITIONS.LOW;
};

export const getCurrentWeather = () => {
    // In a real app, this would come from a weather API
    return WEATHER_CONDITIONS.CLEAR;
};

export const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
        return TIME_OF_DAY.MORNING;
    } else if (hour >= 12 && hour < 17) {
        return TIME_OF_DAY.AFTERNOON;
    } else if (hour >= 17 && hour < 20) {
        return TIME_OF_DAY.EVENING;
    }
    return TIME_OF_DAY.NIGHT;
};

export const isWeekend = () => {
    const day = new Date().getDay();
    return day === 0 || day === 6;
};
