import React, { useState, useEffect } from 'react';
import { adminService } from '../services';

const FraudDetection = () => {
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [detectionStats, setDetectionStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('alerts');

  useEffect(() => {
    fetchFraudData();
  }, []);

  const fetchFraudData = async () => {
    try {
      setLoading(true);
      const [alertsData, activitiesData, statsData] = await Promise.all([
        adminService.getFraudAlerts(),
        adminService.getSuspiciousActivities(),
        adminService.getFraudStats()
      ]);
      setFraudAlerts(alertsData);
      setSuspiciousActivities(activitiesData);
      setDetectionStats(statsData);
    } catch (error) {
      console.error('Failed to fetch fraud data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertAction = async (alertId, action) => {
    try {
      await adminService.handleFraudAlert(alertId, action);
      fetchFraudData(); // Refresh data
    } catch (error) {
      console.error('Failed to handle alert:', error);
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
          <h2 className="text-2xl font-bold text-gray-900">🛡️ AI-Powered Fraud Detection</h2>
          <p className="text-gray-600">Advanced bot detection and suspicious activity monitoring</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600">{fraudAlerts.filter(a => a.severity === 'high').length}</div>
            <div className="text-sm text-gray-600">Critical Alerts</div>
          </div>
        </div>
      </div>

      {/* Detection Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Detection Rate"
          value={`${detectionStats.detectionRate || 0}%`}
          change="+5%"
          icon="🎯"
          color="green"
        />
        <StatCard
          title="False Positives"
          value={`${detectionStats.falsePositives || 0}%`}
          change="-2%"
          icon="⚠️"
          color="yellow"
        />
        <StatCard
          title="Blocked Threats"
          value={detectionStats.blockedThreats || 0}
          change="+12"
          icon="🚫"
          color="red"
        />
        <StatCard
          title="Revenue Protected"
          value={`₹${(detectionStats.revenueProtected || 0).toLocaleString()}`}
          change="+8%"
          icon="💰"
          color="blue"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'alerts'
              ? 'border-b-2 border-red-500 text-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Fraud Alerts ({fraudAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'activities'
              ? 'border-b-2 border-orange-500 text-orange-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Suspicious Activities ({suspiciousActivities.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'analytics'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Detection Analytics
        </button>
      </div>

      {/* Fraud Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active Fraud Alerts</h3>
            <span className="text-sm text-gray-500">Real-time monitoring</span>
          </div>

          {fraudAlerts.map((alert, index) => (
            <FraudAlertCard key={index} alert={alert} onAction={handleAlertAction} />
          ))}

          {fraudAlerts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No active fraud alerts. System is monitoring normally.
            </div>
          )}
        </div>
      )}

      {/* Suspicious Activities Tab */}
      {activeTab === 'activities' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Suspicious Activity Log</h3>

          {suspiciousActivities.map((activity, index) => (
            <ActivityCard key={index} activity={activity} />
          ))}

          {suspiciousActivities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No suspicious activities detected recently.
            </div>
          )}
        </div>
      )}

      {/* Detection Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Fraud Detection Analytics</h3>

          {/* Detection Methods */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Detection Methods Performance</h4>
            <div className="space-y-4">
              <DetectionMethodCard
                method="Bot Pattern Recognition"
                accuracy="96%"
                alerts={detectionStats.botAlerts || 0}
                blocked={detectionStats.botBlocked || 0}
              />
              <DetectionMethodCard
                method="IP Reputation Analysis"
                accuracy="89%"
                alerts={detectionStats.ipAlerts || 0}
                blocked={detectionStats.ipBlocked || 0}
              />
              <DetectionMethodCard
                method="Behavioral Analysis"
                accuracy="92%"
                alerts={detectionStats.behaviorAlerts || 0}
                blocked={detectionStats.behaviorBlocked || 0}
              />
              <DetectionMethodCard
                method="Rate Limiting"
                accuracy="98%"
                alerts={detectionStats.rateAlerts || 0}
                blocked={detectionStats.rateBlocked || 0}
              />
            </div>
          </div>

          {/* Threat Categories */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Threat Categories</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-gray-900 mb-3">By Type</h5>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Automated Bots</span>
                    <span className="font-bold text-red-600">{detectionStats.botThreats || 0}%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Credential Stuffing</span>
                    <span className="font-bold text-orange-600">{detectionStats.credentialThreats || 0}%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Scalping Attempts</span>
                    <span className="font-bold text-yellow-600">{detectionStats.scalpingThreats || 0}%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Fake Accounts</span>
                    <span className="font-bold text-purple-600">{detectionStats.fakeAccountThreats || 0}%</span>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-3">By Impact</h5>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>High Impact</span>
                    <span className="font-bold text-red-600">{detectionStats.highImpact || 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Medium Impact</span>
                    <span className="font-bold text-orange-600">{detectionStats.mediumImpact || 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Low Impact</span>
                    <span className="font-bold text-yellow-600">{detectionStats.lowImpact || 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Monitored Only</span>
                    <span className="font-bold text-blue-600">{detectionStats.monitored || 0}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Prevention Measures */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">🛡️ Active Prevention Measures</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Technical Controls</h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>CAPTCHA integration for suspicious sessions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>IP-based rate limiting and blocking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Device fingerprinting and tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Automated account verification</span>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-3">AI-Powered Detection</h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Machine learning behavior analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Anomaly detection algorithms</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Pattern recognition for bot behavior</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Predictive threat modeling</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    green: 'border-green-200 bg-green-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    red: 'border-red-200 bg-red-50',
    blue: 'border-blue-200 bg-blue-50'
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-sm font-semibold ${
          change?.startsWith('+') ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600">{title}</p>
      </div>
    </div>
  );
};

// Fraud Alert Card Component
const FraudAlertCard = ({ alert, onAction }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-orange-500 bg-orange-50';
      case 'low': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className={`border-l-4 rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{alert.title}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              alert.severity === 'high' ? 'bg-red-100 text-red-800' :
              alert.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {alert.severity.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600">{alert.description}</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          {alert.timestamp}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{alert.confidence}%</div>
          <div className="text-xs text-gray-500">Confidence</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">{alert.riskScore}</div>
          <div className="text-xs text-gray-500">Risk Score</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">₹{alert.potentialLoss?.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Potential Loss</div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Affected:</span> {alert.affectedUsers} users, {alert.affectedBookings} bookings
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAction(alert.id, 'investigate')}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          >
            Investigate
          </button>
          <button
            onClick={() => onAction(alert.id, 'block')}
            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
          >
            Block
          </button>
          <button
            onClick={() => onAction(alert.id, 'dismiss')}
            className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

// Activity Card Component
const ActivityCard = ({ activity }) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{activity.type}</h4>
          <p className="text-sm text-gray-600">{activity.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-gray-900">{activity.timestamp}</div>
          <div className="text-xs text-gray-500">{activity.ip}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">User:</span>
          <div className="text-gray-900">{activity.user}</div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Risk Level:</span>
          <div className={`font-bold ${
            activity.riskLevel === 'high' ? 'text-red-600' :
            activity.riskLevel === 'medium' ? 'text-orange-600' : 'text-yellow-600'
          }`}>
            {activity.riskLevel}
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Actions:</span>
          <div className="text-gray-900">{activity.actionCount}</div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            activity.status === 'blocked' ? 'bg-red-100 text-red-800' :
            activity.status === 'monitored' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {activity.status}
          </span>
        </div>
      </div>
    </div>
  );
};

// Detection Method Card Component
const DetectionMethodCard = ({ method, accuracy, alerts, blocked }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
      <div className="flex-1">
        <div className="font-semibold text-gray-900">{method}</div>
        <div className="text-sm text-gray-600">Accuracy: {accuracy}</div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-blue-600">{alerts}</div>
        <div className="text-xs text-gray-500">alerts</div>
      </div>
      <div className="text-right ml-4">
        <div className="text-lg font-bold text-green-600">{blocked}</div>
        <div className="text-xs text-gray-500">blocked</div>
      </div>
    </div>
  );
};

export default FraudDetection;