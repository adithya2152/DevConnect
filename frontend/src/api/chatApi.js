/**
 * Chat API Service
 * Handles all chat-related API calls
 * Includes endpoints for messages, conversations, and group management
 */

const API_BASE_URL = `${import.meta.env.VITE_API_KEY}/api`; // Backend API base URL

// Mock API responses for development
const MOCK_MODE = true; // Set to false when backend is ready

/**
 * Get all conversations for the current user
 * @returns {Promise<Array>} List of conversations
 */
export const getConversations = async () => {
  if (MOCK_MODE) {
    // Mock response
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            {
              id: '1',
              type: 'direct',
              participants: ['user1', 'user2'],
              lastMessage: {
                content: 'Hey, how are you?',
                timestamp: new Date().toISOString(),
                senderId: 'user2'
              },
              unreadCount: 2
            }
          ]
        });
      }, 500);
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Get messages for a specific conversation
 * @param {string} conversationId - The conversation ID
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of messages per page
 * @returns {Promise<Array>} List of messages
 */
export const getMessages = async (conversationId, page = 1, limit = 50) => {
  if (MOCK_MODE) {
    // Mock response
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            {
              id: '1',
              senderId: 'user2',
              content: 'Hello there!',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              type: 'text'
            },
            {
              id: '2',
              senderId: 'user1',
              content: 'Hi! How are you doing?',
              timestamp: new Date(Date.now() - 1800000).toISOString(),
              type: 'text'
            }
          ],
          pagination: {
            page,
            limit,
            total: 2,
            hasMore: false
          }
        });
      }, 300);
    });
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Send a new message
 * @param {string} conversationId - The conversation ID
 * @param {Object} messageData - Message data
 * @returns {Promise<Object>} Created message
 */
export const sendMessage = async (conversationId, messageData) => {
  if (MOCK_MODE) {
    // Mock response
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            id: Date.now().toString(),
            ...messageData,
            timestamp: new Date().toISOString(),
            senderId: 'user1' // Current user
          }
        });
      }, 200);
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(messageData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Create a new group chat
 * @param {Object} groupData - Group creation data
 * @returns {Promise<Object>} Created group
 */
export const createGroup = async (groupData) => {
  if (MOCK_MODE) {
    // Mock response
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            id: Date.now().toString(),
            ...groupData,
            createdAt: new Date().toISOString(),
            createdBy: 'user1'
          }
        });
      }, 500);
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(groupData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create group');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

/**
 * Join a group chat
 * @param {string} groupId - The group ID
 * @returns {Promise<Object>} Updated group data
 */
export const joinGroup = async (groupId) => {
  if (MOCK_MODE) {
    // Mock response
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Successfully joined group'
        });
      }, 300);
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to join group');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

/**
 * Leave a group chat
 * @param {string} groupId - The group ID
 * @returns {Promise<Object>} Success response
 */
export const leaveGroup = async (groupId) => {
  if (MOCK_MODE) {
    // Mock response
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Successfully left group'
        });
      }, 300);
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to leave group');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};

/**
 * Mark conversation as read
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<Object>} Success response
 */
export const markAsRead = async (conversationId) => {
  if (MOCK_MODE) {
    // Mock response
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Marked as read'
        });
      }, 100);
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark as read');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error marking as read:', error);
    throw error;
  }
};

/**
 * Search for users to start conversations
 * @param {string} query - Search query
 * @returns {Promise<Array>} List of users
 */
export const searchUsers = async (query) => {
  if (MOCK_MODE) {
    // Mock response
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            {
              id: 'user2',
              name: 'Sarah Rodriguez',
              avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
              isOnline: true
            }
          ]
        });
      }, 400);
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to search users');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Create a new project
 * @param {Object} projectData - Project creation data
 * @returns {Promise<Object>} Created project
 */
export const createProject = async (projectData) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  const response = await fetch(`${API_BASE_URL}/app_projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(projectData)
  });
  if (!response.ok) {
    throw new Error('Failed to create project');
  }
  return await response.json();
};

/**
 * Apply to join a project
 * @param {Object} memberData - { project_id, user_id, ... }
 * @returns {Promise<Object>} Application result
 */
export const applyToProject = async (memberData) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  const response = await fetch(`${API_BASE_URL}/app_project_members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(memberData)
  });
  if (!response.ok) {
    throw new Error('Failed to apply to join project');
  }
  return await response.json();
};

/**
 * Get pending applications for a project
 * @param {string} projectId - The project ID
 * @returns {Promise<Object>} List of pending applications
 */
export const getProjectApplications = async (projectId) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/applications`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch project applications');
  }
  return await response.json();
};

/**
 * Accept a project application
 * @param {string} memberId - The member ID
 * @returns {Promise<Object>} Success response
 */
export const acceptProjectApplication = async (memberId) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  const response = await fetch(`${API_BASE_URL}/app_project_members/${memberId}/accept`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to accept application');
  }
  return await response.json();
};

/**
 * Deny a project application
 * @param {string} memberId - The member ID to deny
 * @returns {Promise<Object>} Denial result
 */
export const denyProjectApplication = async (memberId) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  const response = await fetch(`${API_BASE_URL}/app_project_members/${memberId}/deny`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to deny project application');
  }
  return await response.json();
};

/**
 * Create a room for a project
 * @param {string} projectId - The project ID
 * @returns {Promise<Object>} Room creation result
 */
export const createProjectRoom = async (projectId) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/create-room`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to create project room');
  }
  return await response.json();
};

/**
 * Add user to project room
 * @param {string} projectId - The project ID
 * @returns {Promise<Object>} Add to room result
 */
export const addUserToProjectRoom = async (projectId) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/add-to-room`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to add user to project room');
  }
  return await response.json();
};

/**
 * Join project community
 * @param {string} projectId - The project ID
 * @returns {Promise<Object>} Join community result
 */
export const joinProjectCommunity = async (projectId) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/join-community`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to join project community');
  }
  return await response.json();
};

/**
 * Check if user is member of project community
 * @param {string} projectId - The project ID
 * @returns {Promise<Object>} Membership check result
 */
export const checkProjectCommunityMembership = async (projectId) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/community-membership`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to check community membership');
  }
  return await response.json();
};