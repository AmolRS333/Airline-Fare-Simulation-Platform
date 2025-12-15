import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import FlightSearch from './pages/FlightSearch';
import BookingFlow from './pages/BookingFlow';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';

// Admin
import AdminDashboard from './admin/AdminDashboard';
import ManageFlights from './admin/ManageFlights';

// Components
import Navigation from './components/Navigation';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/search" />;
  }

  return children;
};

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg">Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected User Routes */}
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <FlightSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <BookingFlow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/flights"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageFlights />
              </ProtectedRoute>
            }
          />

          {/* Default Route - Force login if not authenticated */}
          <Route path="/" element={user ? <Navigate to="/search" /> : <Navigate to="/login" />} />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to={user ? "/search" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
