import apiClient from './apiClient';

export const authService = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
};

export const flightService = {
  searchFlights: (origin, destination, departureDate, sortBy, filterPrice) =>
    apiClient.get('/flights/search', {
      params: { origin, destination, departureDate, sortBy, filterPrice },
    }),
  getFlightById: (id) => apiClient.get(`/flights/${id}`),
  getFareHistory: (id) => apiClient.get(`/flights/${id}/fare-history`),
};

export const bookingService = {
  selectSeats: (flightId, seatNumbers) =>
    apiClient.post('/bookings/select-seats', { flightId, seatNumbers }),
  createBooking: (flightId, seatNumbers, passengers) =>
    apiClient.post('/bookings', { flightId, seatNumbers, passengers }),
  getBookings: () => apiClient.get('/bookings'),
  getBookingByPNR: (pnr) => apiClient.get(`/bookings/pnr/${pnr}`),
  cancelBooking: (bookingId) => apiClient.delete(`/bookings/${bookingId}`),
};

export const airportService = {
  getAirports: (search) => apiClient.get('/airports', { params: { search } }),
  getAirportById: (id) => apiClient.get(`/airports/${id}`),
};

export const airlineService = {
  getAirlines: (search) => apiClient.get('/airlines', { params: { search } }),
  getAirlineById: (id) => apiClient.get(`/airlines/${id}`),
};

export const adminService = {
  getAllUsers: (role, search) =>
    apiClient.get('/admin/users', { params: { role, search } }),
  updateUserRole: (userId, role) =>
    apiClient.put(`/admin/users/${userId}/role`, { role }),
  getAnalytics: () => apiClient.get('/admin/analytics'),
  getBookingAnalytics: () => apiClient.get('/admin/analytics/bookings'),
  getPricingAnalytics: () => apiClient.get('/admin/analytics/pricing'),
  getRevenueAnalytics: () => apiClient.get('/admin/analytics/revenue'),
  getAllBookings: (status, flightId) =>
    apiClient.get('/admin/bookings', { params: { status, flightId } }),
};
