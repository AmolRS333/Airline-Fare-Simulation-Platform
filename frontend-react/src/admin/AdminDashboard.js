import React, { useState, useEffect } from 'react';
import { adminService } from '../services';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [bookingAnalytics, setBookingAnalytics] = useState(null);
  const [pricingAnalytics, setPricingAnalytics] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [analytics, booking, pricing, revenue] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getBookingAnalytics(),
        adminService.getPricingAnalytics(),
        adminService.getRevenueAnalytics(),
      ]);

      setAnalytics(analytics.data);
      setBookingAnalytics(booking.data);
      setPricingAnalytics(pricing.data);
      setRevenueAnalytics(revenue.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading analytics...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-blue-600">{analytics?.totalUsers}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Total Bookings</p>
            <p className="text-3xl font-bold text-green-600">{analytics?.totalBookings}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold text-purple-600">${analytics?.totalRevenue?.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Cancellation Rate</p>
            <p className="text-3xl font-bold text-red-600">{bookingAnalytics?.cancellationRate}%</p>
          </div>
        </div>

        {/* Charts */}
        {revenueAnalytics?.dailyRevenue && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Daily Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueAnalytics.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {pricingAnalytics?.pricingTrend && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Pricing Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pricingAnalytics.pricingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgPrice" stroke="#82ca9d" name="Avg Price" />
                <Line type="monotone" dataKey="avgMultiplier" stroke="#ffc658" name="Avg Multiplier" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {pricingAnalytics?.peakBookingHours && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Peak Booking Hours</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pricingAnalytics.peakBookingHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
