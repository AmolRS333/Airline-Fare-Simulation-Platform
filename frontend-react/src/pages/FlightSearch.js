import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { flightService } from '../services';
import { formatDate, formatTime, getDurationString } from '../utils/dateTime';

const FlightSearch = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('JFK');
  const [destination, setDestination] = useState('LAX');
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [filterPrice, setFilterPrice] = useState('');
  
  const [priceRefresh, setPriceRefresh] = useState(0);

  // Auto-search on mount with default values
  const handleSearch = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    // Validate inputs
    if (!origin || !destination) {
      setError('Please enter both origin and destination airports');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await flightService.searchFlights(
        origin,
        destination,
        departureDate,
        sortBy,
        filterPrice
      );
      
      if (response.data && Array.isArray(response.data)) {
        setFlights(response.data);
        if (response.data.length === 0) {
          setError('No flights found for this route on the selected date.');
        }
      } else {
        setError('Invalid response from server');
        console.error('Invalid response:', response.data);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Failed to search flights');
    } finally {
      setLoading(false);
    }
  }, [origin, destination, departureDate, sortBy, filterPrice]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  // Auto-refresh prices every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceRefresh((prev) => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch updated prices
  useEffect(() => {
    if (flights.length > 0 && priceRefresh > 0) {
      handleSearch();
    }
  }, [priceRefresh, flights.length, handleSearch]);

  

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Search Flights</h1>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">From (IATA)</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                  placeholder="e.g., JFK"
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                  maxLength="3"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">To (IATA)</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value.toUpperCase())}
                  placeholder="e.g., LAX"
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                  maxLength="3"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Date</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                >
                  <option value="price">Price Low-High</option>
                  <option value="duration">Duration</option>
                  <option value="departure">Departure Time</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Max Price</label>
                <input
                  type="number"
                  value={filterPrice}
                  onChange={(e) => setFilterPrice(e.target.value)}
                  placeholder="e.g., 500"
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700"
            >
              Search Flights
            </button>
          </form>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}

        {loading && <div className="text-center text-gray-600 text-lg">Loading flights...</div>}

        {/* Flight Results */}
        <div className="space-y-4">
          {flights.map((flight) => (
            <div key={flight._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div>
                  <p className="text-gray-600 text-sm">Flight</p>
                  <p className="text-xl font-bold">{flight.airline?.code}{flight.flightNumber}</p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">{flight.origin?.iata}</p>
                  <p className="text-lg font-semibold">{formatTime(flight.departureTime)}</p>
                  <p className="text-xs text-gray-500">{formatDate(flight.departureTime)}</p>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 text-sm">{getDurationString(flight.duration)}</p>
                  <p className="text-xs text-gray-500">—→</p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">{flight.destination?.iata}</p>
                  <p className="text-lg font-semibold">{formatTime(flight.arrivalTime)}</p>
                </div>

                <div className="text-right">
                  <p className="text-gray-600 text-sm">Price</p>
                  <p className="text-2xl font-bold text-green-600">${flight.currentDynamicPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{flight.availableSeats} seats left</p>
                  <button 
                    onClick={() => {
                      navigate('/booking', { state: { flight } });
                    }}
                    className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm font-semibold"
                  >
                    Book

                  </button>
                </div>
              </div>
            </div>
          ))}

          {flights.length === 0 && !loading && (
            <div className="text-center text-gray-600 text-lg">No flights found. Try searching.</div>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          Prices and seat availability auto-refresh every 10 seconds for real-time updates
        </div>
      </div>
    </div>
  );
};

export default FlightSearch;
