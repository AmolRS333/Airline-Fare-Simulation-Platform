require('dotenv').config();
const axios = require('axios');

const API_BASE = process.env.API_URL || 'http://localhost:5000/api';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  try {
    console.log('Smoke test: start');

    // 1) Login as test user
    const loginResp = await axios.post(`${API_BASE}/auth/login`, {
      email: process.env.SMOKE_TEST_USER_EMAIL || 'customer@test.com',
      password: process.env.SMOKE_TEST_USER_PASSWORD || 'Test@123',
    });
    const token = loginResp.data.accessToken;
    console.log('Logged in as test user');

    const auth = { headers: { Authorization: `Bearer ${token}` } };

    // 2) Find a flight for today on a seeded route (JFK -> LAX)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    console.log(`Searching flights for ${dateStr} (JFK -> LAX)`);
    const searchResp = await axios.get(`${API_BASE}/flights/search`, {
      params: { origin: 'JFK', destination: 'LAX', departureDate: dateStr },
    });
    const flights = searchResp.data;
    if (!flights || flights.length === 0) {
      console.error('No flights found for JFK->LAX today. Smoke test aborted.');
      return;
    }

    // Pick the first flight that has available seats
    let flight = flights.find((f) => f.availableSeats > 0) || flights[0];
    console.log(`Selected flight: ${flight._id} (${flight.flightNumber})`);

    // 3) Get flight details (available seats)
    const flightDetails = (await axios.get(`${API_BASE}/flights/${flight._id}`)).data;
    const availableSeats = flightDetails.availableSeats || [];
    if (!availableSeats.length) {
      console.error('No available seats on selected flight. Smoke test aborted.');
      return;
    }
    const seatToLock = availableSeats[0];
    console.log(`Attempting to lock seat: ${seatToLock}`);

    // 4) Lock the seat
    const lockResp = await axios.post(`${API_BASE}/bookings/select-seats`, { flightId: flight._id, seatNumbers: [seatToLock] }, auth);
    console.log('Seat lock response:', lockResp.data.message || 'locked');

    // 5) Create booking
    const passengers = [
      { title: 'Mr', name: 'Smoke Tester', email: 'smoke@test.com', phone: '+1-555-0100' },
    ];

    const createResp = await axios.post(`${API_BASE}/bookings`, { flightId: flight._id, seatNumbers: [seatToLock], passengers }, auth);
    console.log('Create booking response status:', createResp.status);
    const booking = createResp.data.booking;
    console.log('Booking created, PNR:', booking.pnr, 'id:', booking._id);

    // Short sleep to ensure DB updates settle
    await sleep(500);

    // 6) Cancel booking to revert state
    try {
      const cancelResp = await axios.delete(`${API_BASE}/bookings/${booking._id}`, auth);
      console.log('Cancelled booking, refundAmount:', cancelResp.data.refundAmount);
    } catch (cancelErr) {
      console.warn('Failed to cancel booking automatically:', cancelErr.response?.data || cancelErr.message);
    }

    console.log('Smoke test: completed successfully (booking created then cancelled)');
  } catch (err) {
    console.error('Smoke test error:', err.response?.data || err.message || err);
    if (err.response?.data) {
      console.error('Response data:', JSON.stringify(err.response.data, null, 2));
    }
    process.exitCode = 1;
  }
}

if (require.main === module) {
  run();
}
