// Dummy CNG stations near Pune
const dummyStations = [
    {
        id: 1,
        name: "Bharat Petroleum CNG Station",
        coordinates: {
            type: "Point",
            coordinates: [73.8567, 18.5204] // Pune City Center
        },
        address: "FC Road, Pune",
        waitingTime: 15,
        queueLength: 5,
        status: "Open",
        price: 85.50
    },
    {
        id: 2,
        name: "HP CNG Station - Kothrud",
        coordinates: {
            type: "Point",
            coordinates: [73.8125, 18.5089] // Kothrud
        },
        address: "Karve Road, Kothrud, Pune",
        waitingTime: 10,
        queueLength: 3,
        status: "Open",
        price: 85.50
    },
    {
        id: 3,
        name: "Indian Oil CNG - Hinjewadi",
        coordinates: {
            type: "Point",
            coordinates: [73.7379, 18.5913] // Hinjewadi
        },
        address: "Phase 1, Hinjewadi, Pune",
        waitingTime: 20,
        queueLength: 8,
        status: "Open",
        price: 85.50
    },
    {
        id: 4,
        name: "Mahanagar Gas Station",
        coordinates: {
            type: "Point",
            coordinates: [73.9252, 18.5622] // Viman Nagar
        },
        address: "Viman Nagar, Pune",
        waitingTime: 5,
        queueLength: 2,
        status: "Open",
        price: 85.50
    },
    {
        id: 5,
        name: "GAIL CNG Station",
        coordinates: {
            type: "Point",
            coordinates: [73.8913, 18.4929] // Hadapsar
        },
        address: "Hadapsar, Pune",
        waitingTime: 12,
        queueLength: 4,
        status: "Open",
        price: 85.50
    }
];

module.exports = dummyStations;
