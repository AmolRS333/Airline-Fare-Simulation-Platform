import React, { useState, useEffect } from 'react';
import { adminService } from '../services';

const DemandForecasting = () => {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [forecastPeriod, setForecastPeriod] = useState('7d');

  useEffect(() => {
    fetchForecasts();
  }, [selectedRoute, forecastPeriod]);

  const fetchForecasts = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDemandForecast({
        route: selectedRoute,
        period: forecastPeriod
      });
      setForecasts(data);
    } catch (error) {
      console.error('Failed to fetch forecasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyForecastAdjustment = async (forecastId, adjustment) => {
    try {
      await adminService.applyForecastAdjustment(forecastId, adjustment);
      fetchForecasts(); // Refresh data
    } catch (error) {
      console.error('Failed to apply adjustment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🔮 AI-Powered Demand Forecasting</h2>
          <p className="text-gray-600">Predict future demand patterns and optimize pricing proactively</p>
        </div>
        <div className="flex gap-4">
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Routes</option>
            <option value="domestic">Domestic</option>
            <option value="international">International</option>
          </select>
          <select
            value={forecastPeriod}
            onChange={(e) => setForecastPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
          </select>
        </div>
      </div>

      {/* Forecast Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ForecastCard
          title="Demand Trend"
          value={forecasts.overallTrend || 'Stable'}
          change={forecasts.trendChange || 0}
          icon="📈"
          color="blue"
        />
        <ForecastCard
          title="Peak Demand Days"
          value={forecasts.peakDays || 0}
          subtitle="in next period"
          icon="🔥"
          color="red"
        />
        <ForecastCard
          title="Forecast Accuracy"
          value={`${forecasts.accuracy || 0}%`}
          subtitle="last 30 days"
          icon="🎯"
          color="green"
        />
        <ForecastCard
          title="Auto-Adjustments"
          value={forecasts.adjustments || 0}
          subtitle="applied today"
          icon="⚙️"
          color="purple"
        />
      </div>

      {/* Forecast Visualization */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Demand Forecast Chart</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-600">Interactive Forecast Chart</p>
            <p className="text-sm text-gray-500">Shows predicted demand vs historical data</p>
          </div>
        </div>
      </div>

      {/* Detailed Forecasts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Detailed Route Forecasts</h3>
        <div className="space-y-4">
          {forecasts.routes?.map((route, index) => (
            <RouteForecastCard
              key={index}
              route={route}
              onApplyAdjustment={applyForecastAdjustment}
            />
          )) || (
            <div className="text-center py-8 text-gray-500">
              No forecast data available
            </div>
          )}
        </div>
      </div>

      {/* Forecasting Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          🤖 AI Forecasting Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Key Patterns Detected</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">📅</span>
                <span>Weekend demand spikes expected for business routes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">🌦️</span>
                <span>Weather patterns show 15% impact on coastal routes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">🎪</span>
                <span>Festival season will increase demand by 25% for next 2 weeks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600">💼</span>
                <span>Corporate bookings trending up for international routes</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Recommended Actions</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Increase capacity for high-demand routes next weekend</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">⚠️</span>
                <span>Consider dynamic pricing for weather-sensitive routes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">📈</span>
                <span>Promotional pricing recommended for low-demand periods</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600">🚨</span>
                <span>Monitor competitor pricing for peak season routes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Forecast Accuracy History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Forecast Accuracy Over Time</h3>
        <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
          <div className="text-center">
            <div className="text-3xl mb-2">📈</div>
            <p className="text-gray-600">Accuracy Trend Chart</p>
            <p className="text-sm text-gray-500">Shows how forecast accuracy has improved over time</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-green-600">92%</div>
            <div className="text-sm text-gray-600">7-Day Accuracy</div>
          </div>
          <div>
            <div className="text-xl font-bold text-blue-600">88%</div>
            <div className="text-sm text-gray-600">30-Day Accuracy</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-600">85%</div>
            <div className="text-sm text-gray-600">90-Day Accuracy</div>
          </div>
          <div>
            <div className="text-xl font-bold text-orange-600">+5%</div>
            <div className="text-sm text-gray-600">Improvement</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Forecast Card Component
const ForecastCard = ({ title, value, subtitle, change, icon, color }) => {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    red: 'border-red-200 bg-red-50',
    green: 'border-green-200 bg-green-50',
    purple: 'border-purple-200 bg-purple-50'
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {change !== undefined && (
          <span className={`text-sm font-semibold ${
            change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
};

// Route Forecast Card Component
const RouteForecastCard = ({ route, onApplyAdjustment }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getDemandLevel = (level) => {
    if (level >= 80) return { color: 'text-red-600 bg-red-100', label: 'High' };
    if (level >= 60) return { color: 'text-yellow-600 bg-yellow-100', label: 'Medium' };
    return { color: 'text-green-600 bg-green-100', label: 'Low' };
  };

  const demandLevel = getDemandLevel(route.predictedDemand);

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{route.route}</h4>
          <p className="text-sm text-gray-600">{route.date}</p>
        </div>
        <div className="text-right">
          <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${demandLevel.color}`}>
            {demandLevel.label} Demand
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{route.predictedDemand}%</div>
          <div className="text-xs text-gray-500">Predicted</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{route.confidence}%</div>
          <div className="text-xs text-gray-500">Confidence</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">₹{route.suggestedPrice?.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Suggested Price</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">{route.potentialRevenue?.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Revenue Potential</div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onApplyAdjustment(route.id, 'increase')}
            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
          >
            Increase Price
          </button>
          <button
            onClick={() => onApplyAdjustment(route.id, 'decrease')}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          >
            Decrease Price
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Factors:</span>
              <ul className="mt-1 space-y-1 text-gray-600">
                {route.factors?.map((factor, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{factor.name}</span>
                    <span className={factor.impact > 0 ? 'text-green-600' : 'text-red-600'}>
                      {factor.impact > 0 ? '+' : ''}{factor.impact}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-medium text-gray-700">Historical Accuracy:</span>
              <div className="mt-1 space-y-1 text-gray-600">
                <div>Last 7 days: {route.accuracy7d}%</div>
                <div>Last 30 days: {route.accuracy30d}%</div>
                <div>Trend: <span className={route.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                  {route.trend > 0 ? 'Improving' : 'Declining'}
                </span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandForecasting;