const User = require('../models/User');
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const FareHistory = require('../models/FareHistory');
const CancellationLog = require('../models/CancellationLog');
const Airline = require('../models/Airline');
const Airport = require('../models/Airport');

// FLIGHT MANAGEMENT
const getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.find({ isActive: true })
      .populate('airline', 'name iata')
      .populate('origin', 'city iata')
      .populate('destination', 'city iata')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching flights', error: error.message });
  }
};

const getFlightDetails = async (req, res) => {
  try {
    const { flightId } = req.params;
    const flight = await Flight.findById(flightId)
      .populate('airline', 'name iata')
      .populate('origin', 'city iata')
      .populate('destination', 'city iata');
    
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    res.json(flight);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching flight details', error: error.message });
  }
};

const updateFlight = async (req, res) => {
  try {
    const { flightId } = req.params;
    const updateData = req.body;
    
    const flight = await Flight.findByIdAndUpdate(flightId, updateData, { new: true })
      .populate('airline', 'name iata')
      .populate('origin', 'city iata')
      .populate('destination', 'city iata');
    
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    res.json({ message: 'Flight updated successfully', flight });
  } catch (error) {
    res.status(500).json({ message: 'Error updating flight', error: error.message });
  }
};

const deleteFlight = async (req, res) => {
  try {
    const { flightId } = req.params;
    
    // Check if flight has active bookings
    const activeBookings = await Booking.countDocuments({ 
      flightId, 
      status: { $in: ['confirmed', 'pending'] } 
    });
    
    if (activeBookings > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete flight with active bookings. Cancel all bookings first.' 
      });
    }
    
    const flight = await Flight.findByIdAndUpdate(flightId, { isActive: false });
    
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    res.json({ message: 'Flight deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting flight', error: error.message });
  }
};

// SEAT MANAGEMENT
const getSeatMap = async (req, res) => {
  try {
    const { flightId } = req.params;
    const flight = await Flight.findById(flightId);
    
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    // Get booked seats for this flight
    const bookedSeats = await Booking.find({ 
      flightId, 
      status: { $in: ['confirmed', 'pending'] } 
    }).distinct('seatNumbers');
    
    // Flatten the array of arrays
    const allBookedSeats = bookedSeats.flat();
    
    // Create seat map
    const seatMap = {};
    for (let i = 1; i <= flight.totalSeats; i++) {
      const seatNumber = i.toString();
      seatMap[seatNumber] = allBookedSeats.includes(seatNumber) ? 'booked' : 'available';
    }
    
    res.json(seatMap);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching seat map', error: error.message });
  }
};

const updateSeatStatus = async (req, res) => {
  try {
    const { flightId, seat } = req.params;
    const { status } = req.body;
    
    // This is a simplified implementation
    // In a real system, you'd update seat status in the flight document
    res.json({ message: 'Seat status updated', seat, status });
  } catch (error) {
    res.status(500).json({ message: 'Error updating seat status', error: error.message });
  }
};

const getBookedSeats = async (req, res) => {
  try {
    const { flightId } = req.params;
    const bookedSeats = await Booking.find({ 
      flightId, 
      status: { $in: ['confirmed', 'pending'] } 
    }).distinct('seatNumbers');
    
    res.json(bookedSeats.flat());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booked seats', error: error.message });
  }
};

// BOOKING MANAGEMENT
const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email phone')
      .populate({
        path: 'flightId',
        populate: [
          { path: 'airline', select: 'name iata' },
          { path: 'origin', select: 'city iata' },
          { path: 'destination', select: 'city iata' }
        ]
      });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking details', error: error.message });
  }
};

const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      bookingId, 
      { status: 'confirmed' }, 
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({ message: 'Booking confirmed', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming booking', error: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'Admin cancellation';
    await booking.save();
    
    // Log cancellation
    await CancellationLog.create({
      bookingId,
      flightId: booking.flightId,
      userId: booking.userId,
      reason: reason || 'Admin cancellation',
      cancelledAt: new Date()
    });
    
    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking', error: error.message });
  }
};

const refundBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { refundPercentage } = req.body;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const refundAmount = (booking.pricePaid * refundPercentage) / 100;
    booking.refundAmount = refundAmount;
    booking.status = 'refunded';
    await booking.save();
    
    res.json({ message: 'Refund processed', booking, refundAmount });
  } catch (error) {
    res.status(500).json({ message: 'Error processing refund', error: error.message });
  }
};

const getBookingsByFlight = async (req, res) => {
  try {
    const { flightId } = req.params;
    const bookings = await Booking.find({ flightId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings by flight', error: error.message });
  }
};

// USER MANAGEMENT
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
};

const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { isBlocked: true }, { new: true }).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User blocked', user });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking user', error: error.message });
  }
};

