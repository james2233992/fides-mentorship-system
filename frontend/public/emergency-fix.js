// Emergency fix for production issues
// This file provides temporary patches while waiting for Vercel to update

(function() {
  'use strict';
  
  console.log('[Emergency Fix] Applying production patches...');
  
  // Patch 1: Safe array methods
  if (!window.safeFilter) {
    window.safeFilter = function(data, predicate) {
      if (!Array.isArray(data)) {
        console.warn('[Emergency Fix] safeFilter called with non-array:', data);
        return [];
      }
      return data.filter(predicate);
    };
  }
  
  if (!window.safeMap) {
    window.safeMap = function(data, callback) {
      if (!Array.isArray(data)) {
        console.warn('[Emergency Fix] safeMap called with non-array:', data);
        return [];
      }
      return data.map(callback);
    };
  }
  
  // Patch 2: Override problematic array operations
  const originalFilter = Array.prototype.filter;
  Array.prototype.filter = function(...args) {
    try {
      return originalFilter.apply(this, args);
    } catch (error) {
      console.error('[Emergency Fix] Filter error caught:', error);
      return [];
    }
  };
  
  // Patch 3: Fix API URLs
  if (typeof window !== 'undefined') {
    // Override fetch to fix API URLs
    const originalFetch = window.fetch;
    window.fetch = function(url, ...args) {
      // Fix URLs that are missing /api prefix
      if (typeof url === 'string') {
        if (url.includes('fides-mentorship-system-production.up.railway.app') && 
            !url.includes('/api/') && 
            (url.includes('/auth/') || url.includes('/users/') || url.includes('/sessions/'))) {
          const fixedUrl = url.replace(
            'fides-mentorship-system-production.up.railway.app/',
            'fides-mentorship-system-production.up.railway.app/api/'
          );
          console.log('[Emergency Fix] Fixed API URL:', url, '->', fixedUrl);
          url = fixedUrl;
        }
      }
      return originalFetch.call(window, url, ...args);
    };
  }
  
  // Patch 4: Add global error handler
  window.addEventListener('error', function(event) {
    if (event.error && event.error.message && event.error.message.includes('filter is not a function')) {
      console.error('[Emergency Fix] Caught filter error, preventing crash');
      event.preventDefault();
    }
  });
  
  // Patch 5: Fix Redux store initial state
  if (window.__REDUX_STORE__) {
    const store = window.__REDUX_STORE__;
    const state = store.getState();
    if (state && state.mentorship) {
      if (!Array.isArray(state.mentorship.sessions)) {
        console.log('[Emergency Fix] Fixing Redux sessions array');
        store.dispatch({ type: 'mentorship/setSessions', payload: [] });
      }
      if (!Array.isArray(state.mentorship.requests)) {
        console.log('[Emergency Fix] Fixing Redux requests array');
        store.dispatch({ type: 'mentorship/setRequests', payload: [] });
      }
    }
  }
  
  console.log('[Emergency Fix] All patches applied successfully');
})();