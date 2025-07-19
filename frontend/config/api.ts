// API Configuration
// This file provides a centralized configuration for API endpoints

const getApiUrl = () => {
  // First try environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // For Vercel deployments, always use the Railway backend
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://fides-mentorship-system-production.up.railway.app/api';
  }
  
  // Fallback to production URL
  if (process.env.NODE_ENV === 'production') {
    return 'https://fides-mentorship-system-production.up.railway.app/api';
  }
  
  // Development default
  return 'http://localhost:3001/api';
};

const getWsUrl = () => {
  // First try environment variable
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  
  // For Vercel deployments, always use the Railway backend
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'wss://fides-mentorship-system-production.up.railway.app';
  }
  
  // Fallback to production URL
  if (process.env.NODE_ENV === 'production') {
    return 'wss://fides-mentorship-system-production.up.railway.app';
  }
  
  // Development default
  return 'ws://localhost:3001';
};

export const API_CONFIG = {
  API_URL: getApiUrl(),
  WS_URL: getWsUrl(),
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'FIDES Mentorship',
};

// Export individual constants for easier imports
export const API_URL = API_CONFIG.API_URL;
export const WS_URL = API_CONFIG.WS_URL;
export const APP_NAME = API_CONFIG.APP_NAME;