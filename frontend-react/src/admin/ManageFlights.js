import React, { useState, useEffect } from 'react';
import { adminService } from '../services';

const ManageFlights = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    airline: '',
    flightNumber: '',
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    baseFare: '',
    totalSeats: '',
  });

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      // In production, would fetch from API
      setFlights([]);
    } catch (error) {
      console.error('Error fetching flights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFlight = async () => {
    try {
      // Submit to API
      alert('Flight added successfully');
      setShowForm(false);
      setFormData({
        airline: '',
        flightNumber: '',
        origin: '',
        destination: '',
        departureTime: '',
        arrivalTime: '',
        baseFare: '',
        totalSeats: '',
      });
      fetchFlights();
    } catch (error) {
      alert('Error adding flight');
    }
  };

  if (loading) return <div className="p-6 text-center">Loading flights...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Manage Flights</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Add Flight'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Add New Flight</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Airline ID"
                value={formData.airline}
                onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Flight Number"
                value={formData.flightNumber}
                onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded"
              />
              {/* Add more fields */}
              <button
                onClick={handleAddFlight}
                className="col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Create Flight
              </button>
            </div>
          </div>
        )}

        {flights.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
            No flights available
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">Flight</th>
                  <th className="px-6 py-3 text-left">Route</th>
                  <th className="px-6 py-3 text-left">Departure</th>
                  <th className="px-6 py-3 text-left">Seats</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Add flight rows */}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageFlights;
