import React, { useState, useEffect } from 'react';
import { flightService } from '../services';

const ExplainablePricing = ({ flight, onPriceUpdate }) => {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    if (flight) {
      fetchPriceExplanation();
    }
  }, [flight]);

  const fetchPriceExplanation = async () => {
    if (!flight) return;

    setLoading(true);
    try {
      // Mock API call - in real implementation, call the Python pricing service
      const mockPriceData = {
        price: 6800,
        multiplier: 1.51,
        demandLevel: 'high',
        bookingCount: 45,
        explanation: {
          baseFare: 4500,
          finalPrice: 6800,
          totalMultiplier: 1.51,
          breakdown: [
            {
              factor: 'Seat Availability',
              multiplier: 1.4,
              impact: 1800,
              reason: '15.2% seats available - Very limited seats - high demand',
              percentage: 15.2
            },
            {
              factor: 'Time to Departure',
              multiplier: 1.2,
              impact: 900,
              reason: '72.5 hours until departure - 3 days left - approaching departure',
              hours: 72.5
            },
            {
              factor: 'Demand Level',
              multiplier: 1.3,
              impact: 1350,
              reason: 'Current demand: High - 45 bookings',
              level: 'high'
            },
            {
              factor: 'Event Impact',
              multiplier: 1.4,
              impact: 1800,
              reason: 'Diwali Festival - expected demand surge'
            }
          ],
          metadata: {
            flightId: flight._id,
            calculatedAt: new Date().toISOString(),
            fraudAlerts: [],
            forecastAvailable: true
          }
        },
        forecast: {
          flightId: flight._id,
          forecastDays: 7,
          predictions: [
            { day: 1, predictedDemand: 0.8, confidence: 0.85, recommendedPrice: 5200 },
            { day: 3, predictedDemand: 0.9, confidence: 0.78, recommendedPrice: 4800 },
            { day: 5, predictedDemand: 0.95, confidence: 0.92, recommendedPrice: 4500 }
          ],
          insights: [
            "Demand spike expected in 3 days",
            "Consider proactive price adjustment"
          ]
        }
      };

      setPriceData(mockPriceData);
      if (onPriceUpdate) {
        onPriceUpdate(mockPriceData.price);
      }
    } catch (error) {
      console.error('Error fetching price explanation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFactorColor = (factor) => {
    const colors = {
      'Seat Availability': '#3B82F6',
      'Time to Departure': '#10B981',
      'Demand Level': '#F59E0B',
      'User Behavior': '#8B5CF6',
      'Event Impact': '#EF4444'
    };
    return colors[factor] || '#6B7280';
  };

  const getImpactColor = (impact) => {
    return impact > 0 ? '#EF4444' : '#10B981';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!priceData) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Price Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Dynamic Price</h3>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-blue-600">
              ₹{priceData.price.toLocaleString()}
            </span>
            <span className={`px-2 py-1 rounded text-sm font-semibold ${
              priceData.demandLevel === 'surge' ? 'bg-red-100 text-red-800' :
              priceData.demandLevel === 'high' ? 'bg-orange-100 text-orange-800' :
              priceData.demandLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {priceData.demandLevel.toUpperCase()} DEMAND
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {showBreakdown ? 'Hide' : 'Show'} Explanation
        </button>
      </div>

      {/* Price Breakdown */}
      {showBreakdown && (
        <div className="border-t pt-4">
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Base Fare</span>
              <span>₹{priceData.explanation.baseFare.toLocaleString()}</span>
            </div>

            {priceData.explanation.breakdown.map((item, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getFactorColor(item.factor) }}
                    ></div>
                    <span className="font-semibold text-gray-800">{item.factor}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className="font-bold"
                      style={{ color: getImpactColor(item.impact) }}
                    >
                      {item.impact > 0 ? '+' : ''}₹{Math.abs(item.impact).toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({item.multiplier}x)
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 ml-5">{item.reason}</p>

                {/* Progress bar for seat availability */}
                {item.factor === 'Seat Availability' && item.percentage !== undefined && (
                  <div className="ml-5 mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${100 - item.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.percentage}% seats remaining
                    </p>
                  </div>
                )}
              </div>
            ))}

            <div className="border-t pt-2 mt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Final Price</span>
                <span className="text-blue-600">
                  ₹{priceData.explanation.finalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Forecast Section */}
          {priceData.forecast && (
            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <h4 className="font-bold text-blue-900 mb-2">🎯 AI Demand Forecast</h4>
              <div className="space-y-2">
                {priceData.forecast.predictions.slice(0, 3).map((pred, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>Day {pred.day}:</span>
                    <span className={`font-semibold ${
                      pred.predictedDemand > 0.8 ? 'text-red-600' :
                      pred.predictedDemand > 0.6 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {(pred.predictedDemand * 100).toFixed(0)}% demand
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-blue-800">
                💡 {priceData.forecast.insights[0]}
              </div>
            </div>
          )}

          {/* Fraud Alert */}
          {priceData.explanation.metadata.fraudAlerts.length > 0 && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg mt-4">
              <div className="flex items-center gap-2">
                <span className="text-red-600">⚠️</span>
                <span className="font-semibold text-red-900">Security Alert</span>
              </div>
              <p className="text-sm text-red-800 mt-1">
                Suspicious activity detected. Price adjusted for security.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExplainablePricing;