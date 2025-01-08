// Environment variables with defaults
export const {
  JWT_SECRET = 'your-secret-key',
  JWT_EXPIRES_IN = '1d',
  SMTP_HOST = 'smtp.gmail.com',
  SMTP_PORT = '587',
  SMTP_USER = 'your-email@gmail.com',
  SMTP_PASS = 'your-app-specific-password'
} = process.env;

// Book borrowing constants
export const BOOK_BORROW_LIMIT = 5;
export const BORROW_DURATION_DAYS = 14;
export const FINE_PER_DAY = 1.00; // in dollars

// API rate limiting
export const API_RATE_LIMIT = 100; // requests per 15 minutes

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100; 