import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, Form, InputGroup, Badge } from 'react-bootstrap';
import StationCard from './StationCard';
import './StationList.css';

const StationList = ({ stations, onStationSelect, onNavigate, userLocationEnabled }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('distance');
    const [isCompact, setIsCompact] = useState(window.innerWidth <= 768);
    const [showFilters, setShowFilters] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            setIsCompact(window.innerWidth <= 768);
            if (window.innerWidth > 768) {
                setShowFilters(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const filteredStations = stations
        .filter(station => 
            station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            station.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'distance':
                    return (a.distance || 0) - (b.distance || 0);
                case 'waiting':
                    return (a.waitingTime || 0) - (b.waitingTime || 0);
                case 'price':
                    return (a.price || 0) - (b.price || 0);
                default:
                    return 0;
            }
        });

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    return (
        <div className="station-list-container">
            <div className="station-list-header">
                <div className="header-content">
                    <h2>
                        <i className="bi bi-geo-alt-fill"></i>
                        Nearby Stations
                        <Badge bg="primary" className="station-count">
                            {filteredStations.length}
                        </Badge>
                    </h2>
                    {isCompact && (
                        <button 
                            className="filter-toggle"
                            onClick={toggleFilters}
                            aria-label={showFilters ? 'Hide filters' : 'Show filters'}
                        >
                            <i className={`bi bi-funnel${showFilters ? '-fill' : ''}`}></i>
                        </button>
                    )}
                </div>

                {(showFilters || !isCompact) && (
                    <div className="station-filters">
                        <InputGroup className="search-box">
                            <InputGroup.Text>
                                <i className="bi bi-search"></i>
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Search by name or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="Search stations"
                            />
                            {searchTerm && (
                                <InputGroup.Text 
                                    as="button"
                                    className="clear-search"
                                    onClick={() => setSearchTerm('')}
                                >
                                    <i className="bi bi-x-lg"></i>
                                </InputGroup.Text>
                            )}
                        </InputGroup>

                        <Form.Select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select"
                            aria-label="Sort stations"
                        >
                            <option value="distance">Sort by Distance</option>
                            <option value="waiting">Sort by Wait Time</option>
                            <option value="price">Sort by Price</option>
                        </Form.Select>
                    </div>
                )}
            </div>

            <Container fluid className="station-list-content">
                <Row className="station-grid">
                    {filteredStations.length > 0 ? (
                        filteredStations.map(station => (
                            <Col 
                                key={station.id} 
                                xs={12} 
                                sm={showFilters ? 12 : 6} 
                                md={6} 
                                lg={4} 
                                className="station-grid-item"
                            >
                                <StationCard
                                    station={station}
                                    onViewDetails={onStationSelect}
                                    onNavigate={onNavigate}
                                    userLocationEnabled={userLocationEnabled}
                                />
                            </Col>
                        ))
                    ) : (
                        <div className="no-stations">
                            <div className="no-results-content">
                                <i className="bi bi-geo-alt-fill"></i>
                                <p>No stations found matching your search.</p>
                                {searchTerm && (
                                    <button 
                                        className="clear-search-btn"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </Row>
            </Container>
        </div>
    );
};

StationList.propTypes = {
    stations: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
            location: PropTypes.string.isRequired,
            distance: PropTypes.number,
            price: PropTypes.number.isRequired,
            hours: PropTypes.string.isRequired,
            status: PropTypes.string.isRequired,
            queueLength: PropTypes.number.isRequired,
            waitingTime: PropTypes.number.isRequired,
            services: PropTypes.arrayOf(PropTypes.string).isRequired
        })
    ).isRequired,
    onStationSelect: PropTypes.func.isRequired,
    onNavigate: PropTypes.func.isRequired,
    userLocationEnabled: PropTypes.bool.isRequired
};

export default StationList;
