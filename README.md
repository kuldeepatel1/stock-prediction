# Stock Market Price Prediction System

A comprehensive React application with Clerk authentication for predicting stock prices using AI/ML models. This system provides interactive charts, historical data visualization, and future price predictions for top Indian stocks.

## 🚀 Features

- **Clerk Authentication**: Secure user registration and login flows
- **Interactive Dashboard**: User-friendly interface with stock selection and analysis
- **Historical Data Visualization**: Interactive charts showing 5 years of stock price history
- **AI-Powered Predictions**: Future price predictions with confidence scores
- **Technical Indicators**: SMA, MACD, RSI, ADX, and Bollinger Bands
- **Stock Comparison**: Compare multiple stocks side by side
- **Favorites**: Save and track preferred stocks
- **Personalized Recommendations**: Buy/sell suggestions based on predictions
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Data**: Efficient data fetching with React Query

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, JavaScript
- **State Management**: Redux Toolkit, TanStack React Query
- **Authentication**: Clerk
- **Routing**: React Router v6
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Backend**: FastAPI (Python)
- **ML Models**: scikit-learn (joblib)

## 📦 Installation

### Frontend

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Stock-Price-Prediction-System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Update `.env.local` with your Clerk publishable key:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-key-here
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

### Backend

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the FastAPI server**
   ```bash
   uvicorn app.main:app --reload
   ```

   The backend will run at `http://localhost:8000`

## 🔧 Configuration

### Clerk Setup

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your publishable key to the `.env.local` file
4. Configure redirect URLs:
   - Sign-in redirect: `/sign-in`
   - Sign-up redirect: `/sign-up`
   - After sign-in/out: `/` (root)

### API Integration

The application includes a mock API mode for development. When `VITE_API_BASE_URL` is not set, the application uses mock data for all API calls.

**Available API Endpoints:**

- `GET /api/companies` - Fetch list of available stocks
- `GET /api/historical?ticker={ticker}` - Fetch historical price data (5 years)
- `GET /api/quote?ticker={ticker}` - Fetch current stock price and daily change
- `GET /api/predict?ticker={ticker}&year={year}&month={month}&day={day}` - Fetch price predictions

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Header.jsx       # Navigation header with auth
│   ├── LoadingSpinner.jsx
│   ├── ProtectedRoute.jsx  # Route protection with Clerk auth
│   ├── PredictionCard.jsx
│   └── StockChart.jsx   # Interactive price charts
├── pages/               # Route components
│   ├── Dashboard.jsx    # Main dashboard with stock analysis
│   ├── Home.jsx        # Landing page
│   ├── SignInPage.jsx  # Clerk sign-in integration
│   ├── SignUpPage.jsx  # Clerk sign-up integration
│   ├── Favorites.jsx   # User's favorite stocks
│   ├── Compare.jsx     # Stock comparison tool
│   ├── Recognize.jsx   # Stock recognition/analysis
│   └── Personalize.jsx # User preferences
├── services/           # API service layer
│   └── api.js         # Data fetching functions with mock support
├── slices/            # Redux slices for state management
│   ├── index.js       # Store configuration
│   ├── stocksSlice.js # Stock data state
│   ├── userSlice.js   # User/auth state
│   ├── predictionsSlice.js # Predictions state
│   └── favoritesSlice.js # Favorites state
├── App.jsx           # Main app component with routing and animations
└── main.jsx         # App entry point with providers

backend/
├── app/
│   ├── main.py       # FastAPI application entry point
│   ├── routes/
│   │   └── predict.py # Prediction API routes
│   ├── data/
│   │   └── companies.json # Stock ticker data
│   └── models/       # Trained ML models (.pkl files)
├── scripts/
│   └── train_models.py # Model training script
└── requirements.txt  # Python dependencies
```

## 📊 Technical Indicators

The dashboard includes the following technical indicators:

1. **SMA (Simple Moving Average)**: 20-day moving average for trend identification
2. **Bollinger Bands**: 20-day with 2 standard deviations for volatility
3. **MACD (Moving Average Convergence Divergence)**: 12/26/9 configuration
4. **RSI (Relative Strength Index)**: 14-day period for overbought/oversold
5. **ADX (Average Directional Index)**: 14-day for trend strength

## 🤖 Machine Learning Model

### Model Architecture

The prediction system uses machine learning models trained on historical stock data:

- **Algorithm**: Ensemble methods (Random Forest, Gradient Boosting)
- **Features**:
  - Historical price data (OHLCV)
  - Technical indicators
  - Volume patterns
  - Time-based features

### Model Training

Models are trained on 5 years of historical data and updated periodically:

```bash
# Train models
cd backend/scripts
python train_models.py
```

### Prediction Confidence

Each prediction includes a confidence score (70-100%) indicating the model's certainty.

## 🔐 Authentication

The application uses Clerk for secure authentication:

- **Sign Up**: User registration with email/password or social login
- **Sign In**: Secure login with remember me functionality
- **Protected Routes**: Dashboard and features require authentication
- **Session Management**: Automatic session handling and refresh

## 📱 Pages & Features

### Home Page
- Hero section with feature highlights
- Statistics display
- Call-to-action for registration
- Benefits and how it works sections

### Dashboard (Protected)
- Stock selection with search
- Interactive price charts
- Technical indicators
- Price predictions
- Favorites management

### Compare (Protected)
- Side-by-side stock comparison
- Combined chart visualization
- Predicted price comparison
- Change analysis

### Recognize (Protected)
- Top predicted prices ranking
- Sortable prediction results
- Current vs predicted comparison
- Percentage change display

### Personalize (Protected)
- Buy/sell recommendations
- Investment amount input
- Customizable date ranges
- Profit calculations

### Favorites (Protected)
- Quick access to saved stocks
- Favorites management
- Chart and prediction display

## 🚀 Deployment

### Vercel (Frontend Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard:**
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_API_BASE_URL` (your backend URL)
3. **Deploy automatically on push to main branch**

### Docker

The easiest way to run the entire project (frontend + backend) with a single command:

```bash
# Start both services
docker-compose up

# Build and start (first time or after changes)
docker-compose up --build

# Stop services
docker-compose down
```

This will start:
- **Frontend**: http://localhost:5173 (Vite dev server with hot-reload)
- **Backend**: http://localhost:8000 (FastAPI with uvicorn reload)

### Manual Build

```bash
# Build for production
npm run build

# Preview the build
npm run preview
```

## 🔮 How Data Fetching Works

### API Service Layer (`src/services/api.js`)

The API service handles all data fetching with a fallback to mock data:

```javascript
import { fetchCompanies, fetchHistoricalData, fetchPrediction, fetchCurrentPrice } from '../services/api';

// Fetch companies
const companies = await fetchCompanies();

// Fetch historical data
const historicalData = await fetchHistoricalData('RELIANCE.NS');

// Fetch prediction
const prediction = await fetchPrediction('RELIANCE.NS', 2028, 8, 22);
```

### Mock Data Mode

When `VITE_API_BASE_URL` is not set, the application uses mock data:

- **Companies**: 40+ Indian stocks with names
- **Historical Data**: 5 years of weekly price samples
- **Predictions**: Algorithmic price projections with confidence scores
- **Current Prices**: Simulated real-time prices

### Data Display

1. **Charts**: Recharts library renders interactive line charts
2. **Predictions**: Cards display current vs predicted prices
3. **Statistics**: High/Low/Average calculations
4. **Indicators**: Technical analysis in mini-charts

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `VITE_API_BASE_URL` | Backend API base URL | No (defaults to mock mode) |

## 🧪 Development

### Running in Mock Mode

By default, without setting `VITE_API_BASE_URL`, the application uses mock data for all API calls. This is useful for development without running the backend.

### Running with Backend

1. Start the backend: `uvicorn app.main:app --reload` (in backend directory)
2. Set `VITE_API_BASE_URL=http://localhost:8000/api` in `.env.local`
3. Start the frontend: `npm run dev`

### Redux Store

The application uses Redux Toolkit for client-side state:

```javascript
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedCompany } from '../slices/stocksSlice';
import { addFavorite } from '../slices/favoritesSlice';

// Access state
const companies = useSelector((state) => state.stocks.comanies);
const favorites = useSelector((state) => state.favorites.items);

// Update state
const dispatch = useDispatch();
dispatch(setSelectedCompany({ ticker: 'RELIANCE', name: 'Reliance Industries' }));
dispatch(addFavorite('RELIANCE'));
```

## ⚠️ Disclaimer

Stock predictions are for informational purposes only. Past performance does not guarantee future results. Please consult with financial advisors before making investment decisions.

## 📄 License

This project is for educational and personal use only.

---

**Built with ❤️ for stock market enthusiasts**

