import React, { useState, useEffect } from 'react';
import { adminService } from '../services';

const UserBehaviorPricing = () => {
  const [behaviorData, setBehaviorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState('all');

  useEffect(() => {
    fetchBehaviorData();
  }, [activeSegment]);

  const fetchBehaviorData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUserBehaviorData({ segment: activeSegment });
      setBehaviorData(data);
    } catch (error) {
      console.error('Failed to fetch behavior data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePricingRule = async (segmentId, ruleType, adjustment) => {
    try {
      await adminService.updateBehaviorPricingRule(segmentId, ruleType, adjustment);
      fetchBehaviorData(); // Refresh data
    } catch (error) {
      console.error('Failed to update pricing rule:', error);
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
          <h2 className="text-2xl font-bold text-gray-900">👤 User Behavior-Aware Pricing</h2>
          <p className="text-gray-600">Ethical dynamic pricing based on user behavior patterns</p>
        </div>
        <select
          value={activeSegment}
          onChange={(e) => setActiveSegment(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Segments</option>
          <option value="frequent">Frequent Flyers</option>
          <option value="business">Business Travelers</option>
          <option value="leisure">Leisure Travelers</option>
          <option value="last_minute">Last-Minute Bookers</option>
          <option value="group">Group Bookers</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Behavior Segments"
          value={behaviorData.totalSegments || 0}
          subtitle="active segments"
          icon="🎯"
          color="blue"
        />
        <MetricCard
          title="Personalized Pricing"
          value={`${behaviorData.personalizationRate || 0}%`}
          subtitle="of bookings"
          icon="💰"
          color="green"
        />
        <MetricCard
          title="Ethical Score"
          value={behaviorData.ethicalScore || 0}
          subtitle="out of 100"
          icon="⚖️"
          color="purple"
        />
        <MetricCard
          title="Revenue Impact"
          value={`+${behaviorData.revenueImpact || 0}%`}
          subtitle="from personalization"
          icon="📈"
          color="orange"
        />
      </div>

      {/* User Segments Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">User Behavior Segments</h3>
        <div className="space-y-4">
          {behaviorData.segments?.map((segment, index) => (
            <SegmentCard
              key={index}
              segment={segment}
              onUpdateRule={updatePricingRule}
            />
          )) || (
            <div className="text-center py-8 text-gray-500">
              No segment data available
            </div>
          )}
        </div>
      </div>

      {/* Behavior Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">📊 Booking Patterns</h3>
          <div className="space-y-3">
            {behaviorData.patterns?.map((pattern, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-semibold text-gray-900">{pattern.name}</div>
                  <div className="text-sm text-gray-600">{pattern.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{pattern.percentage}%</div>
                  <div className="text-xs text-gray-500">of users</div>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500">
                No pattern data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">⏰ Timing Preferences</h3>
          <div className="space-y-3">
            {behaviorData.timing?.map((timeSlot, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-semibold text-gray-900">{timeSlot.slot}</div>
                  <div className="text-sm text-gray-600">{timeSlot.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{timeSlot.bookings}</div>
                  <div className="text-xs text-gray-500">bookings</div>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500">
                No timing data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ethical Pricing Dashboard */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          ⚖️ Ethical Pricing Dashboard
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Fairness Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Price Discrimination</span>
                <span className="text-sm font-bold text-green-600">Low</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Transparency</span>
                <span className="text-sm font-bold text-green-600">High</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">User Trust</span>
                <span className="text-sm font-bold text-blue-600">85%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Pricing Rules</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Frequent Flyer Discount</span>
                <span className="text-sm font-bold text-green-600">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last-Minute Surge</span>
                <span className="text-sm font-bold text-yellow-600">Moderate</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Group Booking Rate</span>
                <span className="text-sm font-bold text-blue-600">Flexible</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Impact Analysis</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue Increase</span>
                <span className="text-sm font-bold text-green-600">+12%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Customer Satisfaction</span>
                <span className="text-sm font-bold text-green-600">+8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Repeat Bookings</span>
                <span className="text-sm font-bold text-blue-600">+15%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Behavior Monitoring */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">🔍 Real-time Behavior Monitoring</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MonitorCard
            title="Active Sessions"
            value={behaviorData.activeSessions || 0}
            change={behaviorData.sessionChange || 0}
            icon="👥"
          />
          <MonitorCard
            title="Search Intensity"
            value={behaviorData.searchIntensity || 'Medium'}
            change={behaviorData.intensityChange || 0}
            icon="🔍"
          />
          <MonitorCard
            title="Conversion Rate"
            value={`${behaviorData.conversionRate || 0}%`}
            change={behaviorData.conversionChange || 0}
            icon="📊"
          />
          <MonitorCard
            title="Abandonment Rate"
            value={`${behaviorData.abandonmentRate || 0}%`}
            change={behaviorData.abandonmentChange || 0}
            icon="🚪"
          />
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    purple: 'border-purple-200 bg-purple-50',
    orange: 'border-orange-200 bg-orange-50'
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-lg font-bold text-gray-900">{value}</div>
          <div className="text-sm font-medium text-gray-600">{title}</div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
};

// Segment Card Component
const SegmentCard = ({ segment, onUpdateRule }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{segment.name}</h4>
          <p className="text-sm text-gray-600">{segment.description}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">{segment.userCount}</div>
          <div className="text-xs text-gray-500">users</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{segment.avgSpend}</div>
          <div className="text-xs text-gray-500">Avg Spend</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{segment.bookingFreq}</div>
          <div className="text-xs text-gray-500">Bookings/Month</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">{segment.priceSensitivity}%</div>
          <div className="text-xs text-gray-500">Price Sensitive</div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {expanded ? 'Hide Rules' : 'Show Rules'}
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdateRule(segment.id, 'discount', 5)}
            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
          >
            Add Discount
          </button>
          <button
            onClick={() => onUpdateRule(segment.id, 'loyalty', 10)}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          >
            Loyalty Bonus
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h5 className="font-semibold text-gray-900 mb-3">Active Pricing Rules</h5>
          <div className="space-y-2">
            {segment.rules?.map((rule, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium text-gray-900">{rule.name}</span>
                  <span className="text-sm text-gray-600 ml-2">{rule.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    rule.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rule.status}
                  </span>
                  <span className="text-sm font-bold text-blue-600">{rule.impact}%</span>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500 text-sm">
                No active rules for this segment
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Monitor Card Component
const MonitorCard = ({ title, value, change, icon }) => {
  const changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{icon}</span>
        {change !== undefined && (
          <span className={`text-sm font-semibold ${changeColor}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-lg font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
};

export default UserBehaviorPricing;