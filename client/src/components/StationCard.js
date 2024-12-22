import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Badge } from 'react-bootstrap';
import './StationCard.css';

/**
 * StationCard component displays individual station information
 */
const StationCard = ({ station, onViewDetails, onNavigate, userLocationEnabled }) => {
    const handleNavigate = async (e) => {
        e.stopPropagation();
        if (userLocationEnabled) {
            try {
                await onNavigate(station);
            } catch (error) {
                console.error('Navigation failed:', error);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'open':
                return 'success';
            case 'busy':
                return 'warning';
            case 'closed':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    const getWaitTimeColor = (time) => {
        if (time <= 5) return 'text-success';
        if (time <= 15) return 'text-warning';
        return 'text-danger';
    };

    return (
        <Card 
            className="station-card h-100" 
            onClick={() => onViewDetails(station)}
        >
            <Card.Body>
                <div className="station-header">
                    <Card.Title className="station-name">
                        {station.name}
                        <Badge 
                            bg={getStatusColor(station.status)}
                            className="status-badge"
                        >
                            {station.status}
                        </Badge>
                    </Card.Title>
                </div>

                <div className="station-info">
                    <div className="info-item">
                        <i className="bi bi-geo-alt"></i>
                        <span>{station.location}</span>
                    </div>
                    {station.distance && (
                        <div className="info-item">
                            <i className="bi bi-signpost-2"></i>
                            <span>{(station.distance).toFixed(1)} km away</span>
                        </div>
                    )}
                    <div className="info-item">
                        <i className="bi bi-currency-rupee"></i>
                        <span>₹{station.price}/kg</span>
                    </div>
                    <div className="info-item">
                        <i className="bi bi-clock"></i>
                        <span>{station.hours}</span>
                    </div>
                </div>

                <div className="station-metrics">
                    <div className={`metric ${getWaitTimeColor(station.waitingTime)}`}>
                        <i className="bi bi-people"></i>
                        <span>Queue: {station.queueLength} vehicles</span>
                    </div>
                    <div className={`metric ${getWaitTimeColor(station.waitingTime)}`}>
                        <i className="bi bi-hourglass-split"></i>
                        <span>~{station.waitingTime} min wait</span>
                    </div>
                </div>

                {station.services && station.services.length > 0 && (
                    <div className="station-services">
                        {station.services.map((service, index) => (
                            <Badge 
                                key={index}
                                bg="light" 
                                text="dark"
                                className="service-badge"
                            >
                                {service}
                            </Badge>
                        ))}
                    </div>
                )}

                <div className="station-actions">
                    <Button
                        variant="primary"
                        onClick={handleNavigate}
                        disabled={!userLocationEnabled}
                        className="navigate-btn"
                        title={userLocationEnabled ? 'Get directions' : 'Enable location to get directions'}
                    >
                        <i className="bi bi-compass"></i>
                        Navigate
                    </Button>
                    <Button 
                        variant="outline-primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(station);
                        }}
                        className="details-btn"
                    >
                        <i className="bi bi-info-circle"></i>
                        Details
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

StationCard.propTypes = {
    station: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        location: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        hours: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        queueLength: PropTypes.number.isRequired,
        waitingTime: PropTypes.number.isRequired,
        distance: PropTypes.number,
        services: PropTypes.arrayOf(PropTypes.string)
    }).isRequired,
    onViewDetails: PropTypes.func.isRequired,
    onNavigate: PropTypes.func.isRequired,
    userLocationEnabled: PropTypes.bool.isRequired
};

export default StationCard;
