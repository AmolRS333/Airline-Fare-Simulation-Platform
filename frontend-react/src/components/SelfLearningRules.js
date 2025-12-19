import React, { useState, useEffect } from 'react';
import { adminService } from '../services';

const SelfLearningRules = () => {
  const [rules, setRules] = useState([]);
  const [learningHistory, setLearningHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rules');

  useEffect(() => {
    fetchLearningData();
  }, []);

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      const [rulesData, historyData] = await Promise.all([
        adminService.getLearningRules(),
        adminService.getLearningHistory()
      ]);
      setRules(rulesData);
      setLearningHistory(historyData);
    } catch (error) {
      console.error('Failed to fetch learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const adaptRule = async (ruleId, action) => {
    try {
      await adminService.adaptRule(ruleId, action);
      fetchLearningData(); // Refresh data
    } catch (error) {
      console.error('Failed to adapt rule:', error);
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🧠</span>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Self-Learning Pricing Rules</h2>
          <p className="text-gray-600">AI-powered rule adaptation based on performance data</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'rules'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Active Rules
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'history'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Learning History
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'insights'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          AI Insights
        </button>
      </div>

      {/* Active Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Current Learning Rules</h3>
            <span className="text-sm text-gray-500">{rules.length} active rules</span>
          </div>

          {rules.map(rule => (
            <RuleCard key={rule.id} rule={rule} onAdapt={adaptRule} />
          ))}

          {rules.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No learning rules available yet. The system will create rules as it learns from data.
            </div>
          )}
        </div>
      )}

      {/* Learning History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Rule Adaptation History</h3>

          {learningHistory.map(entry => (
            <HistoryEntry key={entry.id} entry={entry} />
          ))}

          {learningHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No learning history available yet.
            </div>
          )}
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">🤖 AI Learning Insights</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InsightCard
              title="Learning Progress"
              value="87%"
              description="System has learned optimal pricing patterns"
              icon="📈"
              color="green"
            />
            <InsightCard
              title="Rules Adapted"
              value={rules.filter(r => r.adapted).length}
              description="Rules modified based on performance"
              icon="🔄"
              color="blue"
            />
            <InsightCard
              title="Revenue Impact"
              value="+12.5%"
              description="Improvement from learned rules"
              icon="💰"
              color="purple"
            />
            <InsightCard
              title="Confidence Level"
              value="High"
              description="System confidence in predictions"
              icon="🎯"
              color="orange"
            />
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Key Learning Patterns</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Peak hour pricing rules show 15% better performance when adjusted for demand spikes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Competitor price matching rules perform better with 48-hour delay rather than immediate response</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">🔄</span>
                <span>Weather-based pricing rules are being tested with different sensitivity thresholds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">⚠️</span>
                <span>Group booking discounts need adjustment - current rules may be too aggressive</span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 text-xl">💡</span>
              <div>
                <h5 className="font-semibold text-yellow-900">Continuous Learning</h5>
                <p className="text-sm text-yellow-800 mt-1">
                  The AI system continuously analyzes booking patterns, competitor actions, and market conditions
                  to optimize pricing rules. Rules are automatically adapted when performance metrics show
                  improvement opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Rule Card Component
const RuleCard = ({ rule, onAdapt }) => {
  const getPerformanceColor = (performance) => {
    if (performance >= 80) return 'text-green-600 bg-green-100';
    if (performance >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-blue-600';
    return 'text-orange-600';
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{rule.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
        </div>
        <div className="text-right ml-4">
          <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getPerformanceColor(rule.performance)}`}>
            {rule.performance}% Performance
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{rule.applications}</div>
          <div className="text-xs text-gray-500">Applications</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${getConfidenceColor(rule.confidence)}`}>
            {rule.confidence}%
          </div>
          <div className="text-xs text-gray-500">Confidence</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{rule.lastAdapted}</div>
          <div className="text-xs text-gray-500">Last Adapted</div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Impact:</span> {rule.impact > 0 ? '+' : ''}{rule.impact}% revenue
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAdapt(rule.id, 'strengthen')}
            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
          >
            Strengthen
          </button>
          <button
            onClick={() => onAdapt(rule.id, 'weaken')}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          >
            Weaken
          </button>
          <button
            onClick={() => onAdapt(rule.id, 'disable')}
            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
          >
            Disable
          </button>
        </div>
      </div>

      {rule.suggestion && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 text-sm">💡</span>
            <div>
              <div className="text-sm font-medium text-blue-900">AI Suggestion</div>
              <div className="text-sm text-blue-800">{rule.suggestion}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// History Entry Component
const HistoryEntry = ({ entry }) => {
  const getActionColor = (action) => {
    switch (action) {
      case 'strengthened': return 'text-green-600 bg-green-100';
      case 'weakened': return 'text-blue-600 bg-blue-100';
      case 'disabled': return 'text-red-600 bg-red-100';
      case 'enabled': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-gray-900">{entry.ruleName}</h4>
          <p className="text-sm text-gray-600">{entry.timestamp}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionColor(entry.action)}`}>
          {entry.action}
        </span>
      </div>
      <p className="text-sm text-gray-700 mb-2">{entry.reason}</p>
      <div className="flex gap-4 text-xs text-gray-500">
        <span>Performance: {entry.beforePerformance}% → {entry.afterPerformance}%</span>
        <span>Revenue Impact: {entry.revenueImpact > 0 ? '+' : ''}{entry.revenueImpact}%</span>
      </div>
    </div>
  );
};

// Insight Card Component
const InsightCard = ({ title, value, description, icon, color }) => {
  const colorClasses = {
    green: 'border-green-200 bg-green-50',
    blue: 'border-blue-200 bg-blue-50',
    purple: 'border-purple-200 bg-purple-50',
    orange: 'border-orange-200 bg-orange-50'
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-lg font-bold text-gray-900">{value}</div>
          <div className="text-sm font-medium text-gray-700">{title}</div>
        </div>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

export default SelfLearningRules;