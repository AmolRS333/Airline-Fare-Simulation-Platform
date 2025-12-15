import React, { useState, useEffect } from 'react';
import { adminService } from '../services';

const PricingControl = () => {
  const [rules, setRules] = useState(null);
  const [history, setHistory] = useState([]);
  const [changelog, setChangelog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [formData, setFormData] = useState({
    seatMultiplier: 1.5,
    timeMultiplier: 2,
    demandMultiplier: 1.8,
    priceFloor: 50,
    priceCeiling: 5000
  });

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      const [rulesResp, historyResp, changelogResp] = await Promise.all([
        adminService.getPricingRules(),
        adminService.getPriceHistory(),
        adminService.getPriceChangeLog()
      ]);
      
      setRules(rulesResp.data);
      setHistory(historyResp.data || []);
      setChangelog(changelogResp.data || []);
      
      if (rulesResp.data) {
        setFormData({
          seatMultiplier: rulesResp.data.seatMultiplier || 1.5,
          timeMultiplier: rulesResp.data.timeMultiplier || 2,
          demandMultiplier: rulesResp.data.demandMultiplier || 1.8,
          priceFloor: rulesResp.data.priceFloor || 50,
          priceCeiling: rulesResp.data.priceCeiling || 5000
        });
      }
      setError('');
    } catch (err) {
      setError('Failed to load pricing data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.updatePricingRules(formData);
      setSuccess('Pricing rules updated successfully');
      setEditing(false);
      fetchPricingData();
    } catch (err) {
      setError('Failed to update pricing rules');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || value
    }));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dynamic Pricing Control</h1>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}
      {success && <div className="p-4 bg-green-100 text-green-700 rounded mb-4">{success}</div>}

      {loading ? (
        <div className="text-center py-8">Loading pricing data...</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Pricing Rules */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Current Pricing Rules</h2>
                <button
                  onClick={() => setEditing(!editing)}
                  className={`px-4 py-2 rounded font-semibold ${
                    editing
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {editing ? 'Cancel' : 'Edit Rules'}
                </button>
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Seat Availability Multiplier
                      </label>
                      <input
                        type="number"
                        name="seatMultiplier"
                        value={formData.seatMultiplier}
                        onChange={handleInputChange}
                        step="0.1"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-600 mt-1">Max multiplier when &gt;90% full</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Time-to-Departure Multiplier
                      </label>
                      <input
                        type="number"
                        name="timeMultiplier"
                        value={formData.timeMultiplier}
                        onChange={handleInputChange}
                        step="0.1"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-600 mt-1">Max multiplier within 24 hours</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Demand Level Multiplier
                      </label>
                      <input
                        type="number"
                        name="demandMultiplier"
                        value={formData.demandMultiplier}
                        onChange={handleInputChange}
                        step="0.1"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-600 mt-1">Max multiplier on high demand</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Minimum Price Floor ($)
                      </label>
                      <input
                        type="number"
                        name="priceFloor"
                        value={formData.priceFloor}
                        onChange={handleInputChange}
                        step="10"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-600 mt-1">Minimum price never goes below</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Maximum Price Ceiling ($)
                      </label>
                      <input
                        type="number"
                        name="priceCeiling"
                        value={formData.priceCeiling}
                        onChange={handleInputChange}
                        step="100"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-600 mt-1">Maximum price never goes above</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Save Rules
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded">
                    <p className="text-gray-600 text-sm">Seat Multiplier</p>
                    <p className="text-2xl font-bold text-blue-600">{formData.seatMultiplier}x</p>
                    <p className="text-xs text-gray-600 mt-1">90%+ occupancy</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-gray-600 text-sm">Time Multiplier</p>
                    <p className="text-2xl font-bold text-green-600">{formData.timeMultiplier}x</p>
                    <p className="text-xs text-gray-600 mt-1">Within 24 hours</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded">
                    <p className="text-gray-600 text-sm">Demand Multiplier</p>
                    <p className="text-2xl font-bold text-purple-600">{formData.demandMultiplier}x</p>
                    <p className="text-xs text-gray-600 mt-1">High demand routes</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded">
                    <p className="text-gray-600 text-sm">Price Range</p>
                    <p className="text-lg font-bold text-orange-600">${formData.priceFloor} - ${formData.priceCeiling}</p>
                    <p className="text-xs text-gray-600 mt-1">Min to Max</p>
                  </div>
                </div>
              )}
            </div>

            {/* Price History */}
            {history.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h2 className="text-2xl font-bold mb-4">Recent Price Changes</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left">Flight</th>
                        <th className="px-4 py-2 text-left">Old Price</th>
                        <th className="px-4 py-2 text-left">New Price</th>
                        <th className="px-4 py-2 text-left">Change</th>
                        <th className="px-4 py-2 text-left">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 5).map((item, i) => {
                        const change = ((item.newPrice - item.oldPrice) / item.oldPrice * 100).toFixed(1);
                        return (
                          <tr key={i} className="border-b">
                            <td className="px-4 py-2 font-semibold">{item.flightNumber}</td>
                            <td className="px-4 py-2">${item.oldPrice?.toFixed(2)}</td>
                            <td className="px-4 py-2">${item.newPrice?.toFixed(2)}</td>
                            <td className={`px-4 py-2 font-bold ${change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {change > 0 ? '+' : ''}{change}%
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-600">{new Date(item.timestamp).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Change Log */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Change Log</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {changelog.length > 0 ? (
                changelog.slice(0, 10).map((log, i) => (
                  <div key={i} className="pb-3 border-b">
                    <p className="font-semibold text-sm">{log.action}</p>
                    <p className="text-xs text-gray-600">{log.details}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No changes logged yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingControl;
