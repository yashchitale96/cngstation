const express = require('express');
const cors = require('cors');
const stationsRouter = require('./routes/stations');
const timeEstimationRouter = require('./routes/time_estimation');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, req.body);
    next();
});

// Routes
app.use('/api/stations', stationsRouter);
app.use('/api/time', timeEstimationRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
