require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Airport = require('./src/models/Airport');
const Airline = require('./src/models/Airline');
const Flight = require('./src/models/Flight');
const User = require('./src/models/User');
const { generateSeatNumber } = require('./src/utils/helpers');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flight-booking-simulator');
    console.log('✅ Connected to MongoDB');

    // Clear existing data (keep users if you want, but clear test data)
    await Airport.deleteMany({});
    await Airline.deleteMany({});
    await Flight.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Seed Airports
    const airports = await Airport.insertMany([
      {
        name: 'John F. Kennedy International Airport',
        iata: 'JFK',
        city: 'New York',
        country: 'USA',
        latitude: 40.6413,
        longitude: -73.7781,
        timezone: 'America/New_York',
      },
      {
        name: 'Los Angeles International Airport',
        iata: 'LAX',
        city: 'Los Angeles',
        country: 'USA',
        latitude: 33.9425,
        longitude: -118.4081,
        timezone: 'America/Los_Angeles',
      },
      {
        name: 'Chicago Midway International Airport',
        iata: 'MDW',
        city: 'Chicago',
        country: 'USA',
        latitude: 41.7859,
        longitude: -87.7484,
        timezone: 'America/Chicago',
      },
      {
        name: 'San Francisco International Airport',
        iata: 'SFO',
        city: 'San Francisco',
        country: 'USA',
        latitude: 37.6213,
        longitude: -122.379,
        timezone: 'America/Los_Angeles',
      },
      {
        name: 'Miami International Airport',
        iata: 'MIA',
        city: 'Miami',
        country: 'USA',
        latitude: 25.7959,
        longitude: -80.2871,
        timezone: 'America/New_York',
      },
      {
        name: 'Seattle Tacoma International Airport',
        iata: 'SEA',
        city: 'Seattle',
        country: 'USA',
        latitude: 47.4502,
        longitude: -122.3088,
        timezone: 'America/Los_Angeles',
      },
      {
        name: 'Boston Logan International Airport',
        iata: 'BOS',
        city: 'Boston',
        country: 'USA',
        latitude: 42.3656,
        longitude: -71.0096,
        timezone: 'America/New_York',
      },
      {
        name: 'Denver International Airport',
        iata: 'DEN',
        city: 'Denver',
        country: 'USA',
        latitude: 39.8561,
        longitude: -104.6737,
        timezone: 'America/Denver',
      },
    ]);
    console.log(`✅ Created ${airports.length} airports`);

    // Seed Airlines
    const airlines = await Airline.insertMany([
      {
        name: 'American Airlines',
        code: 'AA',
        country: 'USA',
        website: 'www.aa.com',
      },
      {
        name: 'United Airlines',
        code: 'UA',
        country: 'USA',
        website: 'www.united.com',
      },
      {
        name: 'Delta Air Lines',
        code: 'DL',
        country: 'USA',
        website: 'www.delta.com',
      },
      {
        name: 'Southwest Airlines',
        code: 'SW',
        country: 'USA',
        website: 'www.southwest.com',
      },
      {
        name: 'Alaska Airlines',
        code: 'AS',
        country: 'USA',
        website: 'www.alaskaair.com',
      },
    ]);
    console.log(`✅ Created ${airlines.length} airlines`);

    // Create flight data for next 7 days (including today)
    const flights = [];
    const today = new Date();
    // Set to UTC midnight to avoid timezone issues
    today.setUTCHours(0, 0, 0, 0);

    console.log(`📅 Seeding flights for: ${today.toISOString().split('T')[0]} (and next 7 days)`);

    // Popular routes with multiple flights per day
    const routes = [
      { origin: 'JFK', destination: 'LAX', baseFare: 350 },
      { origin: 'LAX', destination: 'JFK', baseFare: 350 },
      { origin: 'JFK', destination: 'SFO', baseFare: 320 },
      { origin: 'SFO', destination: 'JFK', baseFare: 320 },
      { origin: 'LAX', destination: 'SFO', baseFare: 150 },
      { origin: 'SFO', destination: 'LAX', baseFare: 150 },
      { origin: 'JFK', destination: 'MIA', baseFare: 180 },
      { origin: 'MIA', destination: 'JFK', baseFare: 180 },
      { origin: 'LAX', destination: 'SEA', baseFare: 200 },
      { origin: 'SEA', destination: 'LAX', baseFare: 200 },
      { origin: 'BOS', destination: 'LAX', baseFare: 380 },
      { origin: 'DEN', destination: 'LAX', baseFare: 250 },
    ];

    // Generate flights for next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const flightDate = new Date(today);
      flightDate.setDate(flightDate.getDate() + dayOffset);

      for (const route of routes) {
        const originAirport = airports.find((a) => a.iata === route.origin);
        const destAirport = airports.find((a) => a.iata === route.destination);
        const airline = airlines[Math.floor(Math.random() * airlines.length)];

        // Create 2-3 flights per route per day
        const flightsPerDay = Math.floor(Math.random() * 2) + 2;

        for (let i = 0; i < flightsPerDay; i++) {
          const departureHour = 6 + i * 8 + Math.floor(Math.random() * 3);
          const departureTime = new Date(flightDate);
          departureTime.setHours(departureHour, Math.floor(Math.random() * 60), 0, 0);

          const duration = 120 + Math.random() * 120; // 2-4 hours
          const arrivalTime = new Date(departureTime.getTime() + duration * 60000);

          const totalSeats = [150, 180, 200, 220][Math.floor(Math.random() * 4)];
          const bookedSeats = Math.floor(Math.random() * (totalSeats * 0.6));
          const availableSeats = totalSeats - bookedSeats;

          const flight = {
            airline: airline._id,
            flightNumber: `${airline.code}${1000 + Math.floor(Math.random() * 9000)}`,
            origin: originAirport._id,
            destination: destAirport._id,
            departureTime,
            arrivalTime,
            duration: Math.round(duration),
            baseFare: route.baseFare,
            totalSeats,
            availableSeats,
            aircraft: ['Boeing 737', 'Airbus A320', 'Boeing 777', 'Airbus A380'][
              Math.floor(Math.random() * 4)
            ],
            dynamicPricingEnabled: true,
            currentDynamicPrice: route.baseFare,
            priceFloor: route.baseFare * 0.7,
            priceCeiling: route.baseFare * 2.5,
            bookingCount: bookedSeats,
            isActive: true,
          };

          // Initialize seat map
          flight.seatMap = new Map();
          for (let seatIdx = 0; seatIdx < totalSeats; seatIdx++) {
            const seatNumber = generateSeatNumber(seatIdx);
            if (seatIdx < bookedSeats) {
              flight.seatMap.set(seatNumber, 'booked');
            } else {
              flight.seatMap.set(seatNumber, 'available');
            }
          }

          flights.push(flight);
        }
      }
    }

    // Insert flights
    await Flight.insertMany(flights);
    console.log(`✅ Created ${flights.length} flights`);

    // Seed Test Users
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    const testUsers = [
      {
        name: 'Test Customer',
        email: 'customer@test.com',
        password: hashedPassword,
        phone: '+1-555-0001',
        role: 'customer',
        city: 'New York',
        country: 'USA',
      },
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: hashedPassword,
        phone: '+1-555-0002',
        role: 'admin',
        city: 'New York',
        country: 'USA',
      },
      {
        name: 'Another Customer',
        email: 'user@test.com',
        password: hashedPassword,
        phone: '+1-555-0003',
        role: 'customer',
        city: 'Los Angeles',
        country: 'USA',
      },
    ];

    await User.insertMany(testUsers);
    console.log(`✅ Created ${testUsers.length} test users`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Sample Flight Routes:');
    console.log('   JFK ↔ LAX (New York ↔ Los Angeles)');
    console.log('   JFK ↔ SFO (New York ↔ San Francisco)');
    console.log('   LAX ↔ SFO (Los Angeles ↔ San Francisco)');
    console.log('   JFK ↔ MIA (New York ↔ Miami)');
    console.log('   And more...\n');

    console.log('👤 Test User Credentials:');
    console.log('   Customer: customer@test.com / Test@123');
    console.log('   Admin:    admin@test.com / Test@123');
    console.log('   User:     user@test.com / Test@123\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