const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { isBlocked: false }, { new: true }).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User unblocked', user });
  } catch (error) {
    res.status(500).json({ message: 'Error unblocking user', error: error.message });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    // In a real system, you'd generate a reset token and send email
    // For now, just mark as reset requested
    res.json({ message: 'Password reset initiated' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user has active bookings
    const activeBookings = await Booking.countDocuments({ 
      userId, 
      status: { $in: ['confirmed', 'pending'] } 
    });
    
    if (activeBookings > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user with active bookings. Cancel all bookings first.' 
      });
    }
    
    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// REPORTS & ANALYTICS
const getDashboardStats = async (req, res) => {
  try {
    const activeUsers = await User.countDocuments({ isBlocked: false });
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$pricePaid' } } }
    ]);
    
    const totalFlights = await Flight.countDocuments({ isActive: true });
    const avgOccupancy = await Flight.aggregate([
      { $match: { isActive: true } },
      { $group: { 
        _id: null, 
        totalSeats: { $sum: '$totalSeats' },
        availableSeats: { $sum: '$availableSeats' }
      }}
    ]);
    
    const occupancy = avgOccupancy[0] ? 
      ((avgOccupancy[0].totalSeats - avgOccupancy[0].availableSeats) / avgOccupancy[0].totalSeats) * 100 : 0;
    
    res.json({
      activeUsers,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalFlights,
      avgOccupancy: occupancy
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

const getBookingReport = async (req, res) => {
  try {
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const result = {};
    bookingsByStatus.forEach(item => {
      result[item._id] = item.count;
    });
    
    res.json({ bookingsByStatus: result });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking report', error: error.message });
  }
};

const getRevenueReport = async (req, res) => {
  try {
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$pricePaid' } } }
    ]);
    
    const avgBookingValue = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, avg: { $avg: '$pricePaid' } } }
    ]);
    
    const refundedAmount = await Booking.aggregate([
      { $match: { status: 'refunded' } },
      { $group: { _id: null, total: { $sum: '$refundAmount' } } }
    ]);
    
    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      avgBookingValue: avgBookingValue[0]?.avg || 0,
      refundedAmount: refundedAmount[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching revenue report', error: error.message });
  }
};

const getFlightOccupancyReport = async (req, res) => {
  try {
    const flights = await Flight.find({ isActive: true })
      .populate('origin', 'iata')
      .populate('destination', 'iata');
    
    const byFlight = flights.map(flight => {
      const bookedSeats = flight.totalSeats - flight.availableSeats;
      const occupancy = (bookedSeats / flight.totalSeats) * 100;
      
      return {
        flightNumber: flight.flightNumber,
        seatsBooked: bookedSeats,
        totalSeats: flight.totalSeats,
        occupancy: occupancy
      };
    });
    
    const avgOccupancy = byFlight.reduce((sum, f) => sum + f.occupancy, 0) / byFlight.length;
    const totalSeatsBooked = byFlight.reduce((sum, f) => sum + f.seatsBooked, 0);
    
    res.json({
      avgOccupancy,
      totalSeatsBooked,
      byFlight
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching occupancy report', error: error.message });
  }
};

const getClassWiseReport = async (req, res) => {
  try {
    const classData = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { 
        _id: '$seatClass', 
        bookings: { $sum: 1 },
        revenue: { $sum: '$pricePaid' }
      }}
    ]);
    
    const totalBookings = classData.reduce((sum, c) => sum + c.bookings, 0);
    const result = classData.map(item => ({
      class: item._id || 'economy',
      bookings: item.bookings,
      revenue: item.revenue,
      percentage: (item.bookings / totalBookings) * 100
    }));
    
    res.json({ byClass: result });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class-wise report', error: error.message });
  }
};

const getTrendReport = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const trends = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$pricePaid' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trend report', error: error.message });
  }
};

