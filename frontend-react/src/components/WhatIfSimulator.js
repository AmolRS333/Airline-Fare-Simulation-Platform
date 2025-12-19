import React, { useState } from 'react';

const WhatIfSimulator = ({ flightId }) => {
  const [scenarios, setScenarios] = useState([
    {
      id: 'fuel_increase',
      name: 'Fuel Price Increase',
      description: 'What if fuel prices increase?',
      value: 20,
      unit: '%',
      active: false
    },
    {
      id: 'half_empty',
      name: 'Flight Half Empty',
      description: 'What if only half the seats are booked?',
      value: 50,
      unit: '%',
      active: false
    },
    {
      id: 'competitor_price_drop',
      name: 'Competitor Price Drop',
      description: 'What if competitors lower prices?',
      value: 15,
      unit: '%',
      active: false
    },
    {
      id: 'demand_spike',
      name: 'Demand Spike',
      description: 'What if demand suddenly increases?',
      value: 200,
      unit: '%',
      active: false
    },
    {
      id: 'weather_delay',
      name: 'Weather Disruption',
      description: 'What if weather causes delays?',
      value: 25,
      unit: '%',
      active: false
    }
  ]);

  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const handleScenarioChange = (scenarioId, field, value) => {
    setScenarios(prev => prev.map(scenario =>
      scenario.id === scenarioId
        ? { ...scenario, [field]: value }
        : scenario
    ));
  };

  const runSimulation = async () => {
    setLoading(true);

    // Mock simulation results - in real implementation, call API
    const mockResults = {};

    scenarios.forEach(scenario => {
      if (scenario.active) {
        const basePrice = 4500;
        let newPrice = basePrice;

        switch (scenario.id) {
          case 'fuel_increase':
            newPrice = basePrice * (1 + scenario.value / 100);
            break;
          case 'half_empty':
            // Lower demand means lower price
            newPrice = basePrice * 0.8;
            break;
          case 'competitor_price_drop':
            // Competitive response - slight price drop
            newPrice = basePrice * (1 - scenario.value / 100);
            break;
          case 'demand_spike':
            newPrice = basePrice * (1 + scenario.value / 100);
            break;
          case 'weather_delay':
            // Weather disruptions increase prices
            newPrice = basePrice * (1 + scenario.value / 100);
            break;
        }

        mockResults[scenario.id] = {
          originalPrice: basePrice,
          newPrice: Math.round(newPrice),
          change: Math.round(newPrice - basePrice),
          changePercent: Math.round(((newPrice - basePrice) / basePrice) * 100),
          explanation: generateExplanation(scenario)
        };
      }
    });

    setTimeout(() => {
      setResults(mockResults);
      setLoading(false);
    }, 1500);
  };

  const generateExplanation = (scenario) => {
    const explanations = {
      fuel_increase: `Fuel cost increase of ${scenario.value}% directly impacts base fare. Airlines typically pass 70-80% of fuel costs to passengers.`,
      half_empty: `With only ${scenario.value}% occupancy, airline needs to stimulate demand through lower prices to avoid revenue loss.`,
      competitor_price_drop: `Competitive pressure requires matching or beating competitor prices to maintain market share.`,
      demand_spike: `Sudden demand increase allows dynamic pricing to capture additional revenue from price-sensitive customers.`,
      weather_delay: `Weather disruptions create uncertainty, allowing airlines to implement surge pricing for guaranteed departure.`
    };
    return explanations[scenario.id] || 'Scenario impact calculated';
  };

  const resetSimulation = () => {
    setScenarios(prev => prev.map(s => ({ ...s, active: false })));
    setResults({});
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">🔬 What-If Pricing Simulator</h3>
      <p className="text-gray-600 mb-6">
        Test how different scenarios affect flight pricing. Select scenarios and adjust parameters to see real-time price changes.
      </p>

      {/* Scenario Selection */}
      <div className="space-y-4 mb-6">
        {scenarios.map(scenario => (
          <div key={scenario.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={scenario.active}
                  onChange={(e) => handleScenarioChange(scenario.id, 'active', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <h4 className="font-semibold">{scenario.name}</h4>
                  <p className="text-sm text-gray-600">{scenario.description}</p>
                </div>
              </div>
            </div>

            {scenario.active && (
              <div className="ml-7 flex items-center gap-4">
                <label className="text-sm font-medium">Impact:</label>
                <input
                  type="range"
                  min="0"
                  max={scenario.id.includes('spike') ? '300' : '50'}
                  value={scenario.value}
                  onChange={(e) => handleScenarioChange(scenario.id, 'value', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-bold min-w-[60px]">
                  {scenario.value}{scenario.unit}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={runSimulation}
          disabled={loading || !scenarios.some(s => s.active)}
          className={`px-6 py-2 rounded font-semibold ${
            loading || !scenarios.some(s => s.active)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? '🔄 Running Simulation...' : '🚀 Run Simulation'}
        </button>
        <button
          onClick={resetSimulation}
          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          🔄 Reset
        </button>
      </div>

      {/* Results */}
      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold">📊 Simulation Results</h4>

          {Object.entries(results).map(([scenarioId, result]) => {
            const scenario = scenarios.find(s => s.id === scenarioId);
            return (
              <div key={scenarioId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-semibold text-gray-800">{scenario.name}</h5>
                    <p className="text-sm text-gray-600">{scenario.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{result.newPrice.toLocaleString()}
                    </div>
                    <div className={`text-sm font-semibold ${
                      result.change > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {result.change > 0 ? '+' : ''}₹{result.change} ({result.changePercent}%)
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <p className="text-sm text-gray-700">{result.explanation}</p>
                </div>

                {/* Price Comparison Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Original: ₹{result.originalPrice.toLocaleString()}</span>
                    <span>New: ₹{result.newPrice.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (result.newPrice / result.originalPrice) * 50)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Summary Insights */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2">💡 Key Insights</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Fuel costs have the most direct impact on pricing</li>
              <li>• Low occupancy forces airlines to discount aggressively</li>
              <li>• Competitive pressure can trigger price wars</li>
              <li>• External factors (weather, events) create pricing opportunities</li>
            </ul>
          </div>
        </div>
      )}

      {/* Educational Note */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-yellow-600 text-xl">📚</span>
          <div>
            <h5 className="font-semibold text-yellow-900">Real-World Application</h5>
            <p className="text-sm text-yellow-800 mt-1">
              Airlines use similar simulators to optimize revenue management. Factors like fuel prices,
              competition, and demand patterns are continuously monitored to adjust pricing strategies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIfSimulator;