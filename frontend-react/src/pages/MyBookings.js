import React, { useState, useEffect } from 'react';
import { bookingService } from '../services';
import { formatDate, formatTime } from '../utils/dateTime';
import { generatePDF } from '../utils/pdfGenerator';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingService.getBookings();
      setBookings(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingService.cancelBooking(bookingId);
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const handleDownloadReceipt = async (booking) => {
    try {
      await generatePDF(booking, booking.flightId, {}, {}, {});
    } catch (err) {
      console.error('PDF generation error:', err);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading bookings...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Bookings</h1>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
            No bookings found
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">PNR</p>
                    <p className="text-xl font-bold">{booking.pnr}</p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm">Flight</p>
                    <p className="text-lg">{booking.flightId?.flightNumber || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm">Status</p>
                    <p className={`text-lg font-semibold ${booking.status === 'booked' ? 'text-green-600' : 'text-red-600'}`}>
                      {booking.status.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Seats: {booking.seatNumbers?.join(', ')}</p>
                  <p className="text-sm text-gray-600">Amount Paid: ${booking.pricePaid?.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Booked on: {formatDate(booking.createdAt)}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadReceipt(booking)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    Download Receipt
                  </button>
                  {booking.status === 'booked' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                    >
                      Cancel Booking
                    </button>
                  )}
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
