// Logger utility - Suppress console errors/warnings in production
const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  error: (...args: any[]) => {
    if (!isProduction) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (!isProduction) {
      console.warn(...args);
    }
  },
  log: (...args: any[]) => {
    if (!isProduction) {
      console.log(...args);
    }
  },
  info: (...args: any[]) => {
    if (!isProduction) {
      console.info(...args);
    }
  },
};

