const crypto = require('crypto');

// Generate PNR (6-character alphanumeric)
const generatePNR = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pnr = '';
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
};

// Generate unique seat number for a flight
const generateSeatNumber = (seatIndex) => {
  const row = Math.floor(seatIndex / 6) + 1;
  const column = String.fromCharCode(65 + (seatIndex % 6)); // A, B, C, D, E, F
  return `${row}${column}`;
};

// Simulate payment with random success/failure
const simulatePayment = (amount, successRate = 0.95) => {
  const random = Math.random();
  const success = random < successRate;
  
  return {
    success,
    transactionId: 'TXN_' + crypto.randomBytes(8).toString('hex').toUpperCase(),
    amount,
    timestamp: new Date(),
    message: success ? 'Payment successful' : 'Payment failed',
  };
};

// Calculate refund percentage based on cancellation time
const calculateRefundPercentage = (bookingDate, departureDatetime) => {
  const now = new Date();
  const hoursBeforeDeparture = (departureDatetime - now) / (1000 * 60 * 60);
  
  if (hoursBeforeDeparture >= 24) return 100; // Full refund if cancelled 24+ hrs before
  if (hoursBeforeDeparture >= 6) return 75; // 75% refund if cancelled 6-24 hrs before
  if (hoursBeforeDeparture >= 2) return 50; // 50% refund if cancelled 2-6 hrs before
  return 0; // No refund if cancelled less than 2 hours before
};

module.exports = {
  generatePNR,
  generateSeatNumber,
  simulatePayment,
  calculateRefundPercentage,
};
