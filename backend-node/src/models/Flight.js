const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema(
  {
    airline: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
    flightNumber: { type: String, required: true },
    origin: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    duration: Number, // in minutes
    baseFare: { type: Number, required: true, min: 0 },
    totalSeats: { type: Number, required: true, min: 1 },
    availableSeats: { type: Number, required: true, min: 0 },
    seatMap: { type: Map, of: String, default: new Map() }, // seatNumber -> status (available/booked/locked)
    aircraft: String,
    dynamicPricingEnabled: { type: Boolean, default: true },
    currentDynamicPrice: Number,
    priceFloor: Number,
    priceCeiling: Number,
    bookingCount: { type: Number, default: 0 },
    cancellationCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Flight', flightSchema);
