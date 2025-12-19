import React, { useState, useEffect } from 'react';
import { adminService } from '../services';

const EventAwarePricing = () => {
  const [events, setEvents] = useState([]);
  const [activeEvents, setActiveEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddEvent, setShowAddEvent] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const [eventsData, activeData] = await Promise.all([
        adminService.getEvents(),
        adminService.getActiveEvents()
      ]);
      setEvents(eventsData);
      setActiveEvents(activeData);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (eventData) => {
    try {
      await adminService.addEvent(eventData);
      fetchEvents();
      setShowAddEvent(false);
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  };

  const updateEventPricing = async (eventId, pricingRule) => {
    try {
      await adminService.updateEventPricing(eventId, pricingRule);
      fetchEvents();
    } catch (error) {
      console.error('Failed to update event pricing:', error);
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
          <h2 className="text-2xl font-bold text-gray-900">🎪 Event-Aware Dynamic Pricing</h2>
          <p className="text-gray-600">Automatically adjust prices based on festivals, weather, and market events</p>
        </div>
        <button
          onClick={() => setShowAddEvent(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Event
        </button>
      </div>

      {/* Active Events Impact */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">🔥 Currently Active Events</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeEvents.map((event, index) => (
            <ActiveEventCard key={index} event={event} />
          ))}
          {activeEvents.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No active events currently affecting pricing
            </div>
          )}
        </div>
      </div>

      {/* Event Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">📅 Festival & Holiday Events</h3>
          <div className="space-y-3">
            {events.filter(e => e.category === 'festival').map((event, index) => (
              <EventCard
                key={index}
                event={event}
                onUpdatePricing={updateEventPricing}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">🌦️ Weather Events</h3>
          <div className="space-y-3">
            {events.filter(e => e.category === 'weather').map((event, index) => (
              <EventCard
                key={index}
                event={event}
                onUpdatePricing={updateEventPricing}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">🏢 Business Events</h3>
          <div className="space-y-3">
            {events.filter(e => e.category === 'business').map((event, index) => (
              <EventCard
                key={index}
                event={event}
                onUpdatePricing={updateEventPricing}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">🎯 Market Events</h3>
          <div className="space-y-3">
            {events.filter(e => e.category === 'market').map((event, index) => (
              <EventCard
                key={index}
                event={event}
                onUpdatePricing={updateEventPricing}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Event Impact Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">📊 Event Impact Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ImpactCard
            title="Revenue from Events"
            value="₹2,45,000"
            change="+18%"
            description="Additional revenue from event-based pricing"
            icon="💰"
            color="green"
          />
          <ImpactCard
            title="Average Price Surge"
            value="35%"
            change="+5%"
            description="Average price increase during events"
            icon="📈"
            color="blue"
          />
          <ImpactCard
            title="Event Detection Rate"
            value="94%"
            change="+2%"
            description="Accuracy of automatic event detection"
            icon="🎯"
            color="purple"
          />
        </div>
      </div>

      {/* Automated Event Detection */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">🤖 Automated Event Detection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Real-time Monitoring</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Weather API integration for storm/rain alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Calendar API for holidays and festivals</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Social media sentiment analysis</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span>News API for breaking event detection</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Smart Triggers</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-blue-600">⚡</span>
                <span>Automatic 15% surge for major festivals</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-600">🌧️</span>
                <span>25% increase for severe weather events</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-600">🏢</span>
                <span>Premium pricing for business conferences</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-600">📰</span>
                <span>Dynamic response to market news</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <AddEventModal
          onClose={() => setShowAddEvent(false)}
          onAdd={addEvent}
        />
      )}
    </div>
  );
};

// Active Event Card Component
const ActiveEventCard = ({ event }) => {
  return (
    <div className="bg-white border-l-4 border-orange-500 p-4 rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-gray-900">{event.name}</h4>
          <p className="text-sm text-gray-600">{event.description}</p>
        </div>
        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
          Active
        </span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Impact: <span className="font-bold text-orange-600">+{event.impact}%</span></span>
        <span className="text-gray-600">Expires: {event.endDate}</span>
      </div>
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, onUpdatePricing }) => {
  const [showPricing, setShowPricing] = useState(false);

  const getCategoryColor = (category) => {
    const colors = {
      festival: 'bg-purple-100 text-purple-800',
      weather: 'bg-blue-100 text-blue-800',
      business: 'bg-green-100 text-green-800',
      market: 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{event.name}</h4>
            <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(event.category)}`}>
              {event.category}
            </span>
          </div>
          <p className="text-sm text-gray-600">{event.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-gray-900">{event.date}</div>
          <div className="text-xs text-gray-500">{event.duration}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{event.expectedImpact}%</div>
          <div className="text-xs text-gray-500">Expected Impact</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{event.affectedRoutes}</div>
          <div className="text-xs text-gray-500">Routes Affected</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{event.confidence}%</div>
          <div className="text-xs text-gray-500">Confidence</div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowPricing(!showPricing)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showPricing ? 'Hide Pricing' : 'Configure Pricing'}
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdatePricing(event.id, { type: 'surge', value: 20 })}
            className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700"
          >
            Apply Surge
          </button>
          <button
            onClick={() => onUpdatePricing(event.id, { type: 'discount', value: 10 })}
            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
          >
            Add Discount
          </button>
        </div>
      </div>

      {showPricing && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h5 className="font-semibold text-gray-900 mb-3">Pricing Configuration</h5>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surge Percentage
                </label>
                <input
                  type="number"
                  defaultValue={event.pricing?.surge || 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => onUpdatePricing(event.id, { type: 'surge', value: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Price
                </label>
                <input
                  type="number"
                  defaultValue={event.pricing?.minPrice || 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => onUpdatePricing(event.id, { type: 'minPrice', value: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Affected Routes
              </label>
              <select
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                defaultValue={event.affectedRoutesList || []}
              >
                <option value="domestic">All Domestic</option>
                <option value="international">All International</option>
                <option value="major-cities">Major Cities</option>
                <option value="tourist">Tourist Destinations</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Impact Card Component
const ImpactCard = ({ title, value, change, description, icon, color }) => {
  const colorClasses = {
    green: 'border-green-200 bg-green-50',
    blue: 'border-blue-200 bg-blue-50',
    purple: 'border-purple-200 bg-purple-50'
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
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
};

// Add Event Modal Component
const AddEventModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'festival',
    description: '',
    date: '',
    duration: '',
    expectedImpact: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Add New Event</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="festival">Festival/Holiday</option>
              <option value="weather">Weather</option>
              <option value="business">Business Event</option>
              <option value="market">Market Event</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <input
                type="text"
                placeholder="e.g., 3 days"
                value={formData.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Price Impact (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.expectedImpact}
              onChange={(e) => handleChange('expectedImpact', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventAwarePricing;