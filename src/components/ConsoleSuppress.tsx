"use client";

import { useEffect } from 'react';

export default function ConsoleSuppress() {
  useEffect(() => {
    // Suppress console errors and warnings in production
    if (process.env.NODE_ENV === 'production') {
      const originalError = console.error;
      const originalWarn = console.warn;
      
      console.error = () => {};
      console.warn = () => {};
      
      // Restore on unmount (for development)
      return () => {
        console.error = originalError;
        console.warn = originalWarn;
      };
    }
  }, []);

  return null;
}

