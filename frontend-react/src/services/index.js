import apiClient from './apiClient';

export const authService = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  changePassword: (data) => apiClient.post('/auth/change-password', data),
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
  createBooking: (flightId, seatNumbers, passengers, seatClass = 'economy') =>
    apiClient.post('/bookings', { flightId, seatNumbers, passengers, seatClass }),
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
  // FLIGHT MANAGEMENT
  getAllFlights: () => apiClient.get('/admin/flights'),
  createFlight: (flightData) => apiClient.post('/flights', flightData),
  updateFlight: (flightId, flightData) => apiClient.put(`/flights/${flightId}`, flightData),
  deleteFlight: (flightId) => apiClient.delete(`/flights/${flightId}`),
  getFlightDetails: (flightId) => apiClient.get(`/flights/${flightId}`),

  // SEAT MANAGEMENT
  getSeatMap: (flightId) => apiClient.get(`/admin/flights/${flightId}/seats`),
  updateSeatStatus: (flightId, seat, status) => apiClient.put(`/admin/flights/${flightId}/seats/${seat}`, { status }),
  getBookedSeats: (flightId) => apiClient.get(`/admin/flights/${flightId}/booked-seats`),

  // BOOKING MANAGEMENT
  getAllBookings: () => apiClient.get('/admin/bookings'),
  getBookingDetails: (bookingId) => apiClient.get(`/admin/bookings/${bookingId}`),
  confirmBooking: (bookingId) => apiClient.put(`/admin/bookings/${bookingId}/confirm`, {}),
  cancelBooking: (bookingId, reason) => apiClient.delete(`/admin/bookings/${bookingId}`, { data: { reason } }),
  refundBooking: (bookingId, refundPercentage) => apiClient.post(`/admin/bookings/${bookingId}/refund`, { refundPercentage }),
  getBookingsByFlight: (flightId) => apiClient.get(`/admin/flights/${flightId}/bookings`),

  // USER MANAGEMENT
  getAllUsers: () => apiClient.get('/admin/users'),
  getUserDetails: (userId) => apiClient.get(`/admin/users/${userId}`),
  blockUser: (userId) => apiClient.put(`/admin/users/${userId}/block`, {}),
  unblockUser: (userId) => apiClient.put(`/admin/users/${userId}/unblock`, {}),
  resetUserPassword: (userId) => apiClient.post(`/admin/users/${userId}/reset-password`, {}),
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),

  // REPORTS & ANALYTICS
  getDashboardStats: () => apiClient.get('/admin/reports/dashboard'),
  getBookingReport: () => apiClient.get('/admin/reports/bookings'),
  getRevenueReport: () => apiClient.get('/admin/reports/revenue'),
  getFlightOccupancyReport: () => apiClient.get('/admin/reports/occupancy'),
  getClassWiseReport: () => apiClient.get('/admin/reports/class-wise'),
  getTrendReport: (days) => apiClient.get('/admin/reports/trends', { params: { days } }),

  // SYSTEM HEALTH
  getSystemHealth: () => apiClient.get('/admin/health'),
  getBackendStatus: () => apiClient.get('/admin/health/backend'),
  getPythonPricingStatus: () => apiClient.get('/admin/health/python'),
  getDatabaseStatus: () => apiClient.get('/admin/health/database'),

  // PRICING CONTROL
  getPricingRules: () => apiClient.get('/admin/pricing-rules'),
  updatePricingRules: (rules) => apiClient.put('/admin/pricing-rules', rules),
  getPriceHistory: () => apiClient.get('/admin/pricing/history'),
  getPriceChangeLog: () => apiClient.get('/admin/pricing/changelog'),

  // EMAIL & NOTIFICATIONS
  getEmailTemplates: () => apiClient.get('/admin/email-templates'),
  updateEmailTemplate: (templateId, data) => apiClient.put(`/admin/email-templates/${templateId}`, data),
  sendNotification: (templateId, data) => apiClient.post(`/admin/notifications/send`, { templateId, ...data }),
  broadcastNotification: (data) => apiClient.post('/admin/notifications/broadcast', data),

  // PDF TEMPLATES
  getPDFTemplates: () => apiClient.get('/admin/pdf-templates'),
  updatePDFTemplate: (data) => apiClient.put('/admin/pdf-templates', data),

  // Legacy methods for backward compatibility
  getAnalytics: () => apiClient.get('/admin/analytics'),
  getBookingAnalytics: () => apiClient.get('/admin/analytics/bookings'),
  getPricingAnalytics: () => apiClient.get('/admin/analytics/pricing'),
  getRevenueAnalytics: () => apiClient.get('/admin/analytics/revenue'),
  updateUserRole: (userId, role) => apiClient.put(`/admin/users/${userId}/role`, { role }),
};
