import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import './StationModal.css';

const StationModal = ({ show, station, onHide, onNavigate, userLocationEnabled }) => {
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

    const formatTime = (time) => {
        const hours = Math.floor(time);
        const minutes = Math.round((time - hours) * 60);
        return `${hours}h ${minutes}m`;
    };

    const getWaitTimeClass = (time) => {
        if (time <= 5) return 'success';
        if (time <= 15) return 'warning';
        return 'danger';
    };

    if (!station) return null;

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            className="station-modal"
        >
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="w-100">
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">{station.name}</h4>
                        <Badge bg={getStatusColor(station.status)} className="status-badge">
                            {station.status}
                        </Badge>
                    </div>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="station-quick-info mb-4">
                    <Row>
                        <Col xs={12} md={6} className="mb-3 mb-md-0">
                            <div className="info-card">
                                <div className="info-icon">
                                    <i className="bi bi-geo-alt-fill"></i>
                                </div>
                                <div className="info-content">
                                    <h6>Location</h6>
                                    <p>{station.location}</p>
                                    {station.distance && (
                                        <small className="text-muted">
                                            {station.distance.toFixed(1)} km away
                                        </small>
                                    )}
                                </div>
                            </div>
                        </Col>
                        <Col xs={12} md={6}>
                            <div className="info-card">
                                <div className="info-icon">
                                    <i className="bi bi-clock-fill"></i>
                                </div>
                                <div className="info-content">
                                    <h6>Operating Hours</h6>
                                    <p>{station.hours}</p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>

                <div className="station-metrics mb-4">
                    <Row>
                        <Col xs={6} md={3}>
                            <div className="metric-card">
                                <div className="metric-icon">
                                    <i className="bi bi-currency-rupee"></i>
                                </div>
                                <div className="metric-content">
                                    <h6>Price</h6>
                                    <p>₹{station.price}/kg</p>
                                </div>
                            </div>
                        </Col>
                        <Col xs={6} md={3}>
                            <div className="metric-card">
                                <div className="metric-icon">
                                    <i className="bi bi-people-fill"></i>
                                </div>
                                <div className="metric-content">
                                    <h6>Queue</h6>
                                    <p>{station.queueLength} vehicles</p>
                                </div>
                            </div>
                        </Col>
                        <Col xs={6} md={3}>
                            <div className="metric-card">
                                <div className={`metric-icon text-${getWaitTimeClass(station.waitingTime)}`}>
                                    <i className="bi bi-hourglass-split"></i>
                                </div>
                                <div className="metric-content">
                                    <h6>Wait Time</h6>
                                    <p>{station.waitingTime} mins</p>
                                </div>
                            </div>
                        </Col>
                        <Col xs={6} md={3}>
                            <div className="metric-card">
                                <div className="metric-icon">
                                    <i className="bi bi-fuel-pump-fill"></i>
                                </div>
                                <div className="metric-content">
                                    <h6>Capacity</h6>
                                    <p>{station.capacity || 'N/A'}</p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>

                {station.services && station.services.length > 0 && (
                    <div className="station-services mb-4">
                        <h6 className="section-title">Available Services</h6>
                        <div className="services-grid">
                            {station.services.map((service, index) => (
                                <div key={index} className="service-item">
                                    <i className="bi bi-check-circle-fill text-success"></i>
                                    <span>{service}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {station.amenities && (
                    <div className="station-amenities mb-4">
                        <h6 className="section-title">Amenities</h6>
                        <div className="amenities-grid">
                            {station.amenities.map((amenity, index) => (
                                <Badge 
                                    key={index}
                                    bg="light" 
                                    text="dark"
                                    className="amenity-badge"
                                >
                                    {amenity}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {station.description && (
                    <div className="station-description mb-4">
                        <h6 className="section-title">About</h6>
                        <p className="description-text">{station.description}</p>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="border-0">
                <Button 
                    variant="outline-secondary" 
                    onClick={onHide}
                    className="px-4"
                >
                    Close
                </Button>
                <Button
                    variant="primary"
                    onClick={() => onNavigate(station)}
                    disabled={!userLocationEnabled}
                    className="px-4"
                >
                    <i className="bi bi-compass me-2"></i>
                    Navigate
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

StationModal.propTypes = {
    show: PropTypes.bool.isRequired,
    station: PropTypes.shape({
        name: PropTypes.string.isRequired,
        location: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        hours: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        queueLength: PropTypes.number.isRequired,
        waitingTime: PropTypes.number.isRequired,
        capacity: PropTypes.string,
        distance: PropTypes.number,
        services: PropTypes.arrayOf(PropTypes.string),
        amenities: PropTypes.arrayOf(PropTypes.string),
        description: PropTypes.string
    }),
    onHide: PropTypes.func.isRequired,
    onNavigate: PropTypes.func.isRequired,
    userLocationEnabled: PropTypes.bool.isRequired
};

export default StationModal;
