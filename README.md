# Flight Booking Simulator with Dynamic Pricing

A comprehensive, production-grade flight booking simulator built with MERN stack and Python FastAPI, featuring advanced dynamic pricing, real-time booking, and a complete admin panel.

## 🏗️ Project Architecture

This project consists of three main components:

### 1. **Backend (Node.js + Express)**
- User authentication with JWT
- Flight search and management
- Multi-step booking workflow with concurrency control
- Admin dashboard APIs
- Integration with Python pricing service
- Email notifications
- PDF receipt generation

### 2. **Dynamic Pricing Engine (Python + FastAPI)**
- Real-time dynamic price calculation
- Demand simulation with background scheduler
- Seat availability-based pricing
- Time-to-departure surge pricing
- Historical fare trend analysis
- REST API endpoints for Node backend

### 3. **Frontend (React)**
- Responsive user interface
- Flight search with real-time price refresh
- Multi-step booking workflow
- User booking management
- Admin dashboard with analytics
- PDF receipt download

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm
- Python 3.8+
- MongoDB (running on localhost:27017)

### Setup

#### 1. Backend Node.js Setup
```bash
cd backend-node
npm install
cp .env.example .env
# Update .env with your configuration
npm run dev
```

Server runs on `http://localhost:5000`

#### 2. Python FastAPI Setup
```bash
cd backend-python
pip install -r requirements.txt
cp .env.example .env
python main.py
```

Service runs on `http://localhost:8000`

#### 3. Frontend React Setup
```bash
cd frontend-react
npm install
cp .env.example .env
npm start
```

Frontend runs on `http://localhost:3000`

## 📌 Key Features

### ✅ User Authentication
- Register and Login with JWT
- Forgot password functionality
- Role-based access control (customer/admin)
- Refresh token support

### 🛫 Flight Search
- Search by origin, destination, and date
- Real-time dynamic pricing from Python service
- Sort by price, duration, departure time
- Filter by price range
- Auto-refresh prices every 10 seconds

### ✈️ Dynamic Pricing Engine
- **Seat Availability Multiplier**: Discounts for plenty of seats, premiums for limited availability
- **Time-Based Surge**: Last-minute price increases, early booking discounts
- **Demand Simulation**: Random demand spikes every 1-5 minutes
- **Historical Trends**: Based on past booking patterns
- **Price Floor & Ceiling**: Prevents extreme price fluctuations

### 🧾 Booking System
- Multi-step booking process (seats → passengers → payment)
- Concurrency-safe seat reservation with 2-minute locks
- Simulated payment processing
- Automatic PNR generation (6-character alphanumeric)
- Seat confirmation after payment
- Booking receipt PDF generation
- Email confirmation (Brevo integration)

### ❌ Booking Cancellation
- Flexible cancellation with refund calculation
- Time-based refund percentages:
  - 24+ hours before: 100% refund
  - 6-24 hours: 75% refund
  - 2-6 hours: 50% refund
  - <2 hours: No refund
- Cancellation history tracking

### 🛠️ Admin Panel
- User management with role assignment
- Flight CRUD operations
- Airline and airport management
- Comprehensive analytics:
  - Total users, bookings, revenue
  - Booking trends
  - Top routes
  - Pricing surge events
  - Peak booking hours
  - Revenue analytics
- Real-time dashboard charts

### 🔐 Security
- Password hashing with bcryptjs
- JWT with refresh tokens
- Input validation with Joi
- Rate limiting on critical endpoints
- CORS protection
- Helmet.js for HTTP headers

### 📊 Advanced Analytics
- Pricing trend analysis
- Seat inventory tracking
- Peak booking hours heatmap
- Demand level distribution
- Revenue by airline
- Cancellation rate tracking

## 🗂️ Database Schema

### Users
```
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: enum ['customer', 'admin'],
  phone: String,
  createdAt: Date,
  lastLogin: Date
}
```

### Flights
```
{
  airline: ObjectId (ref: Airline),
  flightNumber: String,
  origin: ObjectId (ref: Airport),
  destination: ObjectId (ref: Airport),
  departureTime: Date,
  arrivalTime: Date,
  baseFare: Number,
  totalSeats: Number,
  availableSeats: Number,
  seatMap: Map<String, String>,
  currentDynamicPrice: Number,
  dynamicPricingEnabled: Boolean
}
```

### Bookings
```
{
  userId: ObjectId (ref: User),
  flightId: ObjectId (ref: Flight),
  pnr: String (unique),
  seatNumbers: [String],
  passengers: [{name, email, phone, dateOfBirth}],
  pricePaid: Number,
  status: enum ['pending', 'booked', 'cancelled'],
  paymentStatus: enum ['pending', 'completed', 'failed', 'refunded'],
  createdAt: Date
}
```

