/**
 * Chat API Service
 * Handles all chat-related API calls with real backend integration
 */

const API_BASE_URL = 'http://localhost:8000/api/chat';

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

// User and connection APIs
export const searchUsers = async (query) => {
  try {
    const response = await apiCall(`/users/search?q=${encodeURIComponent(query)}`);
    return response;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export const getConnections = async () => {
  try {
    const response = await apiCall('/users/connections');
    return response;
  } catch (error) {
    console.error('Error getting connections:', error);
    throw error;
  }
};

export const followUser = async (userId) => {
  try {
    const response = await apiCall(`/users/${userId}/follow`, {
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
    const response = await apiCall(`/users/${userId}/follow`, {
      method: 'DELETE'
    });
    return response;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

// Room/conversation APIs
export const getUserRooms = async () => {
  try {
    const response = await apiCall('/rooms');
    return response;
  } catch (error) {
    console.error('Error getting rooms:', error);
    throw error;
  }
};

export const createPrivateRoom = async (userId) => {
  try {
    const response = await apiCall(`/rooms/private/${userId}`, {
      method: 'POST'
    });
    return response;
  } catch (error) {
    console.error('Error creating private room:', error);
    throw error;
  }
};

export const createGroupRoom = async (name, memberIds) => {
  try {
    const response = await apiCall('/rooms/group', {
      method: 'POST',
      body: JSON.stringify({
        name,
        member_ids: memberIds
      })
    });
    return response;
  } catch (error) {
    console.error('Error creating group room:', error);
    throw error;
  }
};

export const getRoomMembers = async (roomId) => {
  try {
    const response = await apiCall(`/rooms/${roomId}/members`);
    return response;
  } catch (error) {
    console.error('Error getting room members:', error);
    throw error;
  }
};

// Message APIs
export const getRoomMessages = async (roomId, page = 1, limit = 50) => {
  try {
    const response = await apiCall(`/rooms/${roomId}/messages?page=${page}&limit=${limit}`);
    return response;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

export const sendMessage = async (roomId, content, fileUrl = null) => {
  try {
    const response = await apiCall(`/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        file_url: fileUrl
      })
    });
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const markMessageAsRead = async (messageId) => {
  try {
    const response = await apiCall(`/messages/${messageId}/read`, {
      method: 'POST'
    });
    return response;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

// Notification APIs
export const getNotifications = async (limit = 50) => {
  try {
    const response = await apiCall(`/notifications?limit=${limit}`);
    return response;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await apiCall(`/notifications/${notificationId}/read`, {
      method: 'POST'
    });
    return response;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// WebSocket connection
export const createWebSocketConnection = (roomId, onMessage) => {
  const ws = new WebSocket(`ws://localhost:8000/api/chat/ws/${roomId}`);
  
  ws.onopen = () => {
    console.log(`Connected to room ${roomId}`);
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  
  ws.onclose = () => {
    console.log(`Disconnected from room ${roomId}`);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  return {
    send: (message) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    },
    close: () => {
      ws.close();
    }
  };
};

// Legacy API functions for backward compatibility
export const getConversations = getUserRooms;
export const getMessages = getRoomMessages;
export const createGroup = async (groupData) => {
  return createGroupRoom(groupData.name, groupData.participants || []);
};
export const joinGroup = async (groupId) => {
  // This would need to be implemented as a separate endpoint
  console.log('Join group not implemented yet');
  return { success: true, message: 'Join group not implemented yet' };
};
export const leaveGroup = async (groupId) => {
  // This would need to be implemented as a separate endpoint
  console.log('Leave group not implemented yet');
  return { success: true, message: 'Leave group not implemented yet' };
};
export const markAsRead = async (conversationId) => {
  // This would mark all messages in a room as read
  console.log('Mark conversation as read not implemented yet');
  return { success: true, message: 'Mark as read not implemented yet' };
};