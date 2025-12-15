import React, { useState, useEffect } from 'react';
import { adminService } from '../services';

const SeatManagement = () => {
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [seatMap, setSeatMap] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const response = await adminService.getAllFlights();
      setFlights(response.data);
    } catch (err) {
      setError('Failed to load flights');
    }
  };

  const handleSelectFlight = async (flight) => {
    setSelectedFlight(flight);
    setLoading(true);
    try {
      const response = await adminService.getSeatMap(flight._id);
      setSeatMap(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load seat map');
    } finally {
      setLoading(false);
    }
  };

  const getSeatStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-400';
      case 'locked':
        return 'bg-yellow-100 border-yellow-400';
      case 'booked':
        return 'bg-red-100 border-red-400';
      case 'waitlist':
        return 'bg-blue-100 border-blue-400';
      default:
        return 'bg-gray-100 border-gray-400';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Seat Management</h1>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {flights.slice(0, 8).map((flight) => (
          <button
            key={flight._id}
            onClick={() => handleSelectFlight(flight)}
            className={`p-4 rounded-lg border-2 text-left transition ${
              selectedFlight?._id === flight._id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 bg-white hover:border-blue-400'
            }`}
          >
            <div className="font-bold">{flight.flightNumber}</div>
            <div className="text-sm text-gray-600">
              {flight.origin?.iata} → {flight.destination?.iata}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Seats: {flight.totalSeats}
            </div>
          </button>
        ))}
      </div>

      {selectedFlight && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">
            Seat Map - {selectedFlight.flightNumber}
          </h2>

          {loading ? (
            <div className="text-center py-8">Loading seat map...</div>
          ) : (
            <div>
              <div className="mb-6 flex gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 border-2 border-green-400 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-400 rounded"></div>
                  <span>Locked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-100 border-2 border-red-400 rounded"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 border-2 border-blue-400 rounded"></div>
                  <span>Waitlist</span>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2 max-w-2xl">
                {selectedFlight.seatMap && Array.from(selectedFlight.seatMap).map(([seatNumber, status]) => (
                  <div
                    key={seatNumber}
                    className={`h-10 flex items-center justify-center rounded border-2 cursor-pointer text-xs font-bold ${getSeatStatusColor(status)}`}
                    title={`${seatNumber} - ${status}`}
                  >
                    {seatNumber}
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-green-50 p-4 rounded">
                  <div className="font-bold">Available</div>
                  <div className="text-2xl text-green-600">
                    {selectedFlight.availableSeats}
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded">
                  <div className="font-bold">Booked</div>
                  <div className="text-2xl text-red-600">
                    {selectedFlight.totalSeats - selectedFlight.availableSeats}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <div className="font-bold">Occupancy</div>
                  <div className="text-2xl text-blue-600">
                    {Math.round(((selectedFlight.totalSeats - selectedFlight.availableSeats) / selectedFlight.totalSeats) * 100)}%
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="font-bold">Total Seats</div>
                  <div className="text-2xl text-gray-600">
                    {selectedFlight.totalSeats}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SeatManagement;
