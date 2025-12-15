const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema(
  {
    airline: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
    flightNumber: { type: String, required: true },
    origin: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
    departureTime: { type: Date, required: true, index: true },
    arrivalTime: { type: Date, required: true },
    duration: Number, // in minutes
    baseFare: { type: Number, required: true, min: 0 },
    totalSeats: { type: Number, required: true, min: 1 },
    availableSeats: { type: Number, required: true, min: 0 },
    seatMap: { type: Map, of: String, default: new Map() }, // seatNumber -> status (available/booked/locked)
    seatClasses: {
      economy: {
        count: { type: Number, default: 0 },
        pricingMultiplier: { type: Number, default: 1.0 },
        availableSeats: { type: Number, default: 0 },
      },
      business: {
        count: { type: Number, default: 0 },
        pricingMultiplier: { type: Number, default: 1.5 },
        availableSeats: { type: Number, default: 0 },
      },
      first: {
        count: { type: Number, default: 0 },
        pricingMultiplier: { type: Number, default: 2.0 },
        availableSeats: { type: Number, default: 0 },
      },
    },
    aircraft: String,
    dynamicPricingEnabled: { type: Boolean, default: true },
    currentDynamicPrice: Number,
    priceFloor: Number,
    priceCeiling: Number,
    bookingCount: { type: Number, default: 0 },
    cancellationCount: { type: Number, default: 0 },
    waitlistCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for efficient queries
flightSchema.index({ origin: 1, destination: 1, departureTime: 1 });
flightSchema.index({ departureTime: 1 });

module.exports = mongoose.model('Flight', flightSchema);
