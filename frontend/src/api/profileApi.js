/**
 * Profile API Service
 * Handles all profile-related API calls
 */

const API_BASE_URL = 'http://localhost:8000/api/profiles';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken') || 'mock_token'; // Use mock_token for development
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'API request failed');
  }

  return await response.json();
};

// Profile APIs
export const getMyProfile = async () => {
  try {
    const response = await apiCall('/me');
    return response;
  } catch (error) {
    console.error('Error getting my profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const response = await apiCall(`/${userId}`);
    return response;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateMyProfile = async (profileData) => {
  try {
    const response = await apiCall('/me', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    return response;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const followUser = async (userId) => {
  try {
    const response = await apiCall(`/${userId}/follow`, {
      method: 'POST'
    });
    return response;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (userId) => {
  try {
    const response = await apiCall(`/${userId}/follow`, {
      method: 'DELETE'
    });
    return response;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const getUserFollowers = async (userId) => {
  try {
    const response = await apiCall(`/${userId}/followers`);
    return response;
  } catch (error) {
    console.error('Error getting user followers:', error);
    throw error;
  }
};

export const getUserFollowing = async (userId) => {
  try {
    const response = await apiCall(`/${userId}/following`);
    return response;
  } catch (error) {
    console.error('Error getting user following:', error);
    throw error;
  }
};