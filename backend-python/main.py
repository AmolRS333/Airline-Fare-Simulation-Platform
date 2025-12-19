from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import httpx
from apscheduler.schedulers.background import BackgroundScheduler
import json
import random

load_dotenv()

app = FastAPI(title="Flight Booking Dynamic Pricing Engine")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for pricing simulations
pricing_cache = {}
demand_levels = {}

class PriceRequest(BaseModel):
    flightId: str
    baseFare: float
    totalSeats: int
    availableSeats: int
    departureTime: str

class PriceResponse(BaseModel):
    price: float
    multiplier: float
    demandLevel: str
    bookingCount: int

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import httpx
from apscheduler.schedulers.background import BackgroundScheduler
import json
import random
import math
from typing import List, Dict, Optional
from enum import Enum

load_dotenv()

app = FastAPI(title="Flight Booking Dynamic Pricing Engine")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enhanced in-memory storage
pricing_cache = {}
demand_levels = {}
price_history = {}  # Store price evolution over time
events_db = {}  # Event-aware pricing
fraud_alerts = []  # Fraud detection
forecast_data = {}  # Demand forecasting

class DemandLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    SURGE = "surge"

class EventType(str, Enum):
    FESTIVAL = "festival"
    SPORTS = "sports"
    WEATHER = "weather"
    HOLIDAY = "holiday"

class PriceRequest(BaseModel):
    flightId: str
    baseFare: float
    totalSeats: int
    availableSeats: int
    departureTime: str
    userId: Optional[str] = None
    searchCount: Optional[int] = 0
    isGroupBooking: Optional[bool] = False

class PriceResponse(BaseModel):
    price: float
    multiplier: float
    demandLevel: str
    bookingCount: int
    explanation: Dict
    forecast: Optional[Dict] = None

class EventData(BaseModel):
    eventType: str
    name: str
    impact: float  # Price multiplier impact
    startDate: str
    endDate: str
    location: str

class WhatIfScenario(BaseModel):
    scenario: str  # "fuel_increase", "half_empty", "competitor_price_drop"
    value: float
    flightId: str

# Mock events database
def initialize_events():
    events_db.update({
        "diwali_2025": {
            "type": "festival",
            "name": "Diwali Festival",
            "impact": 1.4,
            "startDate": "2025-11-01",
            "endDate": "2025-11-15",
            "locations": ["Delhi", "Mumbai", "Bangalore"]
        },
        "ipl_final_2025": {
            "type": "sports",
            "name": "IPL Final 2025",
            "impact": 1.6,
            "startDate": "2025-05-30",
            "endDate": "2025-05-30",
            "locations": ["Mumbai", "Ahmedabad"]
        }
    })

def detect_fraud_activity(flight_id: str, user_id: str, search_count: int) -> Dict:
    """Fraud and abuse detection"""
    alerts = []

    # Check for bot-like behavior
    if search_count > 50:
        alerts.append("High search frequency detected - possible bot activity")

    # Check for suspicious patterns
    if flight_id in fraud_alerts and any(alert['userId'] == user_id for alert in fraud_alerts):
        alerts.append("Repeated suspicious activity from same user")

    if alerts:
        fraud_alerts.append({
            'flightId': flight_id,
            'userId': user_id,
            'alerts': alerts,
            'timestamp': datetime.now().isoformat()
        })

    return {'alerts': alerts, 'severity': len(alerts)}

