// Backend authentication test example
const request = require('supertest');
const app = require('../server');

describe('Authentication Tests', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user.email).toBe('test@example.com');
  });

  it('should login with correct credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'TestPassword123',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
  });

  it('should fail login with wrong password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPassword',
      });

    expect(response.status).toBe(401);
  });
});

// Flight search test example
describe('Flight Search Tests', () => {
  it('should search flights successfully', async () => {
    const response = await request(app)
      .get('/api/flights/search')
      .query({
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '2024-12-15',
      });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should filter flights by price', async () => {
    const response = await request(app)
      .get('/api/flights/search')
      .query({
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '2024-12-15',
        filterPrice: '300',
      });

    expect(response.status).toBe(200);
    response.body.forEach((flight) => {
      expect(flight.currentDynamicPrice).toBeLessThanOrEqual(300);
    });
  });
});

// Booking test example
describe('Booking Tests', () => {
  it('should create a booking', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        flightId: 'flight_id',
        seatNumbers: ['1A', '1B'],
        passengers: [
          {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            dateOfBirth: '1990-01-01',
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.booking).toHaveProperty('pnr');
  });

  it('should cancel a booking', async () => {
    const response = await request(app)
      .delete(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('refundAmount');
  });
});
