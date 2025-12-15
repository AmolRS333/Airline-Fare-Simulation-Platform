const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const generateBookingReceipt = async (booking, flight, user, airline, originAirport, destAirport) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { height } = page.getSize();
  let yPos = height - 50;

  const drawText = (text, size = 12, color = rgb(0, 0, 0)) => {
    page.drawText(text, {
      x: 50,
      y: yPos,
      size,
      color,
    });
    yPos -= size + 10;
  };

  // Header
  drawText('FLIGHT BOOKING RECEIPT', 16, rgb(0, 0.2, 0.4));
  yPos -= 10;

  // PNR and confirmation
  drawText(`PNR: ${booking.pnr}`, 14, rgb(0, 0.4, 0));
  drawText(`Confirmation #: ${booking._id}`, 11);
  drawText(`Booking Date: ${new Date(booking.createdAt).toLocaleString()}`, 11);
  yPos -= 10;

  // Flight details
  drawText('FLIGHT DETAILS', 14, rgb(0, 0.2, 0.4));
  drawText(`Flight: ${airline.code}${flight.flightNumber}`, 11);
  drawText(`From: ${originAirport.iata} (${originAirport.name})`, 11);
  drawText(`To: ${destAirport.iata} (${destAirport.name})`, 11);
  drawText(`Date: ${new Date(flight.departureTime).toLocaleDateString()}`, 11);
  drawText(`Departure: ${new Date(flight.departureTime).toLocaleTimeString()}`, 11);
  drawText(`Arrival: ${new Date(flight.arrivalTime).toLocaleTimeString()}`, 11);
  yPos -= 10;

  // Passenger details
  drawText('PASSENGER DETAILS', 14, rgb(0, 0.2, 0.4));
  booking.passengers.forEach((passenger, index) => {
    drawText(`Passenger ${index + 1}: ${passenger.name}`, 11);
    drawText(`Email: ${passenger.email}`, 11);
    drawText(`Phone: ${passenger.phone}`, 11);
  });
  yPos -= 10;

  // Seat details
  drawText('SEAT ASSIGNMENT', 14, rgb(0, 0.2, 0.4));
  drawText(`Seats: ${booking.seatNumbers.join(', ')}`, 11);
  yPos -= 10;

  // Price breakdown
  drawText('PRICE BREAKDOWN', 14, rgb(0, 0.2, 0.4));
  const pricePerSeat = booking.pricePaid / booking.seatNumbers.length;
  drawText(`Base Fare per Seat: $${booking.baseFarePerSeat || flight.baseFare}`, 11);
  drawText(`Number of Seats: ${booking.seatNumbers.length}`, 11);
  if (booking.dynamicPricingApplied) {
    drawText(`Dynamic Pricing Applied: Yes`, 11);
  }
  drawText(`Total Amount Paid: $${booking.pricePaid.toFixed(2)}`, 12, rgb(0, 0.4, 0));
  yPos -= 10;

  // Status
  drawText('BOOKING STATUS', 14, rgb(0, 0.2, 0.4));
  drawText(`Status: ${booking.status.toUpperCase()}`, 11);
  drawText(`Payment Status: ${booking.paymentStatus.toUpperCase()}`, 11);
  yPos -= 10;

  // Footer
  drawText('Thank you for booking with us!', 11);
  drawText('For cancellations or modifications, visit our website or contact customer service.', 10);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

const saveReceiptToFile = async (booking, flight, user, airline, originAirport, destAirport) => {
  const pdfBytes = await generateBookingReceipt(booking, flight, user, airline, originAirport, destAirport);
  const fileName = `receipt_${booking.pnr}_${Date.now()}.pdf`;
  const filePath = path.join(process.cwd(), 'receipts', fileName);

  // Create receipts directory if it doesn't exist
  if (!fs.existsSync(path.join(process.cwd(), 'receipts'))) {
    fs.mkdirSync(path.join(process.cwd(), 'receipts'), { recursive: true });
  }

  fs.writeFileSync(filePath, pdfBytes);
  return filePath;
};

module.exports = {
  generateBookingReceipt,
  saveReceiptToFile,
};
