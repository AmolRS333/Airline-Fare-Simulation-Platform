import React, { useState, useEffect } from 'react';
import { adminService } from '../services';
import { formatDate } from '../utils/dateTime';

const ReportsDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [bookingReport, setBookingReport] = useState(null);
  const [revenueReport, setRevenueReport] = useState(null);
  const [occupancyReport, setOccupancyReport] = useState(null);
  const [classReport, setClassReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState('dashboard');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [dashboard, booking, revenue, occupancy, classData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getBookingReport(),
        adminService.getRevenueReport(),
        adminService.getFlightOccupancyReport(),
        adminService.getClassWiseReport()
      ]);

      setDashboardStats(dashboard.data);
      setBookingReport(booking.data);
      setRevenueReport(revenue.data);
      setOccupancyReport(occupancy.data);
      setClassReport(classData.data);
      setError('');
    } catch (err) {
      setError('Failed to load reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (data, filename) => {
    // Simple CSV generation without Papa
    const csvContent = Array.isArray(data) ? 
      JSON.stringify(data, null, 2) : 
      JSON.stringify([data], null, 2);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Reports & Analytics</h1>
        <div className="flex gap-2 flex-wrap">
          {['dashboard', 'booking', 'revenue', 'occupancy', 'class'].map(report => (
            <button
              key={report}
              onClick={() => setSelectedReport(report)}
              className={`px-4 py-2 rounded font-semibold capitalize transition ${
                selectedReport === report
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {report}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-8">Loading reports...</div>
      ) : (
        <>
          {selectedReport === 'dashboard' && dashboardStats && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-6 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Total Bookings</p>
                <p className="text-4xl font-bold text-blue-600">{dashboardStats.totalBookings}</p>
                <p className="text-xs text-gray-500 mt-2">This Month</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-4xl font-bold text-green-600">${dashboardStats.totalRevenue?.toFixed(0)}</p>
                <p className="text-xs text-gray-500 mt-2">This Month</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Avg Occupancy</p>
                <p className="text-4xl font-bold text-purple-600">{dashboardStats.avgOccupancy?.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-2">All Flights</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Active Users</p>
                <p className="text-4xl font-bold text-orange-600">{dashboardStats.activeUsers}</p>
                <p className="text-xs text-gray-500 mt-2">Registered</p>
              </div>
            </div>
          )}

          {selectedReport === 'booking' && bookingReport && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Booking Report</h2>
                <button
                  onClick={() => downloadCSV(bookingReport.bookingsByStatus, 'booking-report.csv')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Download CSV
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {Object.entries(bookingReport.bookingsByStatus || {}).map(([status, count]) => (
                  <div key={status} className="bg-gray-50 p-4 rounded">
                    <p className="text-gray-600 text-sm capitalize">{status}</p>
                    <p className="text-3xl font-bold text-gray-800">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedReport === 'revenue' && revenueReport && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Revenue Report</h2>
                <button
                  onClick={() => downloadCSV([revenueReport], 'revenue-report.csv')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Download CSV
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">${revenueReport.totalRevenue?.toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Avg Booking Value</p>
                  <p className="text-3xl font-bold text-blue-600">${revenueReport.avgBookingValue?.toFixed(2)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Refunded Amount</p>
                  <p className="text-3xl font-bold text-purple-600">${revenueReport.refundedAmount?.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'occupancy' && occupancyReport && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Flight Occupancy Report</h2>
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Average Occupancy</p>
                  <p className="text-3xl font-bold text-gray-800">{occupancyReport.avgOccupancy?.toFixed(1)}%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Total Seats Booked</p>
                  <p className="text-3xl font-bold text-gray-800">{occupancyReport.totalSeatsBooked}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Flight</th>
                      <th className="px-4 py-2 text-left">Seats Booked</th>
                      <th className="px-4 py-2 text-left">Total Seats</th>
                      <th className="px-4 py-2 text-left">Occupancy %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {occupancyReport.byFlight?.slice(0, 10).map((flight, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-4 py-2">{flight.flightNumber}</td>
                        <td className="px-4 py-2">{flight.seatsBooked}</td>
                        <td className="px-4 py-2">{flight.totalSeats}</td>
                        <td className="px-4 py-2">
                          <div className="w-full bg-gray-200 rounded h-4 overflow-hidden">
                            <div
                              className="bg-green-500 h-full"
                              style={{ width: `${flight.occupancy}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold">{flight.occupancy.toFixed(1)}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedReport === 'class' && classReport && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Class-wise Booking Report</h2>
              <div className="grid grid-cols-3 gap-4">
                {classReport.byClass?.map((cls, i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded">
                    <p className="text-gray-600 text-sm capitalize">{cls.class}</p>
                    <p className="text-3xl font-bold text-gray-800">{cls.bookings}</p>
                    <p className="text-xs text-gray-500 mt-2">{cls.percentage?.toFixed(1)}% of total</p>
                    <p className="text-xs text-gray-500 mt-1">Revenue: ${cls.revenue?.toFixed(0)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsDashboard;