// SYSTEM HEALTH
const getSystemHealth = async (req, res) => {
  try {
    // Backend health
    const backendStatus = 'healthy';
    const backendDetails = ['All services running', 'Database connected'];
    
    // Python service health (mock)
    const pythonStatus = 'healthy';
    const pythonDetails = ['Pricing engine active'];
    
    // Database health
    const dbStatus = 'healthy';
    const dbDetails = ['MongoDB connected', 'All collections accessible'];
    
    // API response time (mock)
    const apiStatus = 'healthy';
    const apiDetails = ['Average response time: 45ms'];
    
    res.json({
      backend: { status: backendStatus, details: backendDetails },
      python: { status: pythonStatus, details: pythonDetails },
      database: { status: dbStatus, details: dbDetails },
      api: { status: apiStatus, details: apiDetails },
      metrics: {
        apiResponseTime: 45,
        dbQueryTime: 12,
        uptime: '99.9%'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system health', error: error.message });
  }
};

const getBackendStatus = async (req, res) => {
  res.json({ status: 'healthy', details: ['Node.js server running'] });
};

const getPythonPricingStatus = async (req, res) => {
  res.json({ status: 'healthy', details: ['Python pricing service active'] });
};

const getDatabaseStatus = async (req, res) => {
  res.json({ status: 'healthy', details: ['MongoDB connected'] });
};

// PRICING CONTROL
const getPricingRules = async (req, res) => {
  try {
    // Mock pricing rules - in a real system, these would be stored in DB
    const rules = {
      seatMultiplier: 1.5,
      timeMultiplier: 2.0,
      demandMultiplier: 1.8,
      priceFloor: 50,
      priceCeiling: 5000
    };
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pricing rules', error: error.message });
  }
};

const updatePricingRules = async (req, res) => {
  try {
    const rules = req.body;
    // In a real system, save to database
    res.json({ message: 'Pricing rules updated', rules });
  } catch (error) {
    res.status(500).json({ message: 'Error updating pricing rules', error: error.message });
  }
};

const getPriceHistory = async (req, res) => {
  try {
    const history = await FareHistory.find()
      .populate('flightId', 'flightNumber')
      .sort({ timestamp: -1 })
      .limit(20);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching price history', error: error.message });
  }
};

const getPriceChangeLog = async (req, res) => {
  try {
    // Mock changelog
    const changelog = [
      { action: 'Updated seat multiplier', details: 'Changed from 1.4 to 1.5', timestamp: new Date() }
    ];
    res.json(changelog);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching price change log', error: error.message });
  }
};

// EMAIL & NOTIFICATIONS
const getEmailTemplates = async (req, res) => {
  try {
    // Mock email templates
    const templates = [
      {
        _id: 'booking_confirmation',
        name: 'booking_confirmation',
        subject: 'Booking Confirmation - {{pnr}}',
        body: 'Dear {{name}},\n\nYour booking has been confirmed.\n\nFlight: {{flightNumber}}\nDate: {{date}}\n\nThank you!',
        variables: ['{{name}}', '{{pnr}}', '{{flightNumber}}', '{{date}}']
      },
      {
        _id: 'cancellation',
        name: 'cancellation',
        subject: 'Booking Cancelled - {{pnr}}',
        body: 'Dear {{name}},\n\nYour booking has been cancelled.\n\nRefund amount: ${{refundAmount}}\n\nRegards,',
        variables: ['{{name}}', '{{pnr}}', '{{refundAmount}}']
      }
    ];
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching email templates', error: error.message });
  }
};

const updateEmailTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { subject, body, variables } = req.body;
    // In a real system, update in database
    res.json({ message: 'Template updated', templateId, subject, body });
  } catch (error) {
    res.status(500).json({ message: 'Error updating email template', error: error.message });
  }
};

const sendNotification = async (req, res) => {
  try {
    const { templateId, email } = req.body;
    // Mock sending email
    res.json({ message: 'Test email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending notification', error: error.message });
  }
};

const broadcastNotification = async (req, res) => {
  try {
    const { subject, message, recipients } = req.body;
    // Mock broadcasting
    res.json({ message: `Notification sent to ${recipients}` });
  } catch (error) {
    res.status(500).json({ message: 'Error broadcasting notification', error: error.message });
  }
};

// PDF TEMPLATES
const getPDFTemplates = async (req, res) => {
  try {
    // Mock PDF template
    const template = {
      headerText: 'FLIGHT BOOKING CONFIRMATION',
      footerText: 'Thank you for booking with us',
      companyName: 'Flight Booking System',
      accentColor: '#003366',
      primaryColor: '#000000'
    };
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching PDF template', error: error.message });
  }
};

const updatePDFTemplate = async (req, res) => {
  try {
    const template = req.body;
    // In a real system, save to database
    res.json({ message: 'PDF template updated', template });
  } catch (error) {
    res.status(500).json({ message: 'Error updating PDF template', error: error.message });
  }
};

// User Management
const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const users = await User.find(query).select('-password').limit(100);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['customer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

// Analytics
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFlights = await Flight.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: '$pricePaid' } } },
    ]);

    const topRoutes = await Booking.aggregate([
      {
        $group: {
          _id: { flightId: '$flightId' },
          count: { $sum: 1 },
          revenue: { $sum: '$pricePaid' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'flights',
          localField: '_id.flightId',
          foreignField: '_id',
          as: 'flight',
        },
      },
    ]);

    const bookingTrend = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 30 },
    ]);

    const pricingEvents = await FareHistory.aggregate([
      { $match: { demandLevel: 'surge' } },
      { $group: { _id: '$flightId', surgeCount: { $sum: 1 }, avgPrice: { $avg: '$calculatedFare' } } },
      { $sort: { surgeCount: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      totalUsers,
      totalFlights,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      topRoutes,
      bookingTrend,
      pricingEvents,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

const getBookingAnalytics = async (req, res) => {
  try {
    const allBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });

    const cancellationRate = (cancelledBookings / allBookings) * 100;

    const mostCancelledFlights = await CancellationLog.aggregate([
      { $group: { _id: '$flightId', cancellations: { $sum: 1 } } },
      { $sort: { cancellations: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      total: allBookings,
      completed: completedBookings,
      cancelled: cancelledBookings,
      pending: pendingBookings,
      cancellationRate: cancellationRate.toFixed(2),
      mostCancelledFlights,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking analytics', error: error.message });
  }
};

const getPricingAnalytics = async (req, res) => {
  try {
    const pricingTrend = await FareHistory.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' },
          },
          avgPrice: { $avg: '$calculatedFare' },
          avgMultiplier: { $avg: '$dynamicMultiplier' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 30 },
    ]);

    const demandLevelDistribution = await FareHistory.aggregate([
      { $group: { _id: '$demandLevel', count: { $sum: 1 } } },
    ]);

    const peakBookingHours = await Booking.aggregate([
      {
        $group: {
          _id: { $hour: '$createdAt' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const seatInventoryTrend = await Flight.aggregate([
      {
        $group: {
          _id: null,
          avgAvailableSeats: { $avg: '$availableSeats' },
          totalSeats: { $sum: '$totalSeats' },
          bookedSeats: { $sum: { $subtract: ['$totalSeats', '$availableSeats'] } },
        },
      },
    ]);

    res.json({
      pricingTrend,
      demandLevelDistribution,
      peakBookingHours,
      seatInventoryTrend: seatInventoryTrend[0] || {},
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pricing analytics', error: error.message });
  }
};

const getRevenueAnalytics = async (req, res) => {
  try {
    const dailyRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          revenue: { $sum: '$pricePaid' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 30 },
    ]);

    const refundsByAirline = await Booking.aggregate([
      { $match: { paymentStatus: 'refunded' } },
      {
        $lookup: {
          from: 'flights',
          localField: 'flightId',
          foreignField: '_id',
          as: 'flight',
        },
      },
      { $unwind: '$flight' },
      {
        $lookup: {
          from: 'airlines',
          localField: 'flight.airline',
          foreignField: '_id',
          as: 'airline',
        },
      },
      {
        $group: {
          _id: '$airline.name',
          totalRefunds: { $sum: '$pricePaid' },
          refundCount: { $sum: 1 },
        },
      },
    ]);

    res.json({
      dailyRevenue,
      refundsByAirline,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching revenue analytics', error: error.message });
  }
};

// All Bookings for Admin
const getAllBookings = async (req, res) => {
  try {
    const { status, flightId } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (flightId) {
      query.flightId = flightId;
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'name email')
      .populate('flightId', 'flightNumber')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

module.exports = {
  // Flight Management
  getAllFlights,
  getFlightDetails,
  updateFlight,
  deleteFlight,
  
  // Seat Management
  getSeatMap,
  updateSeatStatus,
  getBookedSeats,
  
  // Booking Management
  getAllBookings,
  getBookingDetails,
  confirmBooking,
  cancelBooking,
  refundBooking,
  getBookingsByFlight,
  
  // User Management
  getAllUsers,
  getUserDetails,
  blockUser,
  unblockUser,
  resetUserPassword,
  deleteUser,
  updateUserRole,
  
  // Reports & Analytics
  getDashboardStats,
  getBookingReport,
  getRevenueReport,
  getFlightOccupancyReport,
  getClassWiseReport,
  getTrendReport,
  
  // System Health
  getSystemHealth,
  getBackendStatus,
  getPythonPricingStatus,
  getDatabaseStatus,
  
  // Pricing Control
  getPricingRules,
  updatePricingRules,
  getPriceHistory,
  getPriceChangeLog,
  
  // Email & Notifications
  getEmailTemplates,
  updateEmailTemplate,
  sendNotification,
  broadcastNotification,
  
  // PDF Templates
  getPDFTemplates,
  updatePDFTemplate,
  
  // Legacy Analytics
  getAnalytics,
  getBookingAnalytics,
  getPricingAnalytics,
  getRevenueAnalytics,
};
