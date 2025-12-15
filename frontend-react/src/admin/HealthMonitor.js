import React, { useState, useEffect } from 'react';
import { adminService } from '../services';

const HealthMonitor = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchHealthStatus();
    const interval = setInterval(fetchHealthStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchHealthStatus = async () => {
    try {
      const response = await adminService.getSystemHealth();
      setHealth(response.data);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setError('Failed to load health status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatusIndicator = ({ status, label, details }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{
      borderColor: status === 'healthy' ? '#10b981' : status === 'degraded' ? '#f59e0b' : '#ef4444'
    }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">{label}</h3>
        <div className={`w-4 h-4 rounded-full ${
          status === 'healthy' ? 'bg-green-500' :
          status === 'degraded' ? 'bg-yellow-500' :
          'bg-red-500'
        }`} />
      </div>
      <p className={`font-semibold text-lg capitalize ${
        status === 'healthy' ? 'text-green-600' :
        status === 'degraded' ? 'text-yellow-600' :
        'text-red-600'
      }`}>
        {status}
      </p>
      {details && (
        <div className="mt-3 text-sm text-gray-600 space-y-1">
          {Array.isArray(details) ? (
            details.map((detail, i) => <p key={i}>{detail}</p>)
          ) : (
            <p>{details}</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">System Health Monitor</h1>
        {lastUpdated && (
          <p className="text-gray-600">
            Last updated: {lastUpdated.toLocaleTimeString()}
            <button
              onClick={fetchHealthStatus}
              className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Refresh Now
            </button>
          </p>
        )}
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-8">Loading system health...</div>
      ) : health ? (
        <>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <StatusIndicator
              status={health.backend?.status}
              label="Node.js Backend"
              details={health.backend?.details}
            />
            <StatusIndicator
              status={health.python?.status}
              label="Python Pricing Engine"
              details={health.python?.details}
            />
            <StatusIndicator
              status={health.database?.status}
              label="MongoDB Database"
              details={health.database?.details}
            />
            <StatusIndicator
              status={health.api?.status}
              label="API Response"
              details={health.api?.details}
            />
          </div>

          {health.metrics && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Performance Metrics</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">API Response Time</p>
                  <p className="text-2xl font-bold text-blue-600">{health.metrics.apiResponseTime}ms</p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Database Query Time</p>
                  <p className="text-2xl font-bold text-green-600">{health.metrics.dbQueryTime}ms</p>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Uptime</p>
                  <p className="text-2xl font-bold text-purple-600">{health.metrics.uptime}</p>
                </div>
              </div>
            </div>
          )}

          {health.services && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-2xl font-bold mb-4">Service Status</h2>
              <div className="space-y-3">
                {health.services.map((service, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-semibold">{service.name}</p>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      service.status === 'running' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {health.alerts && health.alerts.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6 rounded">
              <h3 className="font-bold text-yellow-800 mb-2">Alerts</h3>
              <ul className="list-disc list-inside text-yellow-700">
                {health.alerts.map((alert, i) => (
                  <li key={i}>{alert}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">No health data available</div>
      )}
    </div>
  );
};

export default HealthMonitor;
