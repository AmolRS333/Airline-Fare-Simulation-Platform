const nodemailer = require('nodemailer');

// Using Brevo (formerly Sendinblue) for email notifications
const sendEmail = async (email, subject, htmlContent) => {
  try {
    // Create transporter using Brevo SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_EMAIL,
        pass: process.env.BREVO_API_KEY,
      },
    });

    const mailOptions = {
      from: process.env.BREVO_EMAIL,
      to: email,
      subject,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    // In development, we can simulate success
    if (process.env.NODE_ENV === 'development') {
      console.log('(DEV MODE) Email simulated as sent');
      return { messageId: 'simulated-' + Date.now() };
    }
    throw error;
  }
};

const sendBookingConfirmationEmail = async (email, bookingDetails, pnr) => {
  const htmlContent = `
    <h2>Booking Confirmation</h2>
    <p>Dear ${bookingDetails.passengerName},</p>
    <p>Your flight booking has been confirmed!</p>
    <p><strong>PNR: ${pnr}</strong></p>
    <p>Flight: ${bookingDetails.flightNumber}</p>
    <p>From: ${bookingDetails.origin} To: ${bookingDetails.destination}</p>
    <p>Departure: ${bookingDetails.departureTime}</p>
    <p>Seats: ${bookingDetails.seats.join(', ')}</p>
    <p>Total Amount: $${bookingDetails.totalAmount}</p>
    <p>Thank you for booking with us!</p>
  `;
  return await sendEmail(email, `Booking Confirmation - PNR ${pnr}`, htmlContent);
};

const sendCancellationEmail = async (email, cancellationDetails) => {
  const htmlContent = `
    <h2>Booking Cancellation Confirmation</h2>
    <p>Dear ${cancellationDetails.passengerName},</p>
    <p>Your booking has been successfully cancelled.</p>
    <p><strong>PNR: ${cancellationDetails.pnr}</strong></p>
    <p>Refund Amount: $${cancellationDetails.refundAmount}</p>
    <p>The refund will be processed to your original payment method within 5-7 business days.</p>
    <p>Thank you!</p>
  `;
  return await sendEmail(email, `Cancellation Confirmation - PNR ${cancellationDetails.pnr}`, htmlContent);
};

const sendFlightReminderEmail = async (email, flightDetails) => {
  const htmlContent = `
    <h2>Flight Reminder</h2>
    <p>Dear ${flightDetails.passengerName},</p>
    <p>This is a reminder for your upcoming flight.</p>
    <p>Flight: ${flightDetails.flightNumber}</p>
    <p>From: ${flightDetails.origin} To: ${flightDetails.destination}</p>
    <p>Departure: ${flightDetails.departureTime}</p>
    <p>Please arrive at the airport at least 3 hours before departure.</p>
    <p>Safe travels!</p>
  `;
  return await sendEmail(email, `Flight Reminder - ${flightDetails.flightNumber}`, htmlContent);
};

module.exports = {
  sendEmail,
  sendBookingConfirmationEmail,
  sendCancellationEmail,
  sendFlightReminderEmail,
};
