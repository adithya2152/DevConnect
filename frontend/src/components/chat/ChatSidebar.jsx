import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Badge,
  TextField,
  InputAdornment,
  Divider,
  Tab,
  Tabs,
  IconButton,
  Button,
  CircularProgress
} from '@mui/material';
import { Search, Group, Person, Add, Notifications } from '@mui/icons-material';
import { getUserRooms, getConnections, searchUsers, createPrivateRoom, getNotifications } from '../../api/chatApi';

/**
 * ChatSidebar Component
 * Displays list of conversations and group chats with real data
 */
function ChatSidebar({ selectedConversation, onSelectConversation, onCreateGroup }) {
  const [activeTab, setActiveTab] = useState(0); // 0 = Connections, 1 = All Chats, 2 = Notifications
  const [searchQuery, setSearchQuery] = useState('');
  const [rooms, setRooms] = useState([]);
  const [connections, setConnections] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadRooms();
    loadConnections();
    loadNotifications();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() && activeTab === 0) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, activeTab]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await getUserRooms();
      if (response.success) {
        setRooms(response.data);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async () => {
    try {
      const response = await getConnections();
      if (response.success) {
        setConnections(response.data);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await getNotifications();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearchLoading(true);
      const response = await searchUsers(searchQuery);
      if (response.success) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleStartChat = async (user) => {
    try {
      const response = await createPrivateRoom(user.id);
      if (response.success) {
        const room = response.data;
        // Add to rooms list if not already there
        setRooms(prev => {
          const exists = prev.find(r => r.id === room.id);
          if (!exists) {
            return [room, ...prev];
          }
          return prev;
        });
        
        // Select the room
        onSelectConversation(room);
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getDisplayName = (room) => {
    if (room.type === 'group') {
      return room.name;
    } else {
      // For private rooms, show the other user's name
      const otherMember = room.members?.find(m => m.id !== '550e8400-e29b-41d4-a716-446655440000');
      return otherMember?.full_name || otherMember?.username || 'Unknown User';
    }
  };

  const getDisplayAvatar = (room) => {
    if (room.type === 'group') {
      return null; // Will show Group icon
    } else {
      const otherMember = room.members?.find(m => m.id !== '550e8400-e29b-41d4-a716-446655440000');
      return otherMember?.avatar || null;
    }
  };

  const filteredConnections = connections.filter(conn =>
    conn.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRooms = rooms.filter(room =>
    getDisplayName(room).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      sx={{
        width: 320,
        height: '100vh',
        background: 'rgba(18, 18, 18, 0.95)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h6" fontWeight="bold" color="white" mb={2}>
          Messages
        </Typography>
        
        {/* Tab Navigation */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            mb: 2,
            '& .MuiTab-root': {
              color: 'rgba(255,255,255,0.7)',
              minWidth: 'auto',
              flex: 1,
              fontSize: '0.8rem',
            },
            '& .Mui-selected': {
              color: '#00c6ff',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#00c6ff',
            },
          }}
        >
          <Tab icon={<Person />} label="Following" />
          <Tab icon={<Group />} label="All Chats" />
          <Tab 
            icon={
              <Badge badgeContent={notifications.filter(n => !n.is_read).length} color="error">
                <Notifications />
              </Badge>
            } 
            label="Alerts" 
          />
        </Tabs>

        {/* Search Bar */}
        {activeTab !== 2 && (
          <TextField
            fullWidth
            placeholder={activeTab === 0 ? "Search people..." : "Search chats..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {searchLoading ? (
                    <CircularProgress size={16} sx={{ color: 'rgba(255,255,255,0.5)' }} />
                  ) : (
                    <Search sx={{ color: 'rgba(255,255,255,0.5)' }} />
                  )}
                </InputAdornment>
              ),
              sx: {
                color: 'white',
                background: '#1e1e1e',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.2)',
                },
              },
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress sx={{ color: '#00c6ff' }} />
          </Box>
        ) : (
          <>
            {activeTab === 0 && (
              // Following/Connections Tab
              <Box>
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ p: 2, color: 'rgba(255,255,255,0.7)' }}>
                      Search Results
                    </Typography>
                    <List sx={{ p: 0 }}>
                      {searchResults.map((user) => (
                        <ListItem
                          key={user.id}
                          button
                          onClick={() => handleStartChat(user)}
                          sx={{
                            py: 2,
                            px: 2,
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.05)',
                            },
                          }}
                        >
                          <ListItemAvatar>
                            <Badge
                              color="success"
                              variant="dot"
                              invisible={!user.is_online}
                              anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                              }}
                            >
                              <Avatar src={user.avatar} alt={user.full_name || user.username}>
                                {(user.full_name || user.username || 'U')[0].toUpperCase()}
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2" color="white" fontWeight="bold">
                                {user.full_name || user.username}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                                {user.bio || user.email}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                  </Box>
                )}

                {/* Following List */}
                <Typography variant="subtitle2" sx={{ p: 2, color: 'rgba(255,255,255,0.7)' }}>
                  Following ({filteredConnections.length})
                </Typography>
                <List sx={{ p: 0 }}>
                  {filteredConnections.map((user) => (
                    <ListItem
                      key={user.id}
                      button
                      onClick={() => handleStartChat(user)}
                      sx={{
                        py: 2,
                        px: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          color="success"
                          variant="dot"
                          invisible={!user.is_online}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                          }}
                        >
                          <Avatar src={user.avatar} alt={user.full_name || user.username}>
                            {(user.full_name || user.username || 'U')[0].toUpperCase()}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" color="white" fontWeight="bold">
                            {user.full_name || user.username}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="rgba(255,255,255,0.7)">
                            {user.is_online ? 'Online' : 'Offline'}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {activeTab === 1 && (
              // All Chats Tab
              <Box>
                {/* Create Group Button */}
                <Box sx={{ p: 2 }}>
                  <Button
                    onClick={onCreateGroup}
                    fullWidth
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(90deg, #00c6ff, #0072ff)',
                      color: 'white',
                      borderRadius: 2,
                      '&:hover': {
                        background: 'linear-gradient(90deg, #0072ff, #00c6ff)',
                      },
                    }}
                  >
                    <Add sx={{ mr: 1 }} />
                    Create Group Chat
                  </Button>
                </Box>
                
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                
                {/* Rooms List */}
                <List sx={{ p: 0 }}>
                  {filteredRooms.map((room) => {
                    const isSelected = selectedConversation?.id === room.id;
                    const displayName = getDisplayName(room);
                    const displayAvatar = getDisplayAvatar(room);
                    
                    return (
                      <ListItem
                        key={room.id}
                        button
                        onClick={() => onSelectConversation(room)}
                        sx={{
                          py: 2,
                          px: 2,
                          backgroundColor: isSelected ? 'rgba(0, 198, 255, 0.1)' : 'transparent',
                          borderLeft: isSelected ? '3px solid #00c6ff' : '3px solid transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.05)',
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar src={displayAvatar} alt={displayName}>
                            {room.type === 'group' ? <Group /> : displayName[0]?.toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" color="white" fontWeight="bold">
                              {displayName}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="rgba(255,255,255,0.7)"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '180px',
                                }}
                              >
                                {room.last_message?.content || 'No messages yet'}
                              </Typography>
                              {room.last_message && (
                                <Typography variant="caption" color="rgba(255,255,255,0.5)">
                                  {new Date(room.last_message.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        {room.unread_count > 0 && (
                          <Badge
                            badgeContent={room.unread_count}
                            color="primary"
                            sx={{
                              '& .MuiBadge-badge': {
                                backgroundColor: '#00c6ff',
                                color: 'white',
                              },
                            }}
                          />
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}

            {activeTab === 2 && (
              // Notifications Tab
              <List sx={{ p: 0 }}>
                {notifications.map((notification) => (
                  <ListItem
                    key={notification.id}
                    sx={{
                      py: 2,
                      px: 2,
                      backgroundColor: notification.is_read ? 'transparent' : 'rgba(0, 198, 255, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.05)',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <Notifications />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" color="white" fontWeight="bold">
                          {notification.type.replace('_', ' ').toUpperCase()}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="rgba(255,255,255,0.7)">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="rgba(255,255,255,0.5)">
                            {new Date(notification.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
                {notifications.length === 0 && (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="rgba(255,255,255,0.5)">
                      No notifications
                    </Typography>
                  </Box>
                )}
              </List>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default ChatSidebar;