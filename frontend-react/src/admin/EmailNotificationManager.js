import React, { useState, useEffect } from 'react';
import { adminService } from '../services';

const EmailNotificationManager = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [broadcastData, setBroadcastData] = useState({
    subject: '',
    message: '',
    recipients: 'all'
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await adminService.getEmailTemplates();
      setTemplates(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedTemplate(response.data[0]);
      }
      setError('');
    } catch (err) {
      setError('Failed to load email templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateEmailTemplate(selectedTemplate._id, {
        subject: selectedTemplate.subject,
        body: selectedTemplate.body,
        variables: selectedTemplate.variables
      });
      setSuccess('Template updated successfully');
      setEditMode(false);
      fetchTemplates();
    } catch (err) {
      setError('Failed to update template');
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      await adminService.broadcastNotification(broadcastData);
      setSuccess('Notification sent to all recipients');
      setBroadcastData({ subject: '', message: '', recipients: 'all' });
    } catch (err) {
      setError('Failed to send notification');
    }
  };

  const handleSendTest = async () => {
    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }
    try {
      await adminService.sendNotification(selectedTemplate._id, {
        email: 'test@example.com'
      });
      setSuccess('Test email sent successfully');
    } catch (err) {
      setError('Failed to send test email');
    }
  };

  const variables = {
    'booking_confirmation': ['{{name}}', '{{pnr}}', '{{flightNumber}}', '{{date}}', '{{time}}', '{{origin}}', '{{destination}}'],
    'cancellation': ['{{name}}', '{{pnr}}', '{{refundAmount}}', '{{refundDate}}'],
    'reminder': ['{{name}}', '{{flightNumber}}', '{{departureTime}}', '{{origin}}', '{{destination}}']
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Email & Notification Manager</h1>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}
      {success && <div className="p-4 bg-green-100 text-green-700 rounded mb-4">{success}</div>}

      {loading ? (
        <div className="text-center py-8">Loading templates...</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Templates List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Email Templates</h2>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template._id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setEditMode(false);
                  }}
                  className={`w-full px-4 py-3 rounded text-left font-semibold transition ${
                    selectedTemplate?._id === template._id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* Template Editor */}
          <div className="col-span-2 bg-white rounded-lg shadow p-6">
            {selectedTemplate ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold capitalize">{selectedTemplate.name}</h2>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className={`px-4 py-2 rounded font-semibold ${
                      editMode
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {editMode ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {editMode ? (
                  <form onSubmit={handleUpdateTemplate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Subject</label>
                      <input
                        type="text"
                        value={selectedTemplate.subject}
                        onChange={(e) => setSelectedTemplate({
                          ...selectedTemplate,
                          subject: e.target.value
                        })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Body</label>
                      <textarea
                        value={selectedTemplate.body}
                        onChange={(e) => setSelectedTemplate({
                          ...selectedTemplate,
                          body: e.target.value
                        })}
                        rows="10"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      />
                    </div>

                    <div className="bg-blue-50 p-4 rounded">
                      <p className="font-semibold text-sm mb-2">Available Variables:</p>
                      <div className="flex flex-wrap gap-2">
                        {variables[selectedTemplate.name]?.map((variable, i) => (
                          <code key={i} className="bg-blue-200 px-2 py-1 rounded text-xs font-mono">
                            {variable}
                          </code>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save Template
                      </button>
                      <button
                        type="button"
                        onClick={handleSendTest}
                        className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                      >
                        Send Test Email
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 text-sm">Subject:</p>
                      <p className="font-semibold text-lg bg-gray-50 p-3 rounded">{selectedTemplate.subject}</p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm mb-2">Body:</p>
                      <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap font-mono text-sm border border-gray-200 max-h-[400px] overflow-y-auto">
                        {selectedTemplate.body}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Edit Template
                      </button>
                      <button
                        onClick={handleSendTest}
                        className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                      >
                        Send Test Email
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">Select a template to view</div>
            )}
          </div>
        </div>
      )}

      {/* Broadcast Section */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-2xl font-bold mb-4">Send Broadcast Notification</h2>
        <form onSubmit={handleBroadcast} className="max-w-2xl">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Recipients</label>
            <select
              value={broadcastData.recipients}
              onChange={(e) => setBroadcastData({
                ...broadcastData,
                recipients: e.target.value
              })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="customers">Customers Only</option>
              <option value="admins">Admins Only</option>
              <option value="active">Active Users (Last 30 days)</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Subject</label>
            <input
              type="text"
              value={broadcastData.subject}
              onChange={(e) => setBroadcastData({
                ...broadcastData,
                subject: e.target.value
              })}
              placeholder="Email subject"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Message</label>
            <textarea
              value={broadcastData.message}
              onChange={(e) => setBroadcastData({
                ...broadcastData,
                message: e.target.value
              })}
              placeholder="Email message content"
              rows="5"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
            <p className="text-yellow-800 font-semibold text-sm">
              This will send an email to all selected recipients. This action cannot be undone.
            </p>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
          >
            Send Broadcast Notification
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailNotificationManager;
