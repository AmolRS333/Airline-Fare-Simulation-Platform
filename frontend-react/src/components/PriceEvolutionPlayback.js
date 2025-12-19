import React, { useState, useEffect } from 'react';

const PriceEvolutionPlayback = ({ flightId }) => {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // milliseconds

  useEffect(() => {
    // Mock historical data - in real implementation, fetch from API
    const mockHistory = generateMockHistory();
    setHistory(mockHistory);
  }, [flightId]);

  useEffect(() => {
    let interval;
    if (isPlaying && history.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= history.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, history.length]);

  const generateMockHistory = () => {
    const history = [];
    const basePrice = 4500;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      // Simulate price evolution
      let multiplier = 1.0;

      // Early booking discount
      if (i < 20) multiplier *= 0.9;

      // Demand spikes
      if (i === 15 || i === 22) multiplier *= 1.4; // Festival periods
      if (i === 25) multiplier *= 1.6; // Last minute surge

      // Time-based surge
      const daysLeft = 30 - i;
      if (daysLeft <= 3) multiplier *= 1.3;

      const price = Math.round(basePrice * multiplier);

      history.push({
        date: date.toISOString().split('T')[0],
        price,
        multiplier: Math.round(multiplier * 100) / 100,
        day: i + 1,
        factors: generateFactorsForDay(i, daysLeft)
      });
    }

    return history;
  };

  const generateFactorsForDay = (dayIndex, daysLeft) => {
    const factors = [];

    if (daysLeft > 20) {
      factors.push({ name: 'Early Booking', impact: -450, color: '#10B981' });
    }

    if (dayIndex === 15 || dayIndex === 22) {
      factors.push({ name: 'Festival Surge', impact: 1800, color: '#EF4444' });
    }

    if (daysLeft <= 3) {
      factors.push({ name: 'Last Minute', impact: 1350, color: '#F59E0B' });
    }

    return factors;
  };

  const handleSliderChange = (e) => {
    const index = parseInt(e.target.value);
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetPlayback = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const currentEntry = history[currentIndex] || {};

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">⏱️ Price Evolution Over Time</h3>

      {history.length > 0 && (
        <>
          {/* Current Price Display */}
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              ₹{currentEntry.price?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600">
              Day {currentEntry.day} • {currentEntry.date}
            </div>
            <div className="text-sm text-gray-500">
              Multiplier: {currentEntry.multiplier}x
            </div>
          </div>

          {/* Factors Breakdown */}
          {currentEntry.factors && currentEntry.factors.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Price Factors:</h4>
              <div className="space-y-1">
                {currentEntry.factors.map((factor, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{factor.name}</span>
                    <span style={{ color: factor.color }}>
                      {factor.impact > 0 ? '+' : ''}₹{factor.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Playback Controls */}
          <div className="mb-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={togglePlayback}
                className={`px-4 py-2 rounded font-semibold ${
                  isPlaying ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                }`}
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>
              <button
                onClick={resetPlayback}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                🔄 Reset
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm">Speed:</span>
                <select
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="px-2 py-1 border rounded"
                >
                  <option value={2000}>0.5x</option>
                  <option value={1000}>1x</option>
                  <option value={500}>2x</option>
                  <option value={250}>4x</option>
                </select>
              </div>
            </div>

            {/* Progress Slider */}
            <input
              type="range"
              min="0"
              max={history.length - 1}
              value={currentIndex}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Day 1</span>
              <span>Day {history.length}</span>
            </div>
          </div>

          {/* Price Chart Visualization */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Price Trend</h4>
            <div className="relative h-32">
              <svg className="w-full h-full" viewBox="0 0 400 120">
                {/* Grid lines */}
                <line x1="0" y1="30" x2="400" y2="30" stroke="#E5E7EB" strokeWidth="1"/>
                <line x1="0" y1="60" x2="400" y2="60" stroke="#E5E7EB" strokeWidth="1"/>
                <line x1="0" y1="90" x2="400" y2="90" stroke="#E5E7EB" strokeWidth="1"/>

                {/* Price line */}
                {history.map((entry, index) => {
                  const x = (index / (history.length - 1)) * 400;
                  const y = 120 - ((entry.price - 4000) / (7000 - 4000)) * 120; // Normalize to 4000-7000 range

                  if (index === 0) return null;

                  const prevEntry = history[index - 1];
                  const prevX = ((index - 1) / (history.length - 1)) * 400;
                  const prevY = 120 - ((prevEntry.price - 4000) / (7000 - 4000)) * 120;

                  return (
                    <line
                      key={index}
                      x1={prevX}
                      y1={prevY}
                      x2={x}
                      y2={y}
                      stroke={index <= currentIndex ? '#3B82F6' : '#D1D5DB'}
                      strokeWidth="2"
                    />
                  );
                })}

                {/* Current position indicator */}
                {currentIndex < history.length && (
                  <circle
                    cx={(currentIndex / (history.length - 1)) * 400}
                    cy={120 - ((currentEntry.price - 4000) / (7000 - 4000)) * 120}
                    r="4"
                    fill="#EF4444"
                  />
                )}
              </svg>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>₹4,000</span>
              <span>₹7,000</span>
            </div>
          </div>

          {/* Key Insights */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Key Insights</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Early booking discount: Up to 10% off base fare</li>
              <li>• Festival surges: +40% during Diwali period</li>
              <li>• Last-minute pricing: +30% in final 3 days</li>
              <li>• Overall trend: Prices increase as departure approaches</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default PriceEvolutionPlayback;