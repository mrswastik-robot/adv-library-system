export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export const BOOK_BORROW_LIMIT = 3;
export const BORROW_DURATION_DAYS = 14;
export const FINE_PER_DAY = 1; // in USD

export const EMAIL_FROM = process.env.EMAIL_FROM || 'library@example.com';

// Rate limiting
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100; 