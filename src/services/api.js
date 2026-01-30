/**
 * API Service for Stock Price Prediction System
 * 
 * This service handles all API calls to the backend for fetching:
 * - Company list
 * - Historical stock data
 * - Current stock prices
 * - Price predictions
 * 
 * When VITE_API_BASE_URL is not set, the application uses mock data
 * for development without a running backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Helper function to call API or return mock data
 * @param {string} path - API endpoint path
 * @param {Function} mockFn - Mock data generator function
 * @returns {Promise<any>} - API response or mock data
 */
async function callOrMock(path, mockFn) {
  if (API_BASE_URL) {
    const res = await fetch(`${API_BASE_URL}${path}`);
    if (!res.ok) {
      throw new Error(`API error (${res.status}): ${res.statusText}`);
    }
    return res.json();
  } else {
    // Simulate network latency in dev/mock mode
    await new Promise((r) => setTimeout(r, 500));
    return mockFn();
  }
}

// ——————————————————————————————————————————————
// Mock data & generators
// ——————————————————————————————————————————————

const mockCompanies = [
  { ticker: 'RELIANCE', name: 'Reliance Industries Limited' },
  { ticker: 'TCS', name: 'Tata Consultancy Services Limited' },
  { ticker: 'HDFCBANK', name: 'HDFC Bank Limited' },
  { ticker: 'INFY', name: 'Infosys Limited' },
  { ticker: 'HINDUNILVR', name: 'Hindustan Unilever Limited' },
  { ticker: 'ICICIBANK', name: 'ICICI Bank Limited' },
  { ticker: 'KOTAKBANK', name: 'Kotak Mahindra Bank Limited' },
  { ticker: 'LT', name: 'Larsen & Toubro Limited' },
  { ticker: 'SBIN', name: 'State Bank of India' },
  { ticker: 'BHARTIARTL', name: 'Bharti Airtel Limited' },
  { ticker: 'ASIANPAINT', name: 'Asian Paints Limited' },
  { ticker: 'MARUTI', name: 'Maruti Suzuki India Limited' },
  { ticker: 'BAJFINANCE', name: 'Bajaj Finance Limited' },
  { ticker: 'HCLTECH', name: 'HCL Technologies Limited' },
  { ticker: 'AXISBANK', name: 'Axis Bank Limited' },
  { ticker: 'ITC', name: 'ITC Limited' },
  { ticker: 'WIPRO', name: 'Wipro Limited' },
  { ticker: 'ULTRACEMCO', name: 'UltraTech Cement Limited' },
  { ticker: 'NESTLEIND', name: 'Nestlé India Limited' },
  { ticker: 'TITAN', name: 'Titan Company Limited' },
  { ticker: 'ADANIPORTS', name: 'Adani Ports and Special Economic Zone Limited' },
  { ticker: 'POWERGRID', name: 'Power Grid Corporation of India Limited' },
  { ticker: 'NTPC', name: 'NTPC Limited' },
  { ticker: 'BAJAJFINSV', name: 'Bajaj Finserv Limited' },
  { ticker: 'DRREDDY', name: "Dr. Reddys Laboratories Limited" },
  { ticker: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Limited' },
  { ticker: 'TECHM', name: 'Tech Mahindra Limited' },
  { ticker: 'ONGC', name: 'Oil and Natural Gas Corporation Limited' },
  { ticker: 'TATASTEEL', name: 'Tata Steel Limited' },
  { ticker: 'JSWSTEEL', name: 'JSW Steel Limited' },
  { ticker: 'HINDALCO', name: 'Hindalco Industries Limited' },
  { ticker: 'INDUSINDBK', name: 'IndusInd Bank Limited' },
  { ticker: 'CIPLA', name: 'Cipla Limited' },
  { ticker: 'GRASIM', name: 'Grasim Industries Limited' },
  { ticker: 'BRITANNIA', name: 'Britannia Industries Limited' },
  { ticker: 'COALINDIA', name: 'Coal India Limited' },
  { ticker: 'EICHERMOT', name: 'Eicher Motors Limited' },
  { ticker: 'BPCL', name: 'Bharat Petroleum Corporation Limited' },
  { ticker: 'HEROMOTOCO', name: 'Hero MotoCorp Limited' },
  { ticker: 'DIVISLAB', name: 'Divis Laboratories Limited' },
  // Add more companies as needed...
];

// ——————————————————————————————————————————————
// Mock data cache for consistent prices
// ——————————————————————————————————————————————

const mockDataCache = new Map();

/**
 * Get or generate cached historical data for a ticker
 * @param {string} ticker - Stock ticker symbol
 * @returns {Array} - Array of historical data points
 */
function getHistoricalDataCached(ticker) {
  if (!mockDataCache.has(ticker)) {
    mockDataCache.set(ticker, generateHistoricalData(ticker));
  }
  return mockDataCache.get(ticker);
}

/**
 * Generate mock historical data for a stock
 * @param {string} ticker - Stock ticker symbol
 * @returns {Array} - Array of historical data points
 */
function generateHistoricalData(ticker) {
  const data = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 5);
  let basePrice = Math.random() * 2000 + 500;

  for (let i = 0; i < 1825; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const volatility = (Math.random() - 0.5) * 0.1;
    basePrice = Math.max(10, basePrice * (1 + volatility));

    // Adjust for specific stocks
    if (ticker === 'TCS' || ticker === 'INFY') {
      basePrice *= 1.0002;
    } else if (ticker === 'RELIANCE') {
      basePrice *= 1.0001;
    }

    data.push({
      date: date.toISOString().split('T')[0],
      price: Number(basePrice.toFixed(2)),
    });
  }

  // Return weekly samples to reduce noise
  return data.filter((_, idx) => idx % 7 === 0);
}

/**
 * Generate mock prediction for a stock
 * @param {string} ticker - Stock ticker symbol
 * @param {number} year - Target year
 * @param {number} month - Target month
 * @param {number} day - Target day
 * @param {Array} historicalData - Historical data for the stock
 * @returns {Object} - Prediction data
 */
function generatePrediction(ticker, year, month, day, historicalData) {
  const lastPrice = historicalData[historicalData.length - 1]?.price || 1000;
  
  // Calculate exact days from now to target date
  const now = new Date();
  const targetDate = new Date(year, month - 1, day);
  const daysFromNow = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const tradingDaysFromNow = Math.max(0, Math.floor(daysFromNow * 252 / 365));
  
  const growthRate = Math.random() * 0.15 + 0.05;
  const volatility = (Math.random() - 0.5) * 0.3;
  const predictedPrice =
    lastPrice * Math.pow(1 + growthRate, tradingDaysFromNow / 252) * (1 + volatility);

  return {
    ticker,
    year,
    month,
    day,
    predictedPrice: Number(predictedPrice.toFixed(2)),
    currentPrice: lastPrice, // Include currentPrice for Expected Change calculation
    confidence: Math.floor(Math.random() * 30 + 70),
    createdAt: new Date().toISOString(),
  };
}

// ——————————————————————————————————————————————
// Exported API functions
// ——————————————————————————————————————————————

/**
 * Fetch the list of available companies
 * @returns {Promise<Array>} - Array of company objects
 */
export const fetchCompanies = () =>
  callOrMock('/api/companies', () => mockCompanies);

/**
 * Fetch 5 years of historical closing prices for a ticker
 * @param {string} ticker - Stock ticker symbol
 * @returns {Promise<Array>} - Array of historical data points
 */
export const fetchHistoricalData = (ticker) =>
  callOrMock(
    `/api/historical?ticker=${encodeURIComponent(ticker)}`,
    () => getHistoricalDataCached(ticker)
  );

/**
 * Fetch current stock price for a given ticker
 * @param {string} ticker - Stock ticker symbol
 * @returns {Promise<Object|null>} - Current price data or null
 */
export const fetchCurrentPrice = async (ticker) => {
  // Check if backend is available (only try if API_BASE_URL is set to a real URL, not the proxy)
  if (API_BASE_URL && API_BASE_URL !== '/api') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const res = await fetch(`${API_BASE_URL}/api/quote?ticker=${encodeURIComponent(ticker)}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        console.warn(`Quote API error (${res.status}): ${res.statusText}, falling back to mock data`);
        // Return mock data instead of null
        return generateMockQuote(ticker);
      }
      return res.json();
    } catch (error) {
      // If fetch fails (network error, timeout, etc.), use mock data
      console.warn(`Failed to fetch quote for ${ticker}, using mock data:`, error.message);
      return generateMockQuote(ticker);
    }
  } else {
    // Mock mode - return simulated current price based on last historical price
    return generateMockQuote(ticker);
  }
};

/**
 * Generate mock quote data
 * @param {string} ticker - Stock ticker symbol
 * @returns {Object} - Mock quote data
 */
function generateMockQuote(ticker) {
  const historical = getHistoricalDataCached(ticker);
  const lastPrice = historical[historical.length - 1]?.price || 1000;
  // Add small random variation to simulate real-time changes
  const variation = (Math.random() - 0.5) * 0.02 * lastPrice;
  return {
    currentPrice: Number((lastPrice + variation).toFixed(2)),
    previousClose: lastPrice,
    change: Number(variation.toFixed(2)),
    changePercent: Number(((variation / lastPrice) * 100).toFixed(2))
  };
}

/**
 * Fetch a predicted price for a ticker at a specific date
 * @param {string} ticker - Stock ticker symbol
 * @param {number} year - Target year
 * @param {number} month - Target month
 * @param {number} day - Target day
 * @returns {Promise<Object>} - Prediction data
 */
export const fetchPrediction = async (ticker, year, month, day) => {
  if (API_BASE_URL) {
    const res = await fetch(
      `${API_BASE_URL}/api/predict?ticker=${encodeURIComponent(ticker)}&year=${year}&month=${month}&day=${day}`
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `API error (${res.status}): ${res.statusText}`);
    }
    return res.json();
  } else {
    // Mock mode - use cached historical data for consistent prices
    return generatePrediction(ticker, year, month, day, getHistoricalDataCached(ticker));
  }
};

export default {
  fetchCompanies,
  fetchHistoricalData,
  fetchCurrentPrice,
  fetchPrediction,
};

