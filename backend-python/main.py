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

def calculate_dynamic_price(request: PriceRequest) -> dict:
    """
    Advanced dynamic pricing algorithm
    Factors:
    - Remaining seat percentage
    - Hours until departure
    - Demand simulation
    - Time-based surge windows
    - Historical trends
    """
    flight_id = request.flightId
    base_fare = request.baseFare
    available_seats = request.availableSeats
    total_seats = request.totalSeats
    
    try:
        departure = datetime.fromisoformat(request.departureTime.replace('Z', '+00:00'))
    except:
        departure = datetime.fromisoformat(request.departureTime)
    
    now = datetime.now(departure.tzinfo) if departure.tzinfo else datetime.now()
    hours_until_departure = (departure - now).total_seconds() / 3600
    
    # 1. Seat availability multiplier
    seat_percentage = (available_seats / total_seats) * 100
    if seat_percentage > 50:
        seat_multiplier = 0.9  # Discount for plenty of seats
    elif seat_percentage > 20:
        seat_multiplier = 1.0  # Standard price
    elif seat_percentage > 5:
        seat_multiplier = 1.3  # Premium for limited seats
    else:
        seat_multiplier = 1.5  # Very limited seats
    
    # 2. Time-based surge multiplier
    if hours_until_departure <= 0:
        time_multiplier = 0.5  # Expired flight
    elif hours_until_departure <= 2:
        time_multiplier = 1.8  # Last-minute spike
    elif hours_until_departure <= 6:
        time_multiplier = 1.5  # Urgent booking
    elif hours_until_departure <= 24:
        time_multiplier = 1.2  # Same day/next day
    elif hours_until_departure <= 72:
        time_multiplier = 1.0  # 3-day window
    else:
        time_multiplier = 0.95  # Early booking discount
    
    # 3. Demand simulation
    if flight_id not in demand_levels:
        demand_levels[flight_id] = {
            'level': random.choice(['low', 'medium', 'high']),
            'booking_count': 0,
            'spike_probability': random.uniform(0.1, 0.3)
        }
    
    demand_info = demand_levels[flight_id]
    
    # Simulate demand spikes every 5-15 minutes
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
    
    return {
        'price': round(price, 2),
        'multiplier': round(final_multiplier, 2),
        'demandLevel': demand_info['level'],
        'bookingCount': demand_info['booking_count'],
        'breakdown': {
            'baseFare': base_fare,
            'seatMultiplier': seat_multiplier,
            'timeMultiplier': time_multiplier,
            'demandMultiplier': demand_multiplier,
            'seatPercentage': round(seat_percentage, 2),
            'hoursUntilDeparture': round(hours_until_departure, 2),
        }
    }

@app.post('/api/price', response_model=PriceResponse)
async def calculate_price(request: PriceRequest):
    """
    Calculate dynamic price for a flight
    """
    try:
        result = calculate_dynamic_price(request)
        return PriceResponse(
            price=result['price'],
            multiplier=result['multiplier'],
            demandLevel=result['demandLevel'],
            bookingCount=result['bookingCount']
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/price/{flight_id}')
async def get_price_details(flight_id: str):
    """
    Get detailed pricing information for a flight
    """
    if flight_id in demand_levels:
        return demand_levels[flight_id]
    return {'message': 'No pricing data available for this flight'}

@app.get('/health')
async def health_check():
    return {'status': 'Dynamic pricing service is running'}

def simulate_demand_updates():
    """
    Background task to simulate demand changes
    """
    for flight_id in demand_levels:
        if random.random() < 0.3:
            demand_levels[flight_id]['level'] = random.choice(['low', 'medium', 'high', 'surge'])
            demand_levels[flight_id]['booking_count'] += random.randint(1, 5)
    print(f"[{datetime.now()}] Demand update completed. Active flights: {len(demand_levels)}")

# Setup background scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(simulate_demand_updates, 'interval', minutes=1)

@app.on_event("startup")
async def startup_event():
    scheduler.start()
    print("Dynamic pricing background scheduler started")

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()
    print("Dynamic pricing scheduler stopped")

if __name__ == '__main__':
    import uvicorn
    port = int(os.getenv('PYTHON_PORT', 8000))
    uvicorn.run(app, host='0.0.0.0', port=port)
