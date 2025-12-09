const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    pnr: { type: String, unique: true, required: true },
    seatNumbers: [String], // array of seat numbers
    passengers: [
      {
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
    dynamicPricingApplied: Boolean,
    status: {
      type: String,
      enum: ['pending', 'booked', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    seatLockExpiry: Date, // 2 minutes lock
    confirmationEmailSent: { type: Boolean, default: false },
    cancellationReason: String,
    refundAmount: Number,
    cancellationDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
