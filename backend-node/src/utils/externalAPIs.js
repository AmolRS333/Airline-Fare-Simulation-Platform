const axios = require('axios');

// Mock airport and airline data - can be replaced with real API calls
const getMockAirports = async () => {
  return [
    { name: 'John F. Kennedy International', iata: 'JFK', city: 'New York', country: 'USA', latitude: 40.6413, longitude: -73.7781, timezone: 'America/New_York' },
    { name: 'Los Angeles International', iata: 'LAX', city: 'Los Angeles', country: 'USA', latitude: 33.9425, longitude: -118.4081, timezone: 'America/Los_Angeles' },
    { name: 'Chicago O\'Hare', iata: 'ORD', city: 'Chicago', country: 'USA', latitude: 41.9742, longitude: -87.9073, timezone: 'America/Chicago' },
    { name: 'London Heathrow', iata: 'LHR', city: 'London', country: 'UK', latitude: 51.4700, longitude: -0.4543, timezone: 'Europe/London' },
    { name: 'Tokyo Narita', iata: 'NRT', city: 'Tokyo', country: 'Japan', latitude: 35.7653, longitude: 140.3926, timezone: 'Asia/Tokyo' },
    { name: 'Dubai International', iata: 'DXB', city: 'Dubai', country: 'UAE', latitude: 25.2528, longitude: 55.3644, timezone: 'Asia/Dubai' },
    { name: 'Singapore Changi', iata: 'SIN', city: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' },
    { name: 'Hong Kong', iata: 'HKG', city: 'Hong Kong', country: 'Hong Kong', latitude: 22.3193, longitude: 113.9150, timezone: 'Asia/Hong_Kong' },
  ];
};

const getMockAirlines = async () => {
  return [
    { name: 'American Airlines', code: 'AA', country: 'USA', website: 'aa.com' },
    { name: 'United Airlines', code: 'UA', country: 'USA', website: 'united.com' },
    { name: 'Delta Air Lines', code: 'DL', country: 'USA', website: 'delta.com' },
    { name: 'Southwest Airlines', code: 'WN', country: 'USA', website: 'southwest.com' },
    { name: 'British Airways', code: 'BA', country: 'UK', website: 'ba.com' },
    { name: 'Lufthansa', code: 'LH', country: 'Germany', website: 'lufthansa.com' },
    { name: 'Air France', code: 'AF', country: 'France', website: 'airfrance.com' },
    { name: 'Emirates', code: 'EK', country: 'UAE', website: 'emirates.com' },
    { name: 'Singapore Airlines', code: 'SQ', country: 'Singapore', website: 'singaporeair.com' },
    { name: 'Cathay Pacific', code: 'CX', country: 'Hong Kong', website: 'cathaypacific.com' },
  ];
};

// Try to fetch from real API with fallback to mock data
const fetchAirportsWithFallback = async () => {
  try {
    // Try AviationStack or AirLabs if API key available
    // For now, return mock data
    return await getMockAirports();
  } catch (error) {
    console.log('Falling back to mock airport data:', error.message);
    return await getMockAirports();
  }
};

const fetchAirlinesWithFallback = async () => {
  try {
    return await getMockAirlines();
  } catch (error) {
    console.log('Falling back to mock airline data:', error.message);
    return await getMockAirlines();
  }
};

module.exports = {
  getMockAirports,
  getMockAirlines,
  fetchAirportsWithFallback,
  fetchAirlinesWithFallback,
};
