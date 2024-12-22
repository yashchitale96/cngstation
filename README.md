# CNG Station Locator

A MERN stack application for locating and navigating to nearby CNG stations.

## Features

- View nearby CNG stations on a map
- Check real-time queue length and waiting times
- Get turn-by-turn navigation to stations
- Real-time updates of station status

## Tech Stack

- MongoDB: Database
- Express.js: Backend framework
- React.js: Frontend framework
- Node.js: Runtime environment
- OpenLayers: Map integration
- OpenRouteService: Navigation service

## Setup Instructions

1. Install MongoDB locally or use MongoDB Atlas

2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Configure environment variables:
   - Create `.env` file in the server directory
   - Add required environment variables:
     ```
     MONGODB_URI=your_mongodb_uri
     PORT=5000
     OPENROUTE_API_KEY=your_openroute_api_key
     ```

4. Start the application:
   ```bash
   # Start server (from server directory)
   npm run dev

   # Start client (from client directory)
   npm start
   ```

5. Access the application at `http://localhost:3000`

## API Endpoints

- `GET /api/stations`: Get all CNG stations
- `GET /api/stations/waiting-time/:id`: Get waiting time for a specific station
- `GET /api/stations/route`: Get navigation route between two points

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
