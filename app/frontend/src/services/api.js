/**
 * API Service for StockUP Backend
 * Handles all authentication API calls with JWT support
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1/auth';

// Token management
const TOKEN_KEY = 'stockup_token';

export const tokenManager = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY),
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      tokenManager.remove();
      
      // Only redirect if we're not already on auth pages
      const currentPath = window.location.pathname;
      const authPages = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'];
      
      if (!authPages.includes(currentPath)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Methods
const authAPI = {
  /**
   * Register a new user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} API response
   */
  register: async (email, password) => {
    try {
      const response = await apiClient.post('/register', { email, password });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Network error. Please try again.' },
      };
    }
  },

  /**
   * Verify OTP code
   * @param {string} email - User's email
   * @param {string} otp_code - 4-digit OTP code
   * @returns {Promise} API response
   */
  verifyOTP: async (email, otp_code) => {
    try {
      const response = await apiClient.post('/verify-otp', { email, otp_code });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Network error. Please try again.' },
      };
    }
  },

  /**
   * Resend OTP code
   * @param {string} email - User's email
   * @returns {Promise} API response
   */
  resendOTP: async (email) => {
    try {
      const response = await apiClient.post('/resend-otp', { email });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Network error. Please try again.' },
      };
    }
  },

  /**
   * Login user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} API response
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/login', { email, password });
      
      // Store JWT token if login successful
      if (response.data.access_token) {
        tokenManager.set(response.data.access_token);
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Network error. Please try again.' },
      };
    }
  },

  /**
   * Forgot password request
   * @param {string} email - User's email
   * @returns {Promise} API response
   */
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/forgot-password', { email });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Network error. Please try again.' },
      };
    }
  },

  /**
   * Reset password
   * @param {string} email - User's email
   * @param {string} token - Reset token
   * @param {string} new_password - New password
   * @returns {Promise} API response
   */
  resetPassword: async (email, token, new_password) => {
    try {
      const response = await apiClient.post('/reset-password', { 
        email, 
        token, 
        new_password 
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Network error. Please try again.' },
      };
    }
  },

  /**
   * Get current user info (requires authentication)
   * @returns {Promise} API response
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/me');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Network error. Please try again.' },
      };
    }
  },

  /**
   * Refresh JWT token (requires authentication)
   * @returns {Promise} API response
   */
  refreshToken: async () => {
    try {
      const response = await apiClient.post('/refresh');
      
      // Update stored token
      if (response.data.access_token) {
        tokenManager.set(response.data.access_token);
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Network error. Please try again.' },
      };
    }
  },

  /**
   * Check if email exists
   * @param {string} email - User's email
   * @returns {Promise} API response
   */
  checkEmail: async (email) => {
    try {
      const response = await apiClient.post('/check-email', { email });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Network error. Please try again.' },
      };
    }
  },

  /**
   * Logout user (client-side only)
   */
  logout: () => {
    tokenManager.remove();
    // Clear any other stored user data if needed
    localStorage.removeItem('user');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const token = tokenManager.get();
    return !!token;
  },

  /**
   * Health check
   * @returns {Promise} API response
   */
  healthCheck: async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/health');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: { message: 'Backend server is not running.' },
      };
    }
  },
};

export default authAPI;
