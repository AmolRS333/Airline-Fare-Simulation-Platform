import React, { useState, useEffect } from 'react';
import { adminService } from '../services';

const MultiAgentSimulation = () => {
  const [simulation, setSimulation] = useState(null);
  const [agents, setAgents] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimulationData();
  }, []);

  const fetchSimulationData = async () => {
    try {
      setLoading(true);
      const [simData, agentsData] = await Promise.all([
        adminService.getSimulationStatus(),
        adminService.getAgents()
      ]);
      setSimulation(simData);
      setAgents(agentsData);
    } catch (error) {
      console.error('Failed to fetch simulation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSimulation = async () => {
    try {
      setIsRunning(true);
      const simResults = await adminService.runMultiAgentSimulation();
      setResults(simResults);
    } catch (error) {
      console.error('Failed to run simulation:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const stopSimulation = async () => {
    try {
      await adminService.stopSimulation();
      setIsRunning(false);
      fetchSimulationData();
    } catch (error) {
      console.error('Failed to stop simulation:', error);
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
          <h2 className="text-2xl font-bold text-gray-900">🤖 Multi-Agent Pricing Simulation</h2>
          <p className="text-gray-600">Simulate competitive airline pricing with intelligent agents</p>
        </div>
        <div className="flex gap-4">
          {!isRunning ? (
            <button
              onClick={startSimulation}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              ▶️ Start Simulation
            </button>
          ) : (
            <button
              onClick={stopSimulation}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              ⏹️ Stop Simulation
            </button>
          )}
        </div>
      </div>

      {/* Simulation Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Simulation Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatusCard
            title="Active Agents"
            value={agents.filter(a => a.active).length}
            total={agents.length}
            icon="🤖"
            color="blue"
          />
          <StatusCard
            title="Simulation Rounds"
            value={simulation?.currentRound || 0}
            total={simulation?.totalRounds || 100}
            icon="🔄"
            color="green"
          />
          <StatusCard
            title="Market Equilibrium"
            value={`${simulation?.equilibrium || 0}%`}
            subtitle="stability reached"
            icon="⚖️"
            color="purple"
          />
          <StatusCard
            title="Price Volatility"
            value={`${simulation?.volatility || 0}%`}
            subtitle="current period"
            icon="📈"
            color="orange"
          />
        </div>
      </div>

      {/* Agent Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Agent Portfolio</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent, index) => (
            <AgentCard key={index} agent={agent} />
          ))}
        </div>
      </div>

      {/* Real-time Price Competition */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">💹 Real-time Price Competition</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-600">Live Price Competition Chart</p>
            <p className="text-sm text-gray-500">Shows how agents adjust prices in response to competitors</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-blue-600">₹4,250</div>
            <div className="text-sm text-gray-600">Lowest Price</div>
          </div>
          <div>
            <div className="text-xl font-bold text-green-600">₹4,850</div>
            <div className="text-sm text-gray-600">Average Price</div>
          </div>
          <div>
            <div className="text-xl font-bold text-red-600">₹5,200</div>
            <div className="text-sm text-gray-600">Highest Price</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-600">18%</div>
            <div className="text-sm text-gray-600">Price Spread</div>
          </div>
        </div>
      </div>

      {/* Simulation Results */}
      {results && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">📊 Simulation Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Market Outcomes</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex justify-between">
                  <span>Market Equilibrium Reached:</span>
                  <span className="font-bold text-green-600">{results.equilibriumReached ? 'Yes' : 'No'}</span>
                </li>
                <li className="flex justify-between">
                  <span>Average Price Convergence:</span>
                  <span className="font-bold text-blue-600">{results.priceConvergence}%</span>
                </li>
                <li className="flex justify-between">
                  <span>Total Transactions:</span>
                  <span className="font-bold text-purple-600">{results.totalTransactions}</span>
                </li>
                <li className="flex justify-between">
                  <span>Price Wars Detected:</span>
                  <span className="font-bold text-red-600">{results.priceWars}</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Agent Performance</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex justify-between">
                  <span>Most Profitable Agent:</span>
                  <span className="font-bold text-green-600">{results.topAgent}</span>
                </li>
                <li className="flex justify-between">
                  <span>Market Share Leader:</span>
                  <span className="font-bold text-blue-600">{results.marketLeader}</span>
                </li>
                <li className="flex justify-between">
                  <span>Aggressive Pricing Agent:</span>
                  <span className="font-bold text-orange-600">{results.aggressiveAgent}</span>
                </li>
                <li className="flex justify-between">
                  <span>Cooperative Strategies:</span>
                  <span className="font-bold text-purple-600">{results.cooperativeCount}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Agent Strategies */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">🎯 Agent Strategies & Behaviors</h3>
        <div className="space-y-4">
          <StrategyCard
            title="Price Matching Agent"
            description="Matches competitor prices with small premium"
            behavior="Conservative pricing, high market share focus"
            performance="+15% revenue"
            icon="⚖️"
          />
          <StrategyCard
            title="Dynamic Pricing Agent"
            description="Uses AI to predict and adjust prices in real-time"
            behavior="Aggressive adjustments, maximizes profit per seat"
            performance="+22% revenue"
            icon="🧠"
          />
          <StrategyCard
            title="Cost-Plus Agent"
            description="Sets prices based on operational costs plus margin"
            behavior="Stable pricing, predictable revenue"
            performance="+8% revenue"
            icon="🧮"
          />
          <StrategyCard
            title="Competitive Undercutter"
            description="Consistently offers lowest prices to gain market share"
            behavior="High volume, low margin approach"
            performance="+5% revenue"
            icon="📉"
          />
        </div>
      </div>

      {/* Learning Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">🧠 AI Learning Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Key Findings</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Dynamic pricing agents outperform static pricing by 20-30%</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Price matching prevents destructive price wars</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">✓</span>
                <span>Market equilibrium emerges after 15-20 simulation rounds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">⚠️</span>
                <span>Aggressive undercutting can lead to revenue loss if not managed</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Strategic Recommendations</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">🎯</span>
                <span>Implement hybrid strategy: dynamic + price matching</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">📊</span>
                <span>Monitor competitor responses for 48-hour windows</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">🤝</span>
                <span>Consider cooperative pricing during off-peak seasons</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600">🚨</span>
                <span>Set price floors to prevent revenue-damaging wars</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Card Component
const StatusCard = ({ title, value, total, subtitle, icon, color }) => {
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
          <div className="text-lg font-bold text-gray-900">{value}{total ? `/${total}` : ''}</div>
          <div className="text-sm font-medium text-gray-600">{title}</div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
};

// Agent Card Component
const AgentCard = ({ agent }) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{agent.icon}</span>
        <div>
          <h4 className="font-semibold text-gray-900">{agent.name}</h4>
          <p className="text-sm text-gray-600">{agent.strategy}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-medium text-gray-700">Market Share</div>
          <div className="text-lg font-bold text-blue-600">{agent.marketShare}%</div>
        </div>
        <div>
          <div className="font-medium text-gray-700">Revenue</div>
          <div className="text-lg font-bold text-green-600">₹{agent.revenue?.toLocaleString()}</div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <span className={`px-2 py-1 rounded-full text-xs ${
          agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {agent.status}
        </span>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
          {agent.type}
        </span>
      </div>
    </div>
  );
};

// Strategy Card Component
const StrategyCard = ({ title, description, behavior, performance, icon }) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Behavior:</span>
              <p className="text-gray-600">{behavior}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Performance:</span>
              <p className="text-green-600 font-bold">{performance}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiAgentSimulation;