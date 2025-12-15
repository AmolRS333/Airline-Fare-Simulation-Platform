import React, { useState, useEffect } from 'react';
import { adminService } from '../services';
import { formatDate } from '../utils/dateTime';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers();
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await adminService.blockUser(userId);
      setSuccess('User blocked');
      fetchUsers();
    } catch (err) {
      setError('Failed to block user');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await adminService.unblockUser(userId);
      setSuccess('User unblocked');
      fetchUsers();
    } catch (err) {
      setError('Failed to unblock user');
    }
  };

  const handleResetPassword = async (userId, email) => {
    try {
      await adminService.resetUserPassword(userId);
      setSuccess(`Password reset email sent to ${email}`);
      setResetPasswordEmail('');
    } catch (err) {
      setError('Failed to reset password');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      try {
        await adminService.deleteUser(userId);
        setSuccess('User deleted');
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const customerCount = users.filter(u => u.role === 'customer').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const blockedCount = users.filter(u => u.isBlocked).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">User Management</h1>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Customers</p>
            <p className="text-3xl font-bold text-green-600">{customerCount}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Admins</p>
            <p className="text-3xl font-bold text-purple-600">{adminCount}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Blocked</p>
            <p className="text-3xl font-bold text-red-600">{blockedCount}</p>
          </div>
        </div>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}
      {success && <div className="p-4 bg-green-100 text-green-700 rounded mb-4">{success}</div>}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Loading users...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.phone || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      View
                    </button>
                    {user.isBlocked ? (
                      <button
                        onClick={() => handleUnblockUser(user._id)}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                      >
                        Unblock
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBlockUser(user._id)}
                        className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                      >
                        Block
                      </button>
                    )}
                    <button
                      onClick={() => handleResetPassword(user._id, user.email)}
                      className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                    >
                      Reset Pass
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Name</p>
                  <p className="font-bold text-lg">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Email</p>
                  <p className="font-bold">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Phone</p>
                  <p className="font-bold">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Role</p>
                  <p className="font-bold capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Status</p>
                  <p className={`font-bold text-lg ${selectedUser.isBlocked ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedUser.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Joined</p>
                  <p className="font-bold">{formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-bold mb-2">Account Information</h3>
                <p className="text-sm text-gray-600">User ID: {selectedUser._id}</p>
                <p className="text-sm text-gray-600">Last Updated: {formatDate(selectedUser.updatedAt)}</p>
              </div>

              <div className="flex gap-2 pt-4">
                {selectedUser.isBlocked ? (
                  <button
                    onClick={() => {
                      handleUnblockUser(selectedUser._id);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Unblock User
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleBlockUser(selectedUser._id);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    Block User
                  </button>
                )}
                <button
                  onClick={() => {
                    handleResetPassword(selectedUser._id, selectedUser.email);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Reset Password
                </button>
                <button
                  onClick={() => {
                    handleDeleteUser(selectedUser._id);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
