require('@testing-library/jest-dom');

// Ensure Vite-style env access doesn't produce undefined in Jest.
process.env.VITE_API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8080';
process.env.BASE_URL = process.env.BASE_URL || '/';

// Common browser globals used by app code.
if (typeof window !== 'undefined') {
  window.alert = window.alert || jest.fn();
}

