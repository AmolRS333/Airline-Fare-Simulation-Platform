import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, bookingService } from '../services';
import { AuthContext } from '../context/AuthContext';
import { formatDate } from '../utils/dateTime';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  
  const [profile, setProfile] = useState(null);
  const [bookingStats, setBookingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      setProfile(response.data.user);
      setBookingStats(response.data.bookingStats);
      
      // Initialize form with user data
      setFormData({
        name: response.data.user.name || '',
        phone: response.data.user.phone || '',
        address: response.data.user.address || '',
        city: response.data.user.city || '',
        state: response.data.user.state || '',
        zipCode: response.data.user.zipCode || '',
        country: response.data.user.country || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
      console.error('Profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setMessage('');
      await authService.updateProfile(formData);
      setMessage('Profile updated successfully');
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setMessage('');

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        return;
      }

      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setMessage('Password changed successfully');
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and booking history</p>
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2">
            {/* User Info Card */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Account Information</h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-semibold">Name:</span>
                    <span>{profile?.name || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Email:</span>
                    <span>{profile?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Role:</span>
                    <span className={`px-3 py-1 rounded text-white text-sm font-semibold ${
                      profile?.role === 'admin' ? 'bg-red-600' : 'bg-green-600'
                    }`}>
                      {profile?.role?.toUpperCase() || 'CUSTOMER'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Phone:</span>
                    <span>{profile?.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">City:</span>
                    <span>{profile?.city || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Country:</span>
                    <span>{profile?.country || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-gray-300">
                    <span className="font-semibold">Member Since:</span>
                    <span>{formatDate(profile?.createdAt)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Password Change Card */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Security</h2>
                {!showPasswordForm && (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
                  >
                    Change Password
                  </button>
                )}
              </div>

              {showPasswordForm ? (
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
                    >
                      Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-gray-600">Keep your account secure by regularly changing your password.</p>
              )}
            </div>
          </div>

          {/* Booking Stats Sidebar */}
          <div className="lg:col-span-1">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Booking Statistics</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-blue-600">{bookingStats?.totalBookings || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-green-600">{bookingStats?.confirmedBookings || 0}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{bookingStats?.pendingBookings || 0}</p>
                </div>
                <div className="bg-red-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{bookingStats?.cancelledBookings || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded border-2 border-purple-200">
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-purple-600">${bookingStats?.totalSpent?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/bookings')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
                >
                  View Bookings
                </button>
                <button
                  onClick={() => navigate('/search')}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700"
                >
                  Search Flights
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
