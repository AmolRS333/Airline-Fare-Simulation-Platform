const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true, index: true },
    pnr: { type: String, unique: true, required: true },
    seatNumbers: [String], // array of seat numbers
    seatClass: { type: String, enum: ['economy', 'business', 'first'], default: 'economy' },
    passengers: [
      {
        title: String,
        name: String,
        email: String,
        phone: String,
        dateOfBirth: Date,
        passport: String,
        nationality: String,
      },
    ],
    pricePaid: { type: Number, required: true, min: 0 },
    baseFarePerSeat: Number,
    classPricingMultiplier: { type: Number, default: 1 },
    dynamicPricingApplied: Boolean,
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled', 'waitlist'],
      default: 'confirmed',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed',
    },
    seatLockExpiry: Date, // 2 minutes lock
    confirmationEmailSent: { type: Boolean, default: false },
    receiptGenerated: { type: Boolean, default: false },
    receiptPath: String, // File path or URL to saved receipt PDF
    cancellationReason: String,
    refundAmount: Number,
    refundPercentage: Number,
    cancellationDate: Date,
    waitlistPosition: Number, // For waitlisted bookings
  },
  { timestamps: true }
);

// Index for efficient queries
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ flightId: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
