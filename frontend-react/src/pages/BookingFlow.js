import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingService } from '../services';
import { AuthContext } from '../context/AuthContext';
import { formatDate, formatTime } from '../utils/dateTime';
import { generateTicketPDF } from '../utils/pdfGenerator';

const BookingFlow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { flight } = location.state || {};

  const [step, setStep] = useState(1); // 1: Seats, 2: Passengers, 3: Payment, 4: Confirmation
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatClass, setSeatClass] = useState('economy'); // economy, business, first
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);

  if (!flight) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-red-600 text-lg font-semibold">No flight selected</p>
          <button
            onClick={() => navigate('/search')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  // Generate seat grid based on flight capacity
  const generateSeats = () => {
    const seats = [];
    const rows = Math.ceil(flight.totalSeats / 6);
    const columns = 6;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // Match backend seat numbering: rowNumber + columnLetter, e.g. "1A", "1B", ...
        const seatNumber = (row + 1) + String.fromCharCode(65 + col);
        const seatIndex = row * columns + col;
        if (seatIndex < flight.totalSeats) {
          seats.push(seatNumber);
        }
      }
    }
    return seats;
  };

  const seats = generateSeats();

  const handleSeatSelect = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
    setError('');
  };

  

  const handlePassengerChange = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  

  const handleContinueToPayment = () => {
    setError('');
    
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    if (passengers.length !== selectedSeats.length) {
      setError(`Please add details for all ${selectedSeats.length} passengers`);
      return;
    }

    const allValid = passengers.every((p) => p.name && p.email && p.phone);
    if (!allValid) {
      setError('Please fill in all passenger details');
      return;
    }

    setStep(3);
  };

  const handleCreateBooking = async () => {
    setLoading(true);
    setError('');

    try {
      // First, lock seats via backend so they are reserved for this user
      try {
        await bookingService.selectSeats(flight._id, selectedSeats);
      } catch (lockErr) {
        // If locking fails, show the backend message (e.g., already booked)
        setError(lockErr.response?.data?.message || lockErr.message || 'Failed to lock seats');
        setLoading(false);
        return;
      }

      // Create booking (payment simulation happens on backend)
      const response = await bookingService.createBooking(flight._id, selectedSeats, passengers, seatClass);
      setBooking(response.data.booking);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = () => {
    if (booking) {
      generateTicketPDF(booking, flight);
    }
  };

  // Calculate total price with class multiplier
  const classMultipliers = { economy: 1, business: 1.5, first: 2 };
  const basePricePerSeat = flight.currentDynamicPrice || flight.baseFare || 0;
  const pricePerSeat = basePricePerSeat * classMultipliers[seatClass];
  const totalPrice = pricePerSeat * selectedSeats.length;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/search')}
            className="text-blue-600 hover:text-blue-800 mb-4 text-sm font-semibold"
          >
            ← Back to Search
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Complete Your Booking</h1>
          <p className="text-gray-600 mt-2">
            {flight.airline?.code} {flight.flightNumber} • {flight.origin?.iata} → {flight.destination?.iata}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 flex justify-between">
          {[
            { num: 1, label: 'Select Seats' },
            { num: 2, label: 'Passengers' },
            { num: 3, label: 'Payment' },
            { num: 4, label: 'Confirmation' },
          ].map((s) => (
            <div key={s.num} className="flex-1 text-center">
              <div
                className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm mb-2 ${
                  step >= s.num
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {s.num}
              </div>
              <p className={`text-xs font-semibold ${step === s.num ? 'text-blue-600' : 'text-gray-600'}`}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Step 1: Seat Selection */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Select Your Seats & Class</h2>
            
            {/* Seat Class Selection */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Select Booking Class</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['economy', 'business', 'first'].map((cls) => {
                  const multipliers = { economy: 1, business: 1.5, first: 2 };
                  const prices = {
                    economy: flight.baseFare || 0,
                    business: (flight.baseFare || 0) * 1.5,
                    first: (flight.baseFare || 0) * 2,
                  };
                  return (
                    <button
                      key={cls}
                      onClick={() => setSeatClass(cls)}
                      className={`p-4 rounded-lg border-2 transition ${
                        seatClass === cls
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      <p className="font-bold text-gray-800 capitalize">{cls}</p>
                      <p className="text-sm text-gray-600">${prices[cls].toFixed(2)} per seat</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {cls === 'economy' && '✓ Standard seating'}
                        {cls === 'business' && '✓ Extra legroom, meals'}
                        {cls === 'first' && '✓ Premium service, lounge access'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-center gap-2 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-200 border-2 border-green-600 rounded"></div>
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 rounded"></div>
                  <span className="text-sm">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                  <span className="text-sm">Booked</span>
                </div>
              </div>

              {/* Seat Grid */}
              <div className="flex justify-center">
                <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
                  {seats.map((seat) => {
                    const isSelected = selectedSeats.includes(seat);
                    const isBooked = flight.seatMap?.[seat] === 'booked';
                    const isAvailable = !isBooked;

                    return (
                      <button
                        key={seat}
                        onClick={() => isAvailable && handleSeatSelect(seat)}
                        disabled={isBooked}
                        className={`w-10 h-10 rounded font-semibold text-sm transition ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : isBooked
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-green-200 border-2 border-green-600 hover:bg-green-300'
                        }`}
                      >
                        {seat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Seats Summary */}
            <div className="bg-blue-50 p-4 rounded mb-6">
              <p className="font-semibold text-gray-800">
                Selected Seats: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Price per seat ({seatClass}): ${pricePerSeat.toFixed(2)} (Base: ${basePricePerSeat.toFixed(2)} × {classMultipliers[seatClass]})
              </p>
              {selectedSeats.length > 0 && (
                <p className="text-sm font-semibold text-blue-700 mt-2">
                  Total: ${totalPrice.toFixed(2)}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/search')}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedSeats.length === 0) {
                    setError('Please select at least one seat');
                    return;
                  }
                  // Pre-fill first passenger with user data, rest empty
                  const newPassengers = Array.from({ length: selectedSeats.length }, (_, index) => 
                    index === 0 
                      ? { 
                          name: user?.name || '', 
                          email: user?.email || '', 
                          phone: user?.phone || '', 
                          title: 'Mr' 
                        }
                      : { name: '', email: '', phone: '', title: 'Mr' }
                  );
                  setPassengers(newPassengers);
                  setStep(2);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
              >
                Continue to Passengers
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Passenger Details */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Passenger Details</h2>
            <p className="text-gray-600 mb-6">Enter details for all {selectedSeats.length} passengers</p>

            <div className="space-y-6">
              {selectedSeats.map((seat, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">Passenger {index + 1} - Seat {seat}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                      <select
                        value={passengers[index]?.title || 'Mr'}
                        onChange={(e) => handlePassengerChange(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      >
                        <option value="Mr">Mr</option>
                        <option value="Ms">Ms</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Dr">Dr</option>
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={passengers[index]?.name || ''}
                        onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                        placeholder="First and Last Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={passengers[index]?.email || ''}
                        onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                        placeholder="passenger@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                      <input
                        type="tel"
                        value={passengers[index]?.phone || ''}
                        onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                        placeholder="+1-555-0000"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-100"
              >
                Back to Seats
              </button>
              <button
                onClick={handleContinueToPayment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Review & Pay</h2>

            {/* Booking Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-lg mb-4 text-gray-800">Flight Details</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Flight:</span>
                    <span className="font-semibold">{flight.airline?.code} {flight.flightNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>From:</span>
                    <span className="font-semibold">{flight.origin?.iata} - {flight.origin?.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>To:</span>
                    <span className="font-semibold">{flight.destination?.iata} - {flight.destination?.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-semibold">{formatDate(flight.departureTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Departure:</span>
                    <span className="font-semibold">{formatTime(flight.departureTime)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4 text-gray-800">Booking Summary</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Seats:</span>
                    <span className="font-semibold">{selectedSeats.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Class:</span>
                    <span className="font-semibold capitalize">{seatClass}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passengers:</span>
                    <span className="font-semibold">{(passengers || []).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per seat:</span>
                    <span className="font-semibold">${pricePerSeat.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 flex justify-between text-base">
                    <span className="font-bold">Total Amount:</span>
                    <span className="font-bold text-green-600 text-lg">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger List */}
            <div className="bg-gray-50 p-4 rounded mb-8">
              <h3 className="font-bold text-gray-800 mb-3">Passengers</h3>
              <div className="space-y-2 text-sm">
                {(passengers || []).map((p, i) => (
                  <div key={i} className="flex justify-between text-gray-700">
                    <span>{p?.title} {p?.name}</span>
                    <span className="text-gray-600">Seat: {selectedSeats[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8">
              <p className="text-sm text-gray-700">
                ✓ I agree to the terms and conditions
              </p>
              <p className="text-xs text-gray-600 mt-2">
                A confirmation email will be sent to the first passenger's email with booking details and ticket information.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-100"
              >
                Back to Passengers
              </button>
              <button
                onClick={handleCreateBooking}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && booking && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600">Your booking has been successfully confirmed</p>
            </div>

            {/* Booking Reference */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-600 rounded-lg p-6 mb-8 text-center">
              <p className="text-gray-700 text-sm mb-2">YOUR BOOKING REFERENCE</p>
              <p className="text-3xl font-bold text-blue-600">{booking.pnr}</p>
              <p className="text-xs text-gray-600 mt-3">Save this number for check-in and support</p>
            </div>

            {/* Booking Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Flight Information</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div>
                    <p className="text-gray-600 text-xs">FLIGHT</p>
                    <p className="font-bold">{flight.airline?.code} {flight.flightNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">DATE</p>
                    <p className="font-bold">{formatDate(flight.departureTime)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">DEPARTURE</p>
                    <p className="font-bold">{formatTime(flight.departureTime)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">FROM → TO</p>
                    <p className="font-bold">{flight.origin?.iata} → {flight.destination?.iata}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-4">Booking Information</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div>
                    <p className="text-gray-600 text-xs">SEATS</p>
                    <p className="font-bold">{booking.seatNumbers.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">PASSENGERS</p>
                    <p className="font-bold">{booking.passengers.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">TOTAL PAID</p>
                    <p className="font-bold text-green-600">${booking.pricePaid.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">STATUS</p>
                    <p className="font-bold text-blue-600 uppercase">{booking.status}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger List */}
            <div className="bg-gray-50 rounded p-6 mb-8">
              <h3 className="font-bold text-gray-800 mb-4">Passengers</h3>
              <div className="space-y-3">
                {booking.passengers.map((p, i) => (
                  <div key={i} className="flex justify-between items-center pb-3 border-b border-gray-300 last:border-0">
                    <div>
                      <p className="font-semibold text-gray-800">{i + 1}. {p.title} {p.name}</p>
                      <p className="text-xs text-gray-600">Seat: {booking.seatNumbers[i]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/bookings')}
                className="flex-1 px-4 py-3 border-2 border-blue-600 text-blue-600 rounded font-semibold hover:bg-blue-50"
              >
                View All Bookings
              </button>
              <button
                onClick={handleDownloadTicket}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                📥 Download Ticket PDF
              </button>
            </div>

            <button
              onClick={() => navigate('/search')}
              className="w-full mt-4 px-4 py-2 text-blue-600 rounded font-semibold hover:bg-blue-50"
            >
              Search More Flights
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFlow;
