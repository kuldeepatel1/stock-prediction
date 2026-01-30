// Type definitions for the Stock Price Prediction System
// Note: In JavaScript, these are documented for reference purposes only

// Company object structure
// {
//   ticker: string,      // Stock ticker symbol (e.g., 'RELIANCE.NS')
//   name: string         // Full company name
// }

// Historical data structure
// {
//   date: string,        // Date in YYYY-MM-DD format
//   price: number        // Stock price
// }

// Prediction object structure
// {
//   ticker: string,              // Stock ticker symbol
//   year: number,                // Target prediction year
//   month?: number,              // Target prediction month (1-12)
//   day?: number,                // Target prediction day (1-31)
//   predictedPrice: number,      // Predicted stock price
//   currentPrice: number,        // Current stock price
//   confidence: number,          // Confidence score (0-100)
//   createdAt: string            // Timestamp when prediction was created
// }

// User object structure (from Clerk)
// {
//   id: string,                  // User ID
//   email: string,               // User email
//   firstName?: string,          // User's first name
//   lastName?: string,           // User's last name
//   image_url?: string           // User profile image URL
// }

// Quote object structure
// {
//   currentPrice: number,        // Current stock price
//   previousClose?: number,      // Previous day's closing price
//   change?: number,             // Price change from previous close
//   changePercent?: number       // Percentage change
// }

