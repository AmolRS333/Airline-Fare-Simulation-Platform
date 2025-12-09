import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          ✈️ Flight Booking
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link to="/search" className="hover:text-blue-100">
                Search
              </Link>
              <Link to="/bookings" className="hover:text-blue-100">
                My Bookings
              </Link>

              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="hover:text-blue-100">
                    Admin Dashboard
                  </Link>
                  <Link to="/admin/flights" className="hover:text-blue-100">
                    Manage Flights
                  </Link>
                </>
              )}

              <div className="flex items-center gap-4">
                <span>{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-100">
                Login
              </Link>
              <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
