#!/usr/bin/env node

/**
 * Diagnostic script to check Flight Booking System health
 * Run: node diagnose.js
 */

const axios = require('axios');
const mongoose = require('mongoose');

const BACKEND_URL = 'http://localhost:5000';
const PYTHON_URL = 'http://localhost:8000';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flight-booking-simulator';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}`),
};

const diagnose = async () => {
  console.clear();
  log.header('🔍 Flight Booking System Diagnostic Tool');
  console.log('');

  // 1. Check Backend
  log.header('1️⃣  Checking Backend Service...');
  try {
    const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
    log.success(`Backend is running on ${BACKEND_URL}`);
    log.info(`Status: ${JSON.stringify(response.data)}`);
  } catch (error) {
    log.error(`Backend is not responding on ${BACKEND_URL}`);
    log.warning('Make sure to run: npm start (in backend-node directory)');
  }

  // 2. Check Python Service
  log.header('2️⃣  Checking Python Pricing Service...');
  try {
    const response = await axios.get(`${PYTHON_URL}/health`, { timeout: 5000 });
    log.success(`Python service is running on ${PYTHON_URL}`);
  } catch (error) {
    log.warning(`Python service not responding on ${PYTHON_URL}`);
    log.info('This is optional - flights will use base fares if unavailable');
    log.warning('If you want dynamic pricing: python main.py (in backend-python directory)');
  }

  // 3. Check MongoDB
  log.header('3️⃣  Checking MongoDB Connection...');
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    log.success(`Connected to MongoDB at ${MONGODB_URI}`);

    // Get collection stats
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    log.info(`Collections found: ${collectionNames.join(', ')}`);

    // Count documents in key collections
    const Flight = require('./backend-node/src/models/Flight');
    const Airport = require('./backend-node/src/models/Airport');
    const Airline = require('./backend-node/src/models/Airline');

    const flightCount = await Flight.countDocuments();
    const airportCount = await Airport.countDocuments();
    const airlineCount = await Airline.countDocuments();

    log.info(`Flights: ${flightCount}`);
    log.info(`Airports: ${airportCount}`);
    log.info(`Airlines: ${airlineCount}`);

    if (flightCount === 0) {
      log.error('No flights found in database!');
      log.warning('Run: npm run seed (in backend-node directory)');
    } else {
      log.success(`Database has ${flightCount} flights ready for search`);
    }

    await mongoose.connection.close();
  } catch (error) {
    log.error(`MongoDB connection failed`);
    log.warning('Make sure MongoDB is running: mongod');
    log.info(`Trying to connect to: ${MONGODB_URI}`);
  }

  // 4. Check API Endpoints
  log.header('4️⃣  Checking API Endpoints...');
  try {
    const searchResponse = await axios.get(`${BACKEND_URL}/api/flights/search`, {
      params: {
        origin: 'JFK',
        destination: 'LAX',
        departureDate: new Date().toISOString().split('T')[0],
      },
      timeout: 5000,
    });
    log.success(`Flight search API is responding`);
    log.info(`Found ${searchResponse.data.length} flights matching JFK → LAX`);
  } catch (error) {
    if (error.response?.status === 400) {
      log.warning('Flight search returned no results');
    } else {
      log.error('Flight search API error');
    }
  }

  // 5. Summary and recommendations
  log.header('📋 Summary & Recommendations');

  const checks = [
    { name: 'Backend', url: `${BACKEND_URL}/health` },
    { name: 'Python Service', url: `${PYTHON_URL}/health`, optional: true },
    { name: 'MongoDB', url: MONGODB_URI },
  ];

  console.log('\nStart all services in this order:');
  console.log(`${colors.bright}1. MongoDB${colors.reset}`);
  console.log(`   mongod\n`);

  console.log(`${colors.bright}2. Backend (Terminal 1)${colors.reset}`);
  console.log(`   cd backend-node`);
  console.log(`   npm install`);
  console.log(`   npm start\n`);

  console.log(`${colors.bright}3. Seed Database (Terminal 2, if no flights)${colors.reset}`);
  console.log(`   cd backend-node`);
  console.log(`   npm run seed\n`);

  console.log(`${colors.bright}4. Python Service (Terminal 3, optional)${colors.reset}`);
  console.log(`   cd backend-python`);
  console.log(`   python main.py\n`);

  console.log(`${colors.bright}5. Frontend (Terminal 4)${colors.reset}`);
  console.log(`   cd frontend-react`);
  console.log(`   npm install`);
  console.log(`   npm start\n`);

  console.log('Then visit: http://localhost:3000');
  console.log('Go to: Search Flights');
  console.log('Try: JFK → LAX (or any other combination)\n');

  log.header('✅ Diagnostic Complete');
};

diagnose().catch(console.error);
