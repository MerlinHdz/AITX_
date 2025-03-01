import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for the API - update this with your actual backend URL
const API_URL = 'http://192.168.0.163:5000/api';

// Default headers for API requests
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Helper function to get the JWT token from AsyncStorage
const getToken = async () => {
  try {
    return await AsyncStorage.getItem('jwt_token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// API request helper with JWT token inclusion
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    const token = await getToken();
    const url = `${API_URL}${endpoint}`;
    
    const config = {
      method,
      headers: {
        ...headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }
    
    console.log(`Making ${method} request to: ${url}`);
    const response = await fetch(url, config);
    
    // Check for token expiration (401)
    if (response.status === 401) {
      await AsyncStorage.removeItem('jwt_token');
      await AsyncStorage.removeItem('user');
      // You could trigger a redirect to login here if needed
      throw new Error('Your session has expired. Please login again.');
    }
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'An error occurred');
    }
    
    return responseData;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// API client with methods for different HTTP verbs
const apiClient = {
  get: (endpoint) => apiRequest(endpoint, 'GET'),
  post: (endpoint, data) => apiRequest(endpoint, 'POST', data),
  put: (endpoint, data) => apiRequest(endpoint, 'PUT', data),
  patch: (endpoint, data) => apiRequest(endpoint, 'PATCH', data),
  delete: (endpoint) => apiRequest(endpoint, 'DELETE'),
};

export default apiClient; 