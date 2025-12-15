import React, { useState, useEffect } from 'react';
import { adminService } from '../services';
import { generatePDF } from '../utils/pdfGenerator';

const PDFTemplateEditor = () => {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    headerText: 'FLIGHT BOOKING CONFIRMATION',
    footerText: 'Thank you for booking with us',
    companyName: 'Flight Booking System',
    accentColor: '#003366',
    primaryColor: '#000000'
  });

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPDFTemplates();
      if (response.data) {
        setTemplate(response.data);
        setFormData(response.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to load PDF template');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await adminService.updatePDFTemplate(formData);
      setSuccess('PDF template updated successfully');
      setEditMode(false);
      fetchTemplate();
    } catch (err) {
      setError('Failed to update PDF template');
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset template to default? This cannot be undone.')) {
      try {
        await adminService.updatePDFTemplate({
          headerText: 'FLIGHT BOOKING CONFIRMATION',
          footerText: 'Thank you for booking with us',
          companyName: 'Flight Booking System',
          accentColor: '#003366',
          primaryColor: '#000000'
        });
        setSuccess('Template reset to default');
        setEditMode(false);
        fetchTemplate();
      } catch (err) {
        setError('Failed to reset template');
      }
    }
  };

  const generatePreview = () => {
    const mockBooking = {
      pnr: 'FBS2024001',
      flightNumber: 'FX-1001',
      origin: { iata: 'JFK', city: 'New York' },
      destination: { iata: 'LAX', city: 'Los Angeles' },
      departureTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      arrivalTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
      seatNumbers: ['12A', '12B'],
      pricePaid: 1200,
      passengers: [
        { title: 'Mr', name: 'John Doe', email: 'john@example.com' },
        { title: 'Ms', name: 'Jane Smith', email: 'jane@example.com' }
      ],
      status: 'confirmed'
    };

    generatePDF(mockBooking, formData);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">PDF Receipt Templates</h1>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}
      {success && <div className="p-4 bg-green-100 text-green-700 rounded mb-4">{success}</div>}

      {loading ? (
        <div className="text-center py-8">Loading template...</div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* Editor */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Template Settings</h2>
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
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Header Text</label>
                  <input
                    type="text"
                    name="headerText"
                    value={formData.headerText}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Footer Text</label>
                  <input
                    type="text"
                    name="footerText"
                    value={formData.footerText}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Primary Color (Hex)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleInputChange}
                      placeholder="#000000"
                      className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange({
                        target: { name: 'primaryColor', value: e.target.value }
                      })}
                      className="w-12 h-10 border rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Accent Color (Hex)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="accentColor"
                      value={formData.accentColor}
                      onChange={handleInputChange}
                      placeholder="#003366"
                      className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => handleInputChange({
                        target: { name: 'accentColor', value: e.target.value }
                      })}
                      className="w-12 h-10 border rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save Template
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    Reset to Default
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Company Name</p>
                  <p className="font-bold text-lg">{formData.companyName}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Header Text</p>
                  <p className="font-semibold text-lg" style={{ color: formData.primaryColor }}>
                    {formData.headerText}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Footer Text</p>
                  <p className="font-semibold text-lg" style={{ color: formData.accentColor }}>
                    {formData.footerText}
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm">Primary Color</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-12 h-12 rounded border-2 border-gray-300"
                        style={{ backgroundColor: formData.primaryColor }}
                      />
                      <p className="font-mono text-sm">{formData.primaryColor}</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-gray-600 text-sm">Accent Color</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-12 h-12 rounded border-2 border-gray-300"
                        style={{ backgroundColor: formData.accentColor }}
                      />
                      <p className="font-mono text-sm">{formData.accentColor}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setEditMode(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-4"
                >
                  Edit Template
                </button>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Preview</h2>
              <button
                onClick={generatePreview}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
              >
                Download Preview PDF
              </button>
            </div>

            <div className="bg-gray-100 p-6 rounded border-2 border-gray-300 min-h-[600px]">
              <div
                className="bg-white p-8 rounded shadow-lg"
                style={{ borderTopColor: formData.primaryColor, borderTopWidth: '4px' }}
              >
                {/* Header */}
                <div className="text-center mb-6 border-b-2 pb-4" style={{ borderColor: formData.accentColor }}>
                  <p className="text-sm text-gray-600">{formData.companyName}</p>
                  <h1 className="text-2xl font-bold mt-2" style={{ color: formData.primaryColor }}>
                    {formData.headerText}
                  </h1>
                </div>

                {/* Booking Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-600">PNR</p>
                    <p className="font-bold text-lg" style={{ color: formData.accentColor }}>FBS2024001</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Status</p>
                    <p className="font-bold text-lg text-green-600">CONFIRMED</p>
                  </div>
                </div>

                {/* Flight Details */}
                <div className="bg-gray-50 p-4 rounded mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600">From</p>
                      <p className="font-bold text-lg">JFK - New York</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl">✈</p>
                      <p className="text-xs text-gray-600 mt-1">FX-1001</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">To</p>
                      <p className="font-bold text-lg">LAX - Los Angeles</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-6 border-t-2" style={{ borderColor: formData.accentColor }}>
                  <p style={{ color: formData.accentColor }} className="font-semibold">
                    {formData.footerText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFTemplateEditor;
