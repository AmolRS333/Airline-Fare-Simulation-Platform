import React, { useState, useEffect } from 'react';
import { adminService } from '../services';
import { formatDate, formatTime } from '../utils/dateTime';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllBookings();
      setBookings(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (bookingId) => {
    try {
      await adminService.confirmBooking(bookingId);
      setSuccess('Booking confirmed');
      fetchBookings();
    } catch (err) {
      setError('Failed to confirm booking');
    }
  };

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await adminService.cancelBooking(bookingId, 'Admin cancellation');
        setSuccess('Booking cancelled');
        fetchBookings();
      } catch (err) {
        setError('Failed to cancel booking');
      }
    }
  };

  const handleRefund = async (bookingId, refundPercentage) => {
    try {
      await adminService.refundBooking(bookingId, refundPercentage);
      setSuccess('Refund processed');
      fetchBookings();
    } catch (err) {
      setError('Failed to process refund');
    }
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Booking Management</h1>
        <div className="flex gap-4 flex-wrap">
          {['all', 'confirmed', 'pending', 'cancelled', 'waitlist'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded capitalize font-semibold transition ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {status} ({bookings.filter(b => status === 'all' || b.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}
      {success && <div className="p-4 bg-green-100 text-green-700 rounded mb-4">{success}</div>}

      {loading ? (
        <div className="text-center py-8">Loading bookings...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">PNR</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Flight</th>
                <th className="px-4 py-3 text-left">Seats</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-blue-600">{booking.pnr}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{booking.userId?.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{booking.userId?.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {booking.flightId?.flightNumber} ({booking.flightId?.origin?.iata} → {booking.flightId?.destination?.iata})
                  </td>
                  <td className="px-4 py-3">{booking.seatNumbers?.join(', ')}</td>
                  <td className="px-4 py-3 font-bold">${booking.pricePaid?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{formatDate(booking.createdAt)}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleConfirm(booking._id)}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                      >
                        Confirm
                      </button>
                    )}
                    {booking.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">PNR</p>
                  <p className="font-bold text-lg">{selectedBooking.pnr}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Status</p>
                  <p className="font-bold text-lg capitalize">{selectedBooking.status}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Passenger Name</p>
                  <p className="font-bold">{selectedBooking.userId?.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Email</p>
                  <p className="font-bold">{selectedBooking.userId?.email}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">Passengers</h3>
                {selectedBooking.passengers?.map((p, i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded mb-2">
                    <p className="font-semibold">{i + 1}. {p.title} {p.name}</p>
                    <p className="text-sm text-gray-600">Seat: {selectedBooking.seatNumbers[i]}</p>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded">
                <p className="text-gray-600 text-sm">Total Price</p>
                <p className="font-bold text-2xl text-blue-600">${selectedBooking.pricePaid?.toFixed(2)}</p>
              </div>

              {selectedBooking.refundAmount > 0 && (
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Refund Amount</p>
                  <p className="font-bold text-2xl text-green-600">${selectedBooking.refundAmount?.toFixed(2)}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {selectedBooking.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleConfirm(selectedBooking._id);
                      setSelectedBooking(null);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Confirm Booking
                  </button>
                )}
                {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'refunded' && (
                  <button
                    onClick={() => {
                      handleCancel(selectedBooking._id);
                      setSelectedBooking(null);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Cancel Booking
                  </button>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      const percentage = prompt('Enter refund percentage (0-100):', '100');
                      if (percentage !== null && !isNaN(percentage)) {
                        handleRefund(selectedBooking._id, parseFloat(percentage));
                        setSelectedBooking(null);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    Process Refund
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
