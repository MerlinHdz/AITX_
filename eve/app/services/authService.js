import apiClient from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Authentication service with methods for login, register, etc.
const authService = {
  /**
   * Login user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} - Response with user data and token
   */
  login: async (email, password) => {
    try {
      // In production, this would use the actual API: 
      // const response = await apiClient.post('/auth/login', { email, password });
      
      // For development/demo, we'll simulate a successful login
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Mock successful login for demo purposes
      if (email === 'user@example.com' && password === 'password') {
        const userData = {
          id: '1234567890',
          name: 'Demo User',
          email: email
        };
        
        const token = 'mock_jwt_token_' + Date.now();
        
        // Store the token and user data in AsyncStorage
        await AsyncStorage.setItem('jwt_token', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        return { 
          success: true, 
          user: userData, 
          token 
        };
      } else {
        return { 
          success: false, 
          error: 'Invalid email or password' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed'
      };
    }
  },
  
  /**
   * Register a new user
   * @param {string} name - User's name
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} - Response with success status
   */
  register: async (name, email, password) => {
    try {
      // In production, this would use the actual API:
      // const response = await apiClient.post('/auth/register', {
      //   name,
      //   email,
      //   password
      // });
      
      // For development/demo, we'll simulate a successful registration
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      return { 
        success: true, 
        message: 'Registration successful! You can now log in.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed'
      };
    }
  },
  
  /**
   * Logout the current user
   * @returns {Promise} - Response with success status
   */
  logout: async () => {
    try {
      // In production, you might want to invalidate the token on the server
      // await apiClient.post('/auth/logout');
      
      // Remove token and user data from AsyncStorage
      await AsyncStorage.removeItem('jwt_token');
      await AsyncStorage.removeItem('user');
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { 
        success: false, 
        error: error.message || 'Logout failed'
      };
    }
  },
  
  /**
   * Check if the user is authenticated
   * @returns {Promise<boolean>} - True if authenticated
   */
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('jwt_token');
      return !!token;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  },
  
  /**
   * Get the current user data
   * @returns {Promise} - User data object
   */
  getCurrentUser: async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
};

export default authService; 