const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const User = require('../models/User');
const CancellationLog = require('../models/CancellationLog');
const { generatePNR, simulatePayment, calculateRefundPercentage } = require('../utils/helpers');
const { sendBookingConfirmationEmail, sendCancellationEmail } = require('../utils/emailService');
const { saveReceiptToFile } = require('../utils/pdfGenerator');

const SEAT_LOCK_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

const lockSeats = async (flightId, seatNumbers) => {
  try {
    const flight = await Flight.findById(flightId);
    if (!flight) throw new Error('Flight not found');

    for (let seat of seatNumbers) {
      if (flight.seatMap.get(seat) !== 'available') {
        throw new Error(`Seat ${seat} is not available`);
      }
      flight.seatMap.set(seat, 'locked');
    }

    flight.availableSeats -= seatNumbers.length;
    await flight.save();

    return { success: true, seatNumbers };
  } catch (error) {
    throw error;
  }
};

const releaseSeats = async (flightId, seatNumbers) => {
  try {
    const flight = await Flight.findById(flightId);
    if (!flight) return;

    for (let seat of seatNumbers) {
      const status = flight.seatMap.get(seat);
      if (status === 'locked' || status === 'available') {
        flight.seatMap.set(seat, 'available');
      }
    }

    flight.availableSeats += seatNumbers.length;
    await flight.save();
  } catch (error) {
    console.error('Error releasing seats:', error);
  }
};

const confirmSeats = async (flightId, seatNumbers) => {
  try {
    const flight = await Flight.findById(flightId);
    if (!flight) throw new Error('Flight not found');

    for (let seat of seatNumbers) {
      if (flight.seatMap.get(seat) !== 'locked') {
        throw new Error(`Seat ${seat} is not locked`);
      }
      flight.seatMap.set(seat, 'booked');
    }

    await flight.save();
  } catch (error) {
    throw error;
  }
};

const selectSeats = async (req, res) => {
  try {
    const { flightId, seatNumbers } = req.body;

    // Lock seats for 2 minutes
    await lockSeats(flightId, seatNumbers);

    // Set timeout to release seats if not booked within 2 minutes
    setTimeout(async () => {
      await releaseSeats(flightId, seatNumbers);
    }, SEAT_LOCK_DURATION);

    res.json({ message: 'Seats locked', seatNumbers, lockExpiry: Date.now() + SEAT_LOCK_DURATION });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const { flightId, seatNumbers, passengers } = req.body;
    const userId = req.user.userId;

    // Validate flight exists
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Verify seats are locked
    for (let seat of seatNumbers) {
      const status = flight.seatMap.get(seat);
      if (status !== 'locked') {
        return res.status(400).json({ message: `Seat ${seat} is not locked or available` });
      }
    }

    // Get current dynamic price
    let pricePaid = flight.currentDynamicPrice || flight.baseFare;
    pricePaid = pricePaid * seatNumbers.length;

    // Simulate payment
    const payment = simulatePayment(pricePaid);

    if (!payment.success) {
      // Release locked seats
      await releaseSeats(flightId, seatNumbers);
      return res.status(400).json({
        message: 'Payment failed',
        transactionId: payment.transactionId,
      });
    }

    // Generate PNR
    const pnr = generatePNR();

    // Create booking
    const booking = new Booking({
      userId,
      flightId,
      pnr,
      seatNumbers,
      passengers,
      pricePaid,
      baseFarePerSeat: flight.baseFare,
      dynamicPricingApplied: flight.currentDynamicPrice > flight.baseFare,
      status: 'pending',
      paymentStatus: 'completed',
      seatLockExpiry: new Date(Date.now() + SEAT_LOCK_DURATION),
    });

    await booking.save();

    // Confirm seats in flight
    await confirmSeats(flightId, seatNumbers);

    // Update flight booking count
    flight.bookingCount += 1;
    await flight.save();

    // Send confirmation email
    try {
      const user = await User.findById(userId);
      await sendBookingConfirmationEmail(user.email, {
        passengerName: passengers[0].name,
        flightNumber: flight.flightNumber,
        origin: flight.origin,
        destination: flight.destination,
        departureTime: flight.departureTime,
        seats: seatNumbers,
        totalAmount: pricePaid,
      }, pnr);
      booking.confirmationEmailSent = true;
      await booking.save();
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }

    // Generate receipt
    try {
      const user = await User.findById(userId);
      const airline = await flight.populate('airline');
      const origin = await flight.populate('origin');
      const destination = await flight.populate('destination');
      await saveReceiptToFile(booking, flight, user, airline, origin, destination);
    } catch (pdfError) {
      console.error('Error generating receipt:', pdfError);
    }

    // Return the full booking document so frontend has passengers and other fields
    const fullBooking = await Booking.findById(booking._id).lean();

    res.status(201).json({
      message: 'Booking created successfully',
      booking: fullBooking,
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Booking failed', error: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookings = await Booking.find({ userId })
      .populate('flightId')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

const getBookingByPNR = async (req, res) => {
  try {
    const { pnr } = req.params;
    const booking = await Booking.findOne({ pnr })
      .populate('userId', 'name email')
      .populate('flightId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify ownership
    if (booking.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    // Get flight details
    const flight = await Flight.findById(booking.flightId);

    // Calculate refund
    const refundPercentage = calculateRefundPercentage(booking.createdAt, flight.departureTime);
    const refundAmount = (booking.pricePaid * refundPercentage) / 100;

    // Update booking
    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.refundAmount = refundAmount;
    booking.cancellationDate = new Date();
    await booking.save();

    // Release seats
    for (let seat of booking.seatNumbers) {
      flight.seatMap.set(seat, 'available');
    }
    flight.availableSeats += booking.seatNumbers.length;
    flight.cancellationCount += 1;
    await flight.save();

    // Create cancellation log
    const cancellationLog = new CancellationLog({
      bookingId: booking._id,
      userId,
      flightId: flight._id,
      pnr: booking.pnr,
      originalPricePaid: booking.pricePaid,
      refundAmount,
      refundPercentage,
      refundStatus: 'processed',
      refundProcessedAt: new Date(),
    });
    await cancellationLog.save();

    // Send cancellation email
    try {
      const user = await User.findById(userId);
      await sendCancellationEmail(user.email, {
        passengerName: booking.passengers[0].name,
        pnr: booking.pnr,
        refundAmount,
      });
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError);
    }

    res.json({
      message: 'Booking cancelled successfully',
      refundAmount,
      refundPercentage,
    });
  } catch (error) {
    console.error('Cancellation error:', error);
    res.status(500).json({ message: 'Cancellation failed', error: error.message });
  }
};

module.exports = {
  selectSeats,
  createBooking,
  getBookings,
  getBookingByPNR,
  cancelBooking,
};