def calculate_explainable_price(request: PriceRequest) -> dict:
    """
    Advanced explainable dynamic pricing algorithm with detailed breakdown
    """
    flight_id = request.flightId
    base_fare = request.baseFare
    available_seats = request.availableSeats
    total_seats = request.totalSeats
    user_id = request.userId or "anonymous"
    search_count = request.searchCount or 0
    is_group_booking = request.isGroupBooking or False

    try:
        departure = datetime.fromisoformat(request.departureTime.replace('Z', '+00:00'))
    except:
        departure = datetime.fromisoformat(request.departureTime)

    # Ensure both datetimes are timezone-naive for consistency
    if departure.tzinfo is not None:
        departure = departure.replace(tzinfo=None)
    now = datetime.now()
    hours_until_departure = (departure - now).total_seconds() / 3600

    # Initialize price history for this flight
    if flight_id not in price_history:
        price_history[flight_id] = []

    # Fraud detection
    fraud_info = detect_fraud_activity(flight_id, user_id, search_count)

    # 1. Seat availability factor (with flight-specific variation)
    seat_percentage = (available_seats / total_seats) * 100
    flight_variation = (hash(flight_id) % 20 - 10) / 100  # ±10% variation
    seat_percentage += flight_variation * seat_percentage  # Apply variation
    
    if seat_percentage > 80:
        seat_multiplier = 0.85
        seat_reason = "Plenty of seats available - early bird discount"
    elif seat_percentage > 50:
        seat_multiplier = 0.95
        seat_reason = "Good availability - standard pricing"
    elif seat_percentage > 20:
        seat_multiplier = 1.2
        seat_reason = "Limited seats - moderate surge"
    elif seat_percentage > 5:
        seat_multiplier = 1.4
        seat_reason = "Very limited seats - high demand"
    else:
        seat_multiplier = 1.8
        seat_reason = "Last few seats - maximum surge pricing"

    seat_impact = (seat_multiplier - 1) * base_fare

    # 2. Time-based surge factor
    if hours_until_departure <= 0:
        time_multiplier = 0.5
        time_reason = "Flight departed - price reduced"
    elif hours_until_departure <= 2:
        time_multiplier = 2.0
        time_reason = "Last 2 hours - emergency pricing"
    elif hours_until_departure <= 6:
        time_multiplier = 1.6
        time_reason = "Last 6 hours - urgent booking"
    elif hours_until_departure <= 24:
        time_multiplier = 1.3
        time_reason = "Last 24 hours - same-day premium"
    elif hours_until_departure <= 72:
        time_multiplier = 1.1
        time_reason = "3 days left - approaching departure"
    elif hours_until_departure <= 168:  # 7 days
        time_multiplier = 1.0
        time_reason = "Week ahead - standard pricing"
    else:
        time_multiplier = 0.9
        time_reason = "Early booking - advance purchase discount"

    time_impact = (time_multiplier - 1) * base_fare

    # Initialize demand levels with more variation
    if flight_id not in demand_levels:
        # Use flight_id hash to create deterministic but varied demand levels
        flight_hash = hash(flight_id) % 1000
        base_level = ['low', 'medium', 'high'][flight_hash % 3]
        demand_levels[flight_id] = {
            'level': base_level,
            'booking_count': random.randint(10, 50) + (flight_hash % 20),
            'spike_probability': 0.1 + (flight_hash % 50) / 100,  # 0.1 to 0.6
            'trend': random.choice(['increasing', 'stable', 'decreasing'])
        }

    demand_info = demand_levels[flight_id]

    # Simulate demand spikes with flight-specific variation
    seat_factor = available_seats / total_seats
    flight_specific_random = (hash(flight_id + str(hours_until_departure)) % 100) / 100
    
    if random.random() < demand_info['spike_probability'] + (flight_specific_random * 0.2):
        demand_info['level'] = random.choice(['high', 'surge'])
        demand_info['booking_count'] += random.randint(5, 15)

    demand_multipliers = {
        'low': 0.9,
        'medium': 1.0,
        'high': 1.3,
        'surge': 1.7
    }
    demand_multiplier = demand_multipliers.get(demand_info['level'], 1.0)
    demand_impact = (demand_multiplier - 1) * base_fare

    # 4. User behavior factor
    behavior_multiplier = 1.0
    behavior_reason = "Standard pricing"
    behavior_impact = 0

    if is_group_booking:
        behavior_multiplier = 1.15
        behavior_reason = "Group booking - volume discount applied"
        behavior_impact = (behavior_multiplier - 1) * base_fare
    elif search_count > 20:
        behavior_multiplier = 1.1
        behavior_reason = "Frequent searches - demand signal detected"
        behavior_impact = (behavior_multiplier - 1) * base_fare

    # 5. Event-aware pricing
    event_multiplier = 1.0
    event_reason = "No special events detected"
    event_impact = 0

    for event_id, event in events_db.items():
        event_start = datetime.fromisoformat(event['startDate'])
        event_end = datetime.fromisoformat(event['endDate'])

        if event_start <= departure <= event_end:
            # Mock location check (in real system, check flight destination)
            if random.random() < 0.3:  # 30% chance of event affecting this flight
                event_multiplier = event['impact']
                event_reason = f"{event['name']} - expected demand surge"
                event_impact = (event_multiplier - 1) * base_fare
                break

    # 6. Fraud adjustment (ignore artificial demand)
    fraud_multiplier = 1.0
    if fraud_info['alerts']:
        fraud_multiplier = 0.95  # Slight discount to discourage abuse
        fraud_impact = (fraud_multiplier - 1) * base_fare
    else:
        fraud_impact = 0

    # Calculate final price
    raw_price = base_fare * seat_multiplier * time_multiplier * demand_multiplier * behavior_multiplier * event_multiplier * fraud_multiplier

    # Apply floor and ceiling
    price_floor = base_fare * 0.7
    price_ceiling = base_fare * 3.0
    final_price = max(price_floor, min(raw_price, price_ceiling))

    final_multiplier = final_price / base_fare

    # Create detailed explanation
    explanation = {
        'baseFare': round(base_fare, 2),
        'finalPrice': round(final_price, 2),
        'totalMultiplier': round(final_multiplier, 2),
        'breakdown': [
            {
                'factor': 'Seat Availability',
                'multiplier': round(seat_multiplier, 2),
                'impact': round(seat_impact, 2),
                'reason': f"{seat_percentage:.1f}% seats available - {seat_reason}",
                'percentage': round(seat_percentage, 1)
            },
            {
                'factor': 'Time to Departure',
                'multiplier': round(time_multiplier, 2),
                'impact': round(time_impact, 2),
                'reason': f"{hours_until_departure:.1f} hours until departure - {time_reason}",
                'hours': round(hours_until_departure, 1)
            },
            {
                'factor': 'Demand Level',
                'multiplier': round(demand_multiplier, 2),
                'impact': round(demand_impact, 2),
                'reason': f"Current demand: {demand_info['level'].title()} - {demand_info['booking_count']} bookings",
                'level': demand_info['level']
            },
            {
                'factor': 'User Behavior',
                'multiplier': round(behavior_multiplier, 2),
                'impact': round(behavior_impact, 2),
                'reason': behavior_reason,
                'searches': search_count
            },
            {
                'factor': 'Event Impact',
                'multiplier': round(event_multiplier, 2),
                'impact': round(event_impact, 2),
                'reason': event_reason
            }
        ],
        'metadata': {
            'flightId': flight_id,
            'calculatedAt': datetime.now().isoformat(),
            'fraudAlerts': fraud_info['alerts'],
            'forecastAvailable': flight_id in forecast_data
        }
    }

    # Remove zero-impact factors for cleaner output
    explanation['breakdown'] = [item for item in explanation['breakdown'] if abs(item['impact']) > 0.01]

    # Store price history
    price_history[flight_id].append({
        'timestamp': datetime.now().isoformat(),
        'price': round(final_price, 2),
        'multiplier': round(final_multiplier, 2),
        'factors': explanation['breakdown']
    })

    # Keep only last 30 days of history
    cutoff_date = datetime.now() - timedelta(days=30)
    price_history[flight_id] = [
        entry for entry in price_history[flight_id]
        if datetime.fromisoformat(entry['timestamp']) > cutoff_date
    ]

    # Generate forecast if available
    forecast = None
    if flight_id in forecast_data:
        forecast = forecast_data[flight_id]

    return {
        'price': round(final_price, 2),
        'multiplier': round(final_multiplier, 2),
        'demandLevel': demand_info['level'],
        'bookingCount': demand_info['booking_count'],
        'explanation': explanation,
        'forecast': forecast,
        'fraudDetected': len(fraud_info['alerts']) > 0
    }
    if random.random() < demand_info['spike_probability']:
        demand_info['level'] = random.choice(['high', 'surge'])
    else:
        demand_info['level'] = random.choice(['low', 'medium', 'high'])
    
    demand_multipliers = {
        'low': 0.85,
        'medium': 1.0,
        'high': 1.25,
        'surge': 1.6
    }
    demand_multiplier = demand_multipliers.get(demand_info['level'], 1.0)
    
    # 4. Calculate final price
    price = base_fare * seat_multiplier * time_multiplier * demand_multiplier
    
    # Apply floor and ceiling
    price_floor = base_fare * 0.7
    price_ceiling = base_fare * 2.5
    price = max(price_floor, min(price, price_ceiling))
    
    final_multiplier = price / base_fare
    
