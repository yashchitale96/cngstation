import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Service class for handling CNG station related API calls
 */
class StationService {
    /**
     * Get all stations
     * @returns {Promise<Array>} List of all stations
     */
    static async getAllStations() {
        try {
            const response = await axios.get(`${API_BASE_URL}/stations`);
            return response.data;
        } catch (error) {
            console.error('Error fetching stations:', error);
            throw error;
        }
    }

    /**
     * Get nearby stations based on location
     * @param {number} longitude - Longitude coordinate
     * @param {number} latitude - Latitude coordinate
     * @param {number} radius - Search radius in meters
     * @returns {Promise<Array>} List of nearby stations
     */
    static async getNearbyStations(longitude, latitude, radius = 5000) {
        try {
            const response = await axios.get(`${API_BASE_URL}/stations/nearby`, {
                params: { longitude, latitude, radius }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching nearby stations:', error);
            throw error;
        }
    }

    /**
     * Get waiting time information for a specific station
     * @param {string} stationId - Station ID
     * @returns {Promise<Object>} Waiting time information
     */
    static async getWaitingTime(stationId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/stations/waiting-time/${stationId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching waiting time:', error);
            throw error;
        }
    }

    /**
     * Get route between two points
     * @param {Object} start - Starting coordinates {lat, lon}
     * @param {Object} end - Ending coordinates {lat, lon}
     * @returns {Promise<Object>} Route information
     */
    static async getRoute(start, end) {
        try {
            const response = await axios.post(`${API_BASE_URL}/stations/route`, {
                start: `${start.lat},${start.lon}`,
                end: `${end.lat},${end.lon}`
            });
            return response.data;
        } catch (error) {
            console.error('Error calculating route:', error);
            throw error;
        }
    }
}

export default StationService;
