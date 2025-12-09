const mongoose = require('mongoose');

const fareHistorySchema = new mongoose.Schema(
  {
    flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    timestamp: { type: Date, default: Date.now },
    baseFare: Number,
    calculatedFare: Number,
    dynamicMultiplier: Number, // price multiplier (e.g., 1.2 = 20% increase)
    remainingSeatsPercentage: Number,
    hoursUntilDeparture: Number,
    demandLevel: String, // low, medium, high, surge
    seatLockCount: Number,
    activeBookingCount: Number,
    historicalTrend: Number, // -1, 0, +1 for trending down/stable/up
  },
  { timestamps: true }
);

module.exports = mongoose.model('FareHistory', fareHistorySchema);
