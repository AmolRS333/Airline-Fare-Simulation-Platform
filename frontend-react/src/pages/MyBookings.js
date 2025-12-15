import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../services';
import { formatDate, formatTime } from '../utils/dateTime';
import { generateTicketPDF } from '../utils/pdfGenerator';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    // Apply status filter
    if (statusFilter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter((b) => b.status === statusFilter));
    }
  }, [statusFilter, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bookingService.getBookings();
      setBookings(response.data);
    } catch (err) {
      setError('Failed to fetch bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? You may be eligible for a refund.')) {
      return;
    }

    try {
      setCancelingId(bookingId);
      const response = await bookingService.cancelBooking(bookingId);
      alert(`Booking cancelled successfully. Refund: $${response.data.refundAmount?.toFixed(2) || '0.00'}`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelingId(null);
    }
  };

  const handleDownloadReceipt = (booking) => {
    try {
      generateTicketPDF(booking, booking.flightId);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'waitlist':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancel = (booking) => {
    return booking.status === 'confirmed' || booking.status === 'pending' || booking.status === 'waitlist';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-lg text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
          <p className="text-gray-600 mt-2">View and manage your flight bookings</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Status Filter */}
        <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter by Status</h3>
          <div className="flex flex-wrap gap-3">
            {['all', 'confirmed', 'pending', 'waitlist', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded font-semibold transition ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {status === 'all' ? 'All Bookings' : status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span className="ml-2">({bookings.filter((b) => b.status === status).length})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">No bookings found</p>
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
            >
              Search Flights
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold">{booking.flightId?.flightNumber || 'N/A'}</h3>
                      <p className="text-blue-100">PNR: {booking.pnr}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${getStatusBadgeColor(booking.status)}`}>
                      {booking.status.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Flight Details */}
                    <div>
                      <h4 className="font-bold text-gray-800 mb-4">Flight Details</h4>
                      <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Route:</span>
                          <span className="font-semibold">
                            {booking.flightId?.origin?.iata} → {booking.flightId?.destination?.iata}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Departure:</span>
                          <span className="font-semibold">{formatDate(booking.flightId?.departureTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-semibold">{formatTime(booking.flightId?.departureTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Airline:</span>
                          <span className="font-semibold">{booking.flightId?.airline?.code || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div>
                      <h4 className="font-bold text-gray-800 mb-4">Booking Details</h4>
                      <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Seats:</span>
                          <span className="font-semibold">{booking.seatNumbers?.join(', ') || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Class:</span>
                          <span className="font-semibold capitalize">{booking.seatClass || 'Economy'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Passengers:</span>
                          <span className="font-semibold">{booking.passengers?.length || 0}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-gray-300">
                          <span className="text-gray-600 font-semibold">Total Amount:</span>
                          <span className="font-bold text-lg text-green-600">${booking.pricePaid?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Passengers */}
                  {booking.passengers && booking.passengers.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded mb-6">
                      <h4 className="font-bold text-gray-800 mb-3">Passengers</h4>
                      <div className="space-y-2 text-sm">
                        {booking.passengers.map((passenger, idx) => (
                          <div key={idx} className="flex justify-between text-gray-700">
                            <span>
                              {idx + 1}. {passenger.title} {passenger.name}
                            </span>
                            <span className="text-gray-600">Seat: {booking.seatNumbers?.[idx]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Refund Info (if cancelled) */}
                  {booking.status === 'cancelled' && booking.refundAmount && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded mb-6">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Refund Amount:</span> ${booking.refundAmount?.toFixed(2)} ({booking.refundPercentage}%)
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Cancelled on: {formatDate(booking.cancellationDate)}</p>
                    </div>
                  )}

                  {/* Booking Date */}
                  <p className="text-xs text-gray-600 mb-6">Booked on: {formatDate(booking.createdAt)}</p>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDownloadReceipt(booking)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition"
                    >
                      📥 Download Receipt
                    </button>
                    {canCancel(booking) && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={cancelingId === booking._id}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition disabled:bg-gray-400"
                      >
                        {cancelingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
