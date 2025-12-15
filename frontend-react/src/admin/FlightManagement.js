import React, { useState, useEffect } from 'react';
import { adminService } from '../services';
import { airlineService, airportService } from '../services';
import { formatDate, formatTime } from '../utils/dateTime';

const FlightManagement = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [airlines, setAirlines] = useState([]);
  const [airports, setAirports] = useState([]);
  
  const [formData, setFormData] = useState({
    flightNumber: '',
    airline: '',
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    baseFare: '',
    totalSeats: '',
    aircraft: '',
    economySeats: '',
    businessSeats: '',
    firstSeats: '',
  });

  useEffect(() => {
    fetchFlights();
    fetchAirlinesAndAirports();
  }, []);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllFlights();
      setFlights(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load flights');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAirlinesAndAirports = async () => {
    try {
      const [airlinesRes, airportsRes] = await Promise.all([
        airlineService.getAirlines(),
        airportService.getAirports()
      ]);
      setAirlines(airlinesRes.data);
      setAirports(airportsRes.data);
    } catch (err) {
      console.error('Failed to load airlines/airports', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminService.updateFlight(editingId, formData);
        setSuccess('Flight updated successfully');
      } else {
        await adminService.createFlight(formData);
        setSuccess('Flight created successfully');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        flightNumber: '',
        airline: '',
        origin: '',
        destination: '',
        departureTime: '',
        arrivalTime: '',
        baseFare: '',
        totalSeats: '',
        aircraft: '',
        economySeats: '',
        businessSeats: '',
        firstSeats: '',
      });
      fetchFlights();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save flight');
    }
  };

  const handleEdit = (flight) => {
    setEditingId(flight._id);
    setFormData({
      flightNumber: flight.flightNumber,
      airline: flight.airline?._id || '',
      origin: flight.origin?._id || '',
      destination: flight.destination?._id || '',
      departureTime: flight.departureTime?.split('.')[0] || '',
      arrivalTime: flight.arrivalTime?.split('.')[0] || '',
      baseFare: flight.baseFare,
      totalSeats: flight.totalSeats,
      aircraft: flight.aircraft || '',
      economySeats: flight.seatClasses?.economy?.count || '',
      businessSeats: flight.seatClasses?.business?.count || '',
      firstSeats: flight.seatClasses?.first?.count || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (flightId) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      try {
        await adminService.deleteFlight(flightId);
        setSuccess('Flight deleted successfully');
        fetchFlights();
      } catch (err) {
        setError('Failed to delete flight');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Flight Management</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Add Flight'}
        </button>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}
      {success && <div className="p-4 bg-green-100 text-green-700 rounded mb-4">{success}</div>}

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit Flight' : 'Add New Flight'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="flightNumber"
              placeholder="Flight Number (e.g., AA100)"
              value={formData.flightNumber}
              onChange={handleInputChange}
              required
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <select
              name="airline"
              value={formData.airline}
              onChange={handleInputChange}
              required
              className="px-3 py-2 border border-gray-300 rounded"
            >
              <option value="">Select Airline</option>
              {airlines.map(airline => (
                <option key={airline._id} value={airline._id}>
                  {airline.name} ({airline.iata})
                </option>
              ))}
            </select>
            <select
              name="origin"
              value={formData.origin}
              onChange={handleInputChange}
              required
              className="px-3 py-2 border border-gray-300 rounded"
            >
              <option value="">Select Origin Airport</option>
              {airports.map(airport => (
                <option key={airport._id} value={airport._id}>
                  {airport.city} ({airport.iata})
                </option>
              ))}
            </select>
            <select
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              required
              className="px-3 py-2 border border-gray-300 rounded"
            >
              <option value="">Select Destination Airport</option>
              {airports.map(airport => (
                <option key={airport._id} value={airport._id}>
                  {airport.city} ({airport.iata})
                </option>
              ))}
            </select>
            <input
              type="text"
              name="aircraft"
              placeholder="Aircraft Type"
              value={formData.aircraft}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="number"
              name="baseFare"
              placeholder="Base Fare ($)"
              value={formData.baseFare}
              onChange={handleInputChange}
              required
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="number"
              name="totalSeats"
              placeholder="Total Seats"
              value={formData.totalSeats}
              onChange={handleInputChange}
              required
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="number"
              name="economySeats"
              placeholder="Economy Seats"
              value={formData.economySeats}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="number"
              name="businessSeats"
              placeholder="Business Seats"
              value={formData.businessSeats}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="number"
              name="firstSeats"
              placeholder="First Class Seats"
              value={formData.firstSeats}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="datetime-local"
              name="departureTime"
              placeholder="Departure Time"
              value={formData.departureTime}
              onChange={handleInputChange}
              required
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="datetime-local"
              name="arrivalTime"
              placeholder="Arrival Time"
              value={formData.arrivalTime}
              onChange={handleInputChange}
              required
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <button
              type="submit"
              className="md:col-span-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {editingId ? 'Update Flight' : 'Create Flight'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading flights...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Flight</th>
                <th className="px-4 py-3 text-left">Route</th>
                <th className="px-4 py-3 text-left">Departure</th>
                <th className="px-4 py-3 text-left">Fare</th>
                <th className="px-4 py-3 text-left">Seats</th>
                <th className="px-4 py-3 text-left">Available</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((flight) => (
                <tr key={flight._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">{flight.flightNumber}</td>
                  <td className="px-4 py-3">{flight.origin?.iata} → {flight.destination?.iata}</td>
                  <td className="px-4 py-3">{formatDate(flight.departureTime)} {formatTime(flight.departureTime)}</td>
                  <td className="px-4 py-3">${flight.baseFare}</td>
                  <td className="px-4 py-3">{flight.totalSeats}</td>
                  <td className="px-4 py-3">{flight.availableSeats}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(flight)}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(flight._id)}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FlightManagement;
