const mongoose = require('mongoose');

const cancellationLogSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    pnr: String,
    reason: String,
    refundAmount: Number,
    refundPercentage: Number, // percentage of original amount refunded
    originalPricePaid: Number,
    cancelledAt: { type: Date, default: Date.now },
    refundProcessedAt: Date,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CancellationLog', cancellationLogSchema);
