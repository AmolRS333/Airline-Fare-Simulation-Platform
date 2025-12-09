const User = require('../models/User');
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const FareHistory = require('../models/FareHistory');
const CancellationLog = require('../models/CancellationLog');

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
  getAllUsers,
  updateUserRole,
  getAnalytics,
  getBookingAnalytics,
  getPricingAnalytics,
  getRevenueAnalytics,
  getAllBookings,
};
