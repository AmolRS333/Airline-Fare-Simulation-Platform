import React, { useState, useEffect } from 'react';
import { adminService } from '../services';

const AdminAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAnalytics({ timeRange });
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount) => `₹${amount?.toLocaleString() || 0}`;
  const formatPercent = (value) => `${value?.toFixed(1) || 0}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">📊 Advanced Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Revenue vs Target"
          value={formatCurrency(analytics.revenueVsTarget?.current)}
          subtitle={`Target: ${formatCurrency(analytics.revenueVsTarget?.target)}`}
          trend={analytics.revenueVsTarget?.trend}
          icon="💰"
          color="green"
        />
        <MetricCard
          title="Price Volatility"
          value={formatPercent(analytics.priceVolatility)}
          subtitle="Average price change"
          trend={analytics.priceVolatilityTrend}
          icon="📈"
          color="blue"
        />
        <MetricCard
          title="Missed Opportunities"
          value={formatCurrency(analytics.missedOpportunities)}
          subtitle="Potential revenue lost"
          trend={analytics.missedOpportunitiesTrend}
          icon="⚠️"
          color="red"
        />
        <MetricCard
          title="Peak Hour Revenue"
          value={formatCurrency(analytics.peakHourRevenue)}
          subtitle={`${analytics.peakHours || 0} peak hours identified`}
          trend={analytics.peakHourTrend}
          icon="⏰"
          color="purple"
        />
      </div>

      {/* Revenue vs Occupancy Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">💹 Revenue vs Occupancy Analysis</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-600">Interactive Chart Placeholder</p>
            <p className="text-sm text-gray-500">Shows correlation between occupancy rates and revenue</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{formatPercent(analytics.optimalOccupancy)}</div>
            <div className="text-sm text-gray-600">Optimal Occupancy</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(analytics.avgRevenuePerFlight)}</div>
            <div className="text-sm text-gray-600">Avg Revenue/Flight</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{analytics.loadFactor || 0}%</div>
            <div className="text-sm text-gray-600">Current Load Factor</div>
          </div>
        </div>
      </div>

      {/* Price Evolution Heatmap */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">🔥 Price Evolution Heatmap</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-gray-600">Heatmap Visualization</p>
            <p className="text-sm text-gray-500">Shows price changes across time and routes</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{analytics.priceSpikes || 0}</div>
            <div className="text-sm text-gray-600">Price Spikes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{analytics.priceDrops || 0}</div>
            <div className="text-sm text-gray-600">Price Drops</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{formatPercent(analytics.priceStability)}</div>
            <div className="text-sm text-gray-600">Price Stability</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{analytics.dynamicPriceChanges || 0}</div>
            <div className="text-sm text-gray-600">Dynamic Changes</div>
          </div>
        </div>
      </div>

      {/* Peak Hours Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">⏰ Peak Hours Revenue Distribution</h3>
        <div className="space-y-4">
          {analytics.peakHoursData?.map((hour, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-700">{hour.time}</span>
                <span className="text-sm text-gray-500">{hour.day}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-bold text-green-600">{formatCurrency(hour.revenue)}</div>
                  <div className="text-sm text-gray-600">{hour.bookings} bookings</div>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(hour.revenue / analytics.peakHourRevenue) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-gray-500">
              No peak hours data available
            </div>
          )}
        </div>
      </div>

      {/* Missed Opportunities Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">🎯 Missed Revenue Opportunities</h3>
        <div className="space-y-4">
          {analytics.missedOpportunitiesData?.map((opportunity, index) => (
            <div key={index} className="border-l-4 border-red-500 pl-4 py-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{opportunity.flight}</h4>
                  <p className="text-sm text-gray-600">{opportunity.date} • {opportunity.route}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">{formatCurrency(opportunity.potentialRevenue)}</div>
                  <div className="text-sm text-gray-600">Potential Loss</div>
                </div>
              </div>
              <p className="text-sm text-gray-700">{opportunity.reason}</p>
              <div className="mt-2 flex gap-2">
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                  {opportunity.occupancy}% occupied
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  Suggested: {formatCurrency(opportunity.suggestedPrice)}
                </span>
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-gray-500">
              No missed opportunities identified
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          🤖 AI-Powered Insights
        </h3>
        <div className="space-y-3">
          {analytics.aiInsights?.map((insight, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-xl">{insight.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                  <p className="text-gray-700 mt-1">{insight.description}</p>
                  <div className="mt-2 flex gap-2">
                    {insight.tags?.map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )) || (
            <div className="bg-white p-4 rounded-lg text-center text-gray-500">
              AI insights will be generated based on your data patterns
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, subtitle, trend, icon, color }) => {
  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';
  const trendIcon = trend > 0 ? '↗️' : trend < 0 ? '↘️' : '→';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        {trend !== undefined && (
          <span className={`text-sm font-semibold ${trendColor}`}>
            {trendIcon} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;