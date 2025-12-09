const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    iata: { type: String, required: true, unique: true, uppercase: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    latitude: Number,
    longitude: Number,
    timezone: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Airport', airportSchema);