### FareHistory
```
{
  flightId: ObjectId,
  timestamp: Date,
  calculatedFare: Number,
  dynamicMultiplier: Number,
  remainingSeatsPercentage: Number,
  demandLevel: enum ['low', 'medium', 'high', 'surge']
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Password reset
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Flights
- `GET /api/flights/search` - Search flights
- `GET /api/flights/:id` - Get flight details
- `GET /api/flights/:id/fare-history` - Get fare history
- `POST /api/flights` - Create flight (admin)
- `PUT /api/flights/:id` - Update flight (admin)
- `DELETE /api/flights/:id` - Delete flight (admin)

### Bookings
- `POST /api/bookings/select-seats` - Lock seats
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/pnr/:pnr` - Get booking by PNR
- `DELETE /api/bookings/:id` - Cancel booking

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `GET /api/admin/analytics` - Get overall analytics
- `GET /api/admin/analytics/bookings` - Get booking analytics
- `GET /api/admin/analytics/pricing` - Get pricing analytics
- `GET /api/admin/analytics/revenue` - Get revenue analytics
- `GET /api/admin/bookings` - Get all bookings

## 🔗 External API Integrations

### Airports & Airlines
Currently uses mock data. Can be replaced with:
- **AviationStack** (Free tier available)
- **AirLabs** (Free tier available)
- Custom airline/airport database

### Email Service
- **Brevo** (formerly Sendinblue) - Free tier for transactional emails
  - Booking confirmations
  - Cancellation notifications
  - Flight reminders

## 🧪 Testing

### Backend Tests
```bash
npm run test
```

### Python Tests
```bash
pytest
```

### Frontend Tests
```bash
npm run test
```

## 📦 Key Dependencies

### Node.js
- express, mongoose, bcryptjs, jsonwebtoken
- axios, joi, express-rate-limit
- pdf-lib, nodemailer

### Python
- fastapi, uvicorn, pydantic
- APScheduler, python-dotenv

### React
- react-router-dom, axios, recharts
- luxon, pdf-lib, react-icons, tailwindcss

## 🌐 Timezone Support

All dates/times use ISO 8601 format with timezone information. The frontend uses Luxon for timezone conversions.

## 📧 Email Notifications

The system sends emails for:
- Booking confirmations
- Booking cancellations
- Flight reminders (24 hours before departure)
- Password reset links

## 🔄 Real-Time Features

- **Price Refresh**: Every 10 seconds on search page
- **Demand Updates**: Every 1 minute in pricing engine
- **Seat Lock Expiry**: 2 minutes timeout
- **Analytics Updates**: Real-time on admin dashboard

## 🚦 Rate Limiting

- **General**: 100 requests per 15 minutes
- **Auth**: 5 requests per 15 minutes
- **Search**: 50 requests per minute
- **Booking**: 10 bookings per minute

## 🎯 Example Usage

### 1. Register & Login
```
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+1234567890"
}
```

### 2. Search Flights
```
GET /api/flights/search?origin=JFK&destination=LAX&departureDate=2024-01-15&sortBy=price
```

### 3. Select Seats
```
POST /api/bookings/select-seats
{
  "flightId": "...",
  "seatNumbers": ["1A", "1B"]
}
```

### 4. Create Booking
```
POST /api/bookings
{
  "flightId": "...",
  "seatNumbers": ["1A", "1B"],
  "passengers": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "dateOfBirth": "1990-01-01"
    }
  ]
}
```

## 📖 Directory Structure

```
FBS-DP/
├── backend-node/
│   ├── src/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── config/
│   ├── tests/
│   ├── package.json
│   └── server.js
├── backend-python/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
└── frontend-react/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── services/
    │   ├── context/
    │   ├── utils/
    │   ├── admin/
    │   └── App.js
    ├── public/
    ├── package.json
    └── tailwind.config.js
```

## 🔧 Configuration

### Backend .env
```
MONGODB_URI=mongodb://localhost:27017/flight-booking-simulator
PORT=5000
JWT_SECRET=your_secret_key
PYTHON_PRICING_SERVICE_URL=http://localhost:8000
BREVO_API_KEY=your_brevo_key
```

### Python .env
```
PYTHON_PORT=8000
MONGODB_URI=mongodb://localhost:27017/flight-booking-simulator
```

### Frontend .env
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_PYTHON_PRICING_URL=http://localhost:8000
```

## 🚢 Deployment Notes

- No Docker required (as per requirements)
- For production:
  - Use managed MongoDB (MongoDB Atlas)
  - Configure proper environment variables
  - Set up SSL/TLS
  - Use production-grade email service
  - Implement proper logging and monitoring
  - Set up CI/CD pipeline

## 📝 License

This project is built for educational and demonstration purposes.

## 🤝 Support

For issues, feature requests, or questions, please refer to the documentation or create an issue.

---

**Built with ❤️ using MERN + Python FastAPI**
