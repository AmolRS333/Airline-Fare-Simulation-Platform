import React, { useState, useEffect } from 'react';
import { adminService } from '../services/index';
import FlightManagement from './FlightManagement';
import SeatManagement from './SeatManagement';
import BookingManagement from './BookingManagement';
import UserManagement from './UserManagement';
import ReportsDashboard from './ReportsDashboard';
import HealthMonitor from './HealthMonitor';
import PricingControl from './PricingControl';
import EmailNotificationManager from './EmailNotificationManager';
import PDFTemplateEditor from './PDFTemplateEditor';

const AdminDashboard = () => {
  const [activePanel, setActivePanel] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const panels = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'flights', label: 'Flights', icon: '✈' },
    { id: 'seats', label: 'Seats', icon: '🛫' },
    { id: 'bookings', label: 'Bookings', icon: '📅' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'health', label: 'Health', icon: '🏥' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'pdf', label: 'PDF', icon: '📄' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <div className="bg-white shadow sticky top-0 z-40">
        <div className="px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-2">
              {panels.map(panel => (
                <button
                  key={panel.id}
                  onClick={() => setActivePanel(panel.id)}
                  className={`px-4 py-2 rounded font-semibold whitespace-nowrap transition ${
                    activePanel === panel.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {panel.icon} {panel.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {loading && activePanel === 'overview' ? (
          <div className="p-6 text-center">Loading dashboard...</div>
        ) : activePanel === 'overview' ? (
          <div className="p-6">
            {stats && (
              <>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm">Total Users</p>
                    <p className="text-4xl font-bold text-blue-600">{stats.activeUsers || 0}</p>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm">Total Bookings</p>
                    <p className="text-4xl font-bold text-green-600">{stats.totalBookings || 0}</p>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm">Total Revenue</p>
                    <p className="text-4xl font-bold text-purple-600">${(stats.totalRevenue || 0).toFixed(0)}</p>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm">Avg Occupancy</p>
                    <p className="text-4xl font-bold text-orange-600">{(stats.avgOccupancy || 0).toFixed(1)}%</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-4">Quick Access</h2>
                  <p className="text-gray-600 mb-4">Select a panel from the navigation above to manage the system.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                      <p className="font-bold text-blue-900">Flight Management</p>
                      <p className="text-sm text-blue-700 mt-1">Add, edit, delete flights</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                      <p className="font-bold text-green-900">Booking Management</p>
                      <p className="text-sm text-green-700 mt-1">Manage all bookings</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                      <p className="font-bold text-purple-900">User Management</p>
                      <p className="text-sm text-purple-700 mt-1">Control user accounts</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600">
                      <p className="font-bold text-orange-900">Reports & Analytics</p>
                      <p className="text-sm text-orange-700 mt-1">View detailed reports</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : activePanel === 'flights' ? (
          <FlightManagement />
        ) : activePanel === 'seats' ? (
          <SeatManagement />
        ) : activePanel === 'bookings' ? (
          <BookingManagement />
        ) : activePanel === 'users' ? (
          <UserManagement />
        ) : activePanel === 'reports' ? (
          <ReportsDashboard />
        ) : activePanel === 'health' ? (
          <HealthMonitor />
        ) : activePanel === 'pricing' ? (
          <PricingControl />
        ) : activePanel === 'email' ? (
          <EmailNotificationManager />
        ) : activePanel === 'pdf' ? (
          <PDFTemplateEditor />
        ) : null}
      </div>
    </div>
  );
};

export default AdminDashboard;
