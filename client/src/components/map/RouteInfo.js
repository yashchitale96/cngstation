import React from 'react';
import PropTypes from 'prop-types';
import './RouteInfo.css';

const formatDistance = (meters) => {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
};

const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
};

const RouteInfo = ({ distance, time, steps, onClose, confidence, method }) => {
    return (
        <div className="route-info">
            <div className="route-info-header">
                <h3>Route Information</h3>
                <button className="close-button" onClick={onClose}>
                    <i className="bi bi-x-lg"></i>
                </button>
            </div>

            <div className="route-summary">
                <div className="summary-item">
                    <i className="bi bi-signpost-2"></i>
                    <div className="summary-details">
                        <span className="label">Distance</span>
                        <span className="value">{formatDistance(distance)}</span>
                    </div>
                </div>
                <div className="summary-item">
                    <i className="bi bi-clock"></i>
                    <div className="summary-details">
                        <span className="label">Estimated Time</span>
                        <span className="value">{formatTime(time)}</span>
                        {confidence && (
                            <span className="confidence" title={`Using ${method} estimation`}>
                                {(confidence * 100).toFixed(0)}% confidence
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="route-steps">
                <h4>
                    <i className="bi bi-list-ul"></i>
                    Directions
                </h4>
                <div className="steps-list">
                    {steps.map((step, index) => (
                        <div key={index} className="step-item">
                            <div className="step-number">{index + 1}</div>
                            <div className="step-content">
                                <p className="step-text">{step.text}</p>
                                <div className="step-details">
                                    <span className="step-distance">
                                        <i className="bi bi-arrows-move"></i>
                                        {formatDistance(step.distance)}
                                    </span>
                                    <span className="step-time">
                                        <i className="bi bi-clock"></i>
                                        {formatTime(step.time)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

RouteInfo.propTypes = {
    distance: PropTypes.number.isRequired,
    time: PropTypes.number.isRequired,
    steps: PropTypes.arrayOf(
        PropTypes.shape({
            text: PropTypes.string.isRequired,
            distance: PropTypes.number.isRequired,
            time: PropTypes.number.isRequired
        })
    ).isRequired,
    onClose: PropTypes.func.isRequired,
    confidence: PropTypes.number,
    method: PropTypes.string
};

export default RouteInfo;
