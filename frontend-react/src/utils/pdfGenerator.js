import { PDFDocument, rgb } from 'pdf-lib';

export const generatePDF = async (booking, flight, airline, originAirport, destAirport) => {
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

  drawText(`PNR: ${booking.pnr}`, 14, rgb(0, 0.4, 0));
  drawText(`Confirmation #: ${booking.id}`, 11);
  drawText(`Booking Date: ${new Date(booking.createdAt).toLocaleString()}`, 11);
  yPos -= 10;

  drawText('FLIGHT DETAILS', 14, rgb(0, 0.2, 0.4));
  drawText(`Flight: ${airline?.code}${flight?.flightNumber}`, 11);
  drawText(`From: ${originAirport?.iata} (${originAirport?.name})`, 11);
  drawText(`To: ${destAirport?.iata} (${destAirport?.name})`, 11);
  drawText(`Date: ${new Date(flight?.departureTime).toLocaleDateString()}`, 11);
  drawText(`Departure: ${new Date(flight?.departureTime).toLocaleTimeString()}`, 11);
  drawText(`Arrival: ${new Date(flight?.arrivalTime).toLocaleTimeString()}`, 11);
  yPos -= 10;

  drawText('PASSENGER DETAILS', 14, rgb(0, 0.2, 0.4));
  booking.passengers?.forEach((passenger, index) => {
    drawText(`Passenger ${index + 1}: ${passenger.name}`, 11);
    drawText(`Email: ${passenger.email}`, 11);
  });
  yPos -= 10;

  drawText('SEAT ASSIGNMENT', 14, rgb(0, 0.2, 0.4));
  drawText(`Seats: ${booking.seatNumbers?.join(', ')}`, 11);
  yPos -= 10;

  drawText('PRICING', 14, rgb(0, 0.2, 0.4));
  drawText(`Total Amount Paid: $${booking.pricePaid?.toFixed(2)}`, 12, rgb(0, 0.4, 0));

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `receipt_${booking.pnr}.pdf`;
  link.click();
};

// Enhanced ticket PDF generator for booking confirmations
export const generateTicketPDF = async (booking, flight) => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Standard letter size
    const { width, height } = page.getSize();
    let yPos = height - 40;

    const drawText = (text, size = 12, color = rgb(0, 0, 0), x = 40) => {
      page.drawText(text, {
        x,
        y: yPos,
        size,
        color,
      });
      yPos -= size + 8;
    };

    const drawLine = (yOffset = 0) => {
      page.drawLine({
        start: { x: 40, y: yPos - yOffset },
        end: { x: width - 40, y: yPos - yOffset },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.7),
      });
      yPos -= 15;
    };

    // Header - Airline Logo Area
    drawText('FLIGHT BOOKING CONFIRMATION', 18, rgb(0, 0.2, 0.4));
    yPos -= 5;
    drawLine();

    // PNR - Most Important
    page.drawRectangle({
      x: 40,
      y: yPos - 30,
      width: width - 80,
      height: 40,
      borderColor: rgb(0, 0.4, 0),
      borderWidth: 2,
      color: rgb(0.86, 1, 0.86),
    });
    drawText(`BOOKING REFERENCE: ${booking.pnr}`, 16, rgb(0, 0.4, 0), 50);
    yPos -= 35;

    // Flight Information
    drawText('FLIGHT INFORMATION', 12, rgb(0, 0.2, 0.4));
    drawLine(5);

    const flightInfo = `${flight.airline?.code || 'XX'} ${flight.flightNumber || 'XXXX'}`;
    const dateStr = new Date(flight.departureTime).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = new Date(flight.departureTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    page.drawRectangle({
      x: 40,
      y: yPos - 80,
      width: width - 80,
      height: 80,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    });

    drawText(`Flight Number: ${flightInfo}`, 11, rgb(0, 0, 0), 50);
    drawText(`Date: ${dateStr}`, 11, rgb(0, 0, 0), 50);
    drawText(`Departure: ${timeStr} from ${flight.origin?.iata || 'XXX'}`, 11, rgb(0, 0, 0), 50);
    drawText(`Arrival: ${flight.destination?.city || 'Destination'} (${flight.destination?.iata || 'XXX'})`, 11, rgb(0, 0, 0), 50);

    yPos -= 10;
    drawLine();

    // Passenger Details
    drawText('PASSENGER DETAILS', 12, rgb(0, 0.2, 0.4));
    drawLine(5);

    booking.passengers?.forEach((passenger, index) => {
      drawText(
        `Passenger ${index + 1}: ${passenger.title} ${passenger.name}`,
        11,
        rgb(0, 0, 0),
        50
      );
      drawText(`Seat: ${booking.seatNumbers?.[index] || 'TBD'}`, 10, rgb(0.2, 0.2, 0.2), 60);
      if (index < booking.passengers.length - 1) {
        yPos -= 5;
      }
    });

    yPos -= 10;
    drawLine();

    // Booking Summary
    drawText('BOOKING SUMMARY', 12, rgb(0, 0.2, 0.4));
    drawLine(5);

    drawText(`Total Passengers: ${booking.passengers?.length || 0}`, 11, rgb(0, 0, 0), 50);
    drawText(`Seats: ${booking.seatNumbers?.join(', ') || 'N/A'}`, 11, rgb(0, 0, 0), 50);
    drawText(`Base Fare: $${(flight.baseFare || 0).toFixed(2)}`, 11, rgb(0, 0, 0), 50);

    page.drawRectangle({
      x: 40,
      y: yPos - 25,
      width: width - 80,
      height: 25,
      color: rgb(0.94, 0.94, 0.94),
      borderColor: rgb(0, 0.2, 0.4),
      borderWidth: 2,
    });

    drawText(`TOTAL PAID: $${booking.pricePaid?.toFixed(2) || '0.00'}`, 14, rgb(0, 0.4, 0), 50);
    yPos -= 15;

    // Footer
    drawLine();
    drawText('Booking Status: CONFIRMED', 10, rgb(0, 0.4, 0), 50);
    drawText(
      `Confirmation Date: ${new Date(booking.createdAt).toLocaleString()}`,
      10,
      rgb(0.2, 0.2, 0.2),
      50
    );
    drawText('Thank you for your booking! Have a great flight!', 10, rgb(0.4, 0.4, 0.4), 50);

    // Generate and download PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket_${booking.pnr}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating ticket PDF. Please try again.');
  }
};
