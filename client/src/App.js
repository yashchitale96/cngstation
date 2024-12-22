import React, { useState, useRef, useEffect } from 'react';
import { Container, Alert } from 'react-bootstrap';
import Map from './components/map/Map';
import StationList from './components/StationList';
import StationModal from './components/StationModal';
import './App.css';

function App() {
    const [selectedStation, setSelectedStation] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [stations, setStations] = useState([]);
    const [error, setError] = useState(null);
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showList, setShowList] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const mapRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth > 768) {
                setShowList(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleStationSelect = (station) => {
        setSelectedStation(station);
        setShowModal(true);
        if (isMobile) {
            setShowList(false);
        }
    };

    const handleNavigate = async (station) => {
        try {
            setError(null);
            setLoading(true);
            if (mapRef.current) {
                await mapRef.current.getRoute(station);
                if (isMobile) {
                    setShowList(false);
                }
            }
        } catch (err) {
            console.error('Navigation error:', err);
            setError(err.message || 'Failed to calculate route');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const toggleList = () => {
        setShowList(!showList);
    };

    return (
        <div className="App">
            <header className="app-header">
                <h1>CNG Station Locator</h1>
                <p>Find nearby CNG stations and check waiting times</p>
            </header>

            {error && (
                <div className="alert-container">
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                </div>
            )}

            <div className="app-content">
                <Container fluid className="main-container">
                    <div className={`map-section ${!showList && isMobile ? 'expanded' : ''}`}>
                        <Map
                            ref={mapRef}
                            onStationsUpdate={setStations}
                            onError={setError}
                            onLocationEnabled={setLocationEnabled}
                        />
                    </div>
                    
                    {showList && (
                        <div className="list-section">
                            <StationList
                                stations={stations}
                                onStationSelect={handleStationSelect}
                                onNavigate={handleNavigate}
                                userLocationEnabled={locationEnabled}
                            />
                        </div>
                    )}
                </Container>

                {isMobile && (
                    <button 
                        className="toggle-list" 
                        onClick={toggleList}
                        aria-label={showList ? 'Hide station list' : 'Show station list'}
                    >
                        <i className={`bi bi-${showList ? 'chevron-down' : 'chevron-up'}`}></i>
                    </button>
                )}
            </div>

            {selectedStation && (
                <StationModal
                    show={showModal}
                    station={selectedStation}
                    onHide={() => {
                        setShowModal(false);
                        if (isMobile && !showList) {
                            setShowList(true);
                        }
                    }}
                    onNavigate={handleNavigate}
                    userLocationEnabled={locationEnabled}
                />
            )}

            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner" />
                </div>
            )}
        </div>
    );
}

export default App;