@app.post('/api/price', response_model=PriceResponse)
async def calculate_price(request: PriceRequest):
    """
    Calculate dynamic price for a flight with detailed explanation
    """
    try:
        print(f"🔢 Calculating price for flight {request.flightId}: baseFare={request.baseFare}, availableSeats={request.availableSeats}/{request.totalSeats}")
        result = calculate_explainable_price(request)
        print(f"💰 Final price for flight {request.flightId}: ${result['price']:.2f} (multiplier: {result['multiplier']:.2f})")
        return PriceResponse(
            price=result['price'],
            multiplier=result['multiplier'],
            demandLevel=result['demandLevel'],
            bookingCount=result['bookingCount'],
            explanation=result['explanation'],
            forecast=result['forecast']
        )
    except Exception as e:
        print(f"❌ Error calculating price for flight {request.flightId}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/price/{flight_id}/history')
async def get_price_history(flight_id: str, days: int = 30):
    """
    Get price evolution history for playback
    """
    if flight_id not in price_history:
        return {'history': [], 'message': 'No price history available'}

    cutoff_date = datetime.now() - timedelta(days=days)
    history = [
        entry for entry in price_history[flight_id]
        if datetime.fromisoformat(entry['timestamp']) > cutoff_date
    ]

    return {
        'flightId': flight_id,
        'history': history,
        'days': days,
        'totalEntries': len(history)
    }

@app.get('/api/forecast/{flight_id}')
async def get_demand_forecast(flight_id: str):
    """
    AI-driven demand forecasting for next 7-30 days
    """
    if flight_id not in forecast_data:
        # Generate mock forecast
        forecast_data[flight_id] = generate_mock_forecast(flight_id)

    forecast = forecast_data[flight_id]
    return forecast

@app.post('/api/what-if')
async def what_if_scenario(scenario: WhatIfScenario):
    """
    What-if pricing simulator
    """
    flight_id = scenario.scenario
    scenario_type = scenario.scenario
    value = scenario.value

    # Mock current flight data (in real system, fetch from database)
    mock_flight = {
        'flightId': flight_id,
        'baseFare': 4500,
        'totalSeats': 150,
        'availableSeats': 75,
        'departureTime': (datetime.now() + timedelta(days=7)).isoformat()
    }

    # Apply scenario modifications
    if scenario_type == 'fuel_increase':
        mock_flight['baseFare'] *= (1 + value/100)  # value is percentage increase
    elif scenario_type == 'half_empty':
        mock_flight['availableSeats'] = mock_flight['totalSeats'] // 2
    elif scenario_type == 'competitor_price_drop':
        # Simulate competitive response
        mock_flight['baseFare'] *= (1 - value/100)

    # Calculate new price with scenario
    request = PriceRequest(**mock_flight)
    result = calculate_explainable_price(request)

    return {
        'scenario': scenario_type,
        'originalPrice': 4500,  # Mock original
        'newPrice': result['price'],
        'change': result['price'] - 4500,
        'changePercent': ((result['price'] - 4500) / 4500) * 100,
        'explanation': result['explanation']
    }

@app.get('/api/events')
async def get_events():
    """
    Get current events affecting pricing
    """
    return {'events': list(events_db.values())}

@app.get('/api/fraud-alerts')
async def get_fraud_alerts():
    """
    Get fraud detection alerts
    """
    return {'alerts': fraud_alerts[-50:]}  # Last 50 alerts

@app.get('/api/analytics/{flight_id}')
async def get_flight_analytics(flight_id: str):
    """
    Advanced analytics for admin dashboard
    """
    if flight_id not in price_history:
        return {'message': 'No analytics data available'}

    history = price_history[flight_id]

    # Calculate analytics
    prices = [entry['price'] for entry in history]
    multipliers = [entry['multiplier'] for entry in history]

    analytics = {
        'flightId': flight_id,
        'totalPricePoints': len(prices),
        'priceRange': {
            'min': min(prices) if prices else 0,
            'max': max(prices) if prices else 0,
            'avg': sum(prices) / len(prices) if prices else 0
        },
        'volatility': calculate_volatility(prices),
        'peakHours': find_peak_booking_hours(history),
        'demandPatterns': analyze_demand_patterns(history),
        'revenueOpportunities': calculate_missed_revenue(history)
    }

    return analytics

def generate_mock_forecast(flight_id: str) -> Dict:
    """Generate AI-driven demand forecast"""
    days = 30
    forecast = {
        'flightId': flight_id,
        'forecastDays': days,
        'predictions': [],
        'insights': []
    }

    base_demand = random.uniform(0.3, 0.8)

    for day in range(1, days + 1):
        # Simulate demand with trends and spikes
        trend_factor = 1 + (day / days) * 0.2  # Increasing trend
        seasonal_factor = 1 + 0.3 * math.sin(day * 2 * math.pi / 7)  # Weekly pattern
        random_factor = random.uniform(0.8, 1.2)

        predicted_demand = base_demand * trend_factor * seasonal_factor * random_factor
        predicted_demand = max(0.1, min(1.0, predicted_demand))

        forecast['predictions'].append({
            'day': day,
            'predictedDemand': round(predicted_demand, 3),
            'confidence': round(random.uniform(0.7, 0.95), 2),
            'recommendedPrice': round(4500 * (2 - predicted_demand), 2)  # Higher price for lower availability
        })

    # Generate insights
    forecast['insights'] = [
        "Demand spike expected in 5 days - consider proactive price increase",
        "Weekend pattern detected - prices should rise Friday-Sunday",
        "Overall upward trend suggests good revenue potential"
    ]

    return forecast

def calculate_volatility(prices: List[float]) -> float:
    """Calculate price volatility"""
    if len(prices) < 2:
        return 0

    changes = []
    for i in range(1, len(prices)):
        change = abs((prices[i] - prices[i-1]) / prices[i-1])
        changes.append(change)

    return sum(changes) / len(changes) if changes else 0

def find_peak_booking_hours(history: List[Dict]) -> Dict:
    """Find peak booking hours from history"""
    hour_counts = {}
    for entry in history:
        timestamp = datetime.fromisoformat(entry['timestamp'])
        hour = timestamp.hour
        hour_counts[hour] = hour_counts.get(hour, 0) + 1

    if not hour_counts:
        return {'peakHour': 12, 'bookings': 0}

    peak_hour = max(hour_counts, key=hour_counts.get)
    return {
        'peakHour': peak_hour,
        'bookings': hour_counts[peak_hour],
        'totalHours': len(hour_counts)
    }

def analyze_demand_patterns(history: List[Dict]) -> Dict:
    """Analyze demand patterns from price history"""
    if not history:
        return {'patterns': []}

    patterns = []
    surge_count = sum(1 for entry in history if entry['multiplier'] > 1.5)
    discount_count = sum(1 for entry in history if entry['multiplier'] < 0.95)

    if surge_count > len(history) * 0.3:
        patterns.append("High surge frequency - strong demand")
    if discount_count > len(history) * 0.2:
        patterns.append("Frequent discounts - excess capacity")

    return {'patterns': patterns, 'surgeRatio': surge_count / len(history) if history else 0}

def calculate_missed_revenue(history: List[Dict]) -> Dict:
    """Calculate potential missed revenue opportunities"""
    if not history:
        return {'missed': 0, 'opportunities': []}

    # Simple heuristic: if price was below average for high-demand periods
    prices = [entry['price'] for entry in history]
    avg_price = sum(prices) / len(prices)

    missed_opportunities = sum(
        max(0, avg_price - price) for price in prices
        if any(factor['level'] == 'surge' for factor in entry.get('factors', []))
    )

    return {
        'missedRevenue': round(missed_opportunities, 2),
        'opportunities': len([p for p in prices if p < avg_price * 0.8])
    }

def simulate_demand_updates():
    """
    Enhanced background task with advanced simulations
    """
    for flight_id in demand_levels:
        # Update demand levels
        if random.random() < 0.3:
            demand_levels[flight_id]['level'] = random.choice(['low', 'medium', 'high', 'surge'])
            demand_levels[flight_id]['booking_count'] += random.randint(1, 8)

        # Simulate price learning
        if flight_id in price_history and len(price_history[flight_id]) > 10:
            recent_prices = [entry['price'] for entry in price_history[flight_id][-10:]]
            avg_recent = sum(recent_prices) / len(recent_prices)

            # Adjust demand based on recent performance
            if avg_recent > 5000:  # High prices
                demand_levels[flight_id]['spike_probability'] *= 0.95  # Reduce spikes
            elif avg_recent < 4000:  # Low prices
                demand_levels[flight_id]['spike_probability'] *= 1.05  # Increase spikes

    print(f"[{datetime.now()}] Advanced demand simulation completed. Active flights: {len(demand_levels)}")

# Initialize events on startup
initialize_events()

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Flight Booking Dynamic Pricing Engine...")
    print("📊 Advanced AI-powered pricing with real-time demand simulation")
    print("🌐 Server will be available at http://localhost:8000")
    print("📈 Features: Explainable pricing, demand forecasting, fraud detection, multi-agent simulation")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
