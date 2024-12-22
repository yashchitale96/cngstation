/**
 * Format distance in meters to a human-readable string
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export const formatDistance = (meters) => {
    if (!meters) return 'N/A';
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
};

/**
 * Format waiting time with appropriate color coding
 * @param {number} minutes - Waiting time in minutes
 * @returns {object} Object containing formatted time and color coding
 */
export const formatWaitingTime = (minutes) => {
    if (!minutes && minutes !== 0) return { text: 'N/A', variant: 'secondary' };
    
    return {
        text: `${minutes} mins`,
        variant: minutes > 15 ? 'danger' : minutes > 10 ? 'warning' : 'success'
    };
};

/**
 * Format queue length with appropriate color coding
 * @param {number} queueLength - Number of vehicles in queue
 * @returns {object} Object containing formatted queue and color coding
 */
export const formatQueueLength = (queueLength) => {
    if (!queueLength && queueLength !== 0) return { text: 'N/A', variant: 'secondary' };
    
    return {
        text: `${queueLength} vehicles`,
        variant: queueLength > 5 ? 'danger' : queueLength > 3 ? 'warning' : 'success'
    };
};
