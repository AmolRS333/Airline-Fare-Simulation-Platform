const Flight = require('../models/Flight');
const FareHistory = require('../models/FareHistory');
const axios = require('axios');
const { generateSeatNumber } = require('../utils/helpers');

const PYTHON_PRICING_URL = process.env.PYTHON_PRICING_SERVICE_URL || 'http://localhost:8000';

const createFlight = async (req, res) => {
  try {
    const {
      airline,
      flightNumber,
      origin,
      destination,
      departureTime,
      arrivalTime,
      baseFare,
      totalSeats,
      aircraft,
    } = req.body;

    // Calculate duration
    const duration = Math.round((new Date(arrivalTime) - new Date(departureTime)) / (1000 * 60));

    const flight = new Flight({
      airline,
      flightNumber,
      origin,
      destination,
      departureTime: new Date(departureTime),
      arrivalTime: new Date(arrivalTime),
      duration,
      baseFare,
      totalSeats,
      availableSeats: totalSeats,
      aircraft,
      dynamicPricingEnabled: true,
      currentDynamicPrice: baseFare,
      priceFloor: baseFare * 0.8, // 20% below base
      priceCeiling: baseFare * 2.0, // 100% above base
    });

    // Initialize seat map
    for (let i = 0; i < totalSeats; i++) {
      const seatNumber = generateSeatNumber(i);
      flight.seatMap.set(seatNumber, 'available');
    }

    await flight.save();
    res.status(201).json({ message: 'Flight created', flight });
  } catch (error) {
    res.status(500).json({ message: 'Error creating flight', error: error.message });
  }
};

const searchFlights = async (req, res) => {
  try {
    const { origin, destination, departureDate, sortBy = 'price', filterPrice } = req.query;

    // Validate required parameters
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        message: 'Missing required parameters: origin, destination, departureDate',
      });
    }

    // Parse departure date (user sends YYYY-MM-DD)
    const [year, month, day] = departureDate.split('-');
    const searchDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const nextDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

    console.log(`🔍 Searching flights: ${origin} → ${destination} on ${departureDate}`);
    console.log(`   Query range: ${searchDate.toISOString()} to ${nextDay.toISOString()}`);

    let query = {
      isActive: true,
      departureTime: {
        $gte: searchDate,
        $lte: nextDay,
      },
    };

    // Search by origin and destination airport codes (IATA)
    const Airport = require('../models/Airport');

    const originAirport = await Airport.findOne({ iata: origin.toUpperCase() });
    if (!originAirport) {
      console.warn(`Airport not found: ${origin}`);
      return res.status(400).json({ message: `Origin airport ${origin} not found` });
    }
    query.origin = originAirport._id;

    const destAirport = await Airport.findOne({ iata: destination.toUpperCase() });
    if (!destAirport) {
      console.warn(`Airport not found: ${destination}`);
      return res.status(400).json({ message: `Destination airport ${destination} not found` });
    }
    query.destination = destAirport._id;

    console.log(`Query: ${JSON.stringify(query)}`);

    let flights = await Flight.find(query)
      .populate('airline', 'name code')
      .populate('origin', 'name iata city')
      .populate('destination', 'name iata city');

    console.log(`✅ Found ${flights.length} flights`);

    // Fetch dynamic prices from Python service (with timeout)
    const flightWithPrices = [];
    for (let flight of flights) {
      try {
        const response = await axios.post(`${PYTHON_PRICING_URL}/api/price`, {
          flightId: flight._id.toString(),
          baseFare: flight.baseFare,
          totalSeats: flight.totalSeats,
          availableSeats: flight.availableSeats,
          departureTime: flight.departureTime,
        });

        if (response.data && response.data.price) {
          flight.currentDynamicPrice = response.data.price;
          flight.bookingCount = response.data.bookingCount || 0;

          // Save fare history
          const fareHistory = new FareHistory({
            flightId: flight._id,
            baseFare: flight.baseFare,
            calculatedFare: response.data.price,
            dynamicMultiplier: response.data.multiplier || 1,
            remainingSeatsPercentage: (flight.availableSeats / flight.totalSeats) * 100,
            hoursUntilDeparture: (flight.departureTime - new Date()) / (1000 * 60 * 60),
            demandLevel: response.data.demandLevel || 'medium',
          });
          await fareHistory.save();
        }
      } catch (error) {
        // Use base fare if Python service fails
        console.warn(`Warning: Could not fetch dynamic price for flight ${flight._id}: ${error.message}`);
        flight.currentDynamicPrice = flight.baseFare;
      }
      flightWithPrices.push(flight);
    }

    // Filter by price if specified
    if (filterPrice) {
      const maxPrice = parseFloat(filterPrice);
      flightWithPrices = flightWithPrices.filter((f) => f.currentDynamicPrice <= maxPrice);
    }

    // Sort
    if (sortBy === 'price') {
      flightWithPrices.sort((a, b) => a.currentDynamicPrice - b.currentDynamicPrice);
    } else if (sortBy === 'duration') {
      flightWithPrices.sort((a, b) => a.duration - b.duration);
    } else if (sortBy === 'departure') {
      flightWithPrices.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
    }

    res.json(flightWithPrices);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error searching flights', error: error.message });
  }
};

const getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate('airline', 'name code')
      .populate('origin', 'name iata city timezone')
      .populate('destination', 'name iata city timezone');

    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Get available seats
    const availableSeats = Array.from(flight.seatMap.entries())
      .filter(([_, status]) => status === 'available')
      .map(([seat]) => seat);

    res.json({ ...flight.toObject(), availableSeats });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching flight', error: error.message });
  }
};

const updateFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('airline')
      .populate('origin')
      .populate('destination');

    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    res.json({ message: 'Flight updated', flight });
  } catch (error) {
    res.status(500).json({ message: 'Error updating flight', error: error.message });
  }
};

const deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.json({ message: 'Flight deleted', flight });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting flight', error: error.message });
  }
};

const getFareHistory = async (req, res) => {
  try {
    const { flightId } = req.params;
    const history = await FareHistory.find({ flightId }).sort({ timestamp: -1 }).limit(100);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fare history', error: error.message });
  }
};

module.exports = {
  createFlight,
  searchFlights,
  getFlightById,
  updateFlight,
  deleteFlight,
  getFareHistory,
};
