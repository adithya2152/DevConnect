import React, { useState } from 'react';
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
  IconButton
} from '@mui/material';
import { Search, Group, Person, Add } from '@mui/icons-material';
import { conversations, communities } from '../../data/dummy.js';

/**
 * ChatSidebar Component
 * Displays list of conversations and group chats
 * Allows switching between direct messages and group chats
 * Includes search functionality for finding conversations
 */
function ChatSidebar({ selectedConversation, onSelectConversation, onCreateGroup }) {
  const [activeTab, setActiveTab] = useState(0); // 0 = Direct Messages, 1 = Group Chats
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv =>
    conv.participants.some(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Filter communities (group chats) based on search query
  const filteredCommunities = communities.filter(comm =>
    comm.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchQuery(''); // Clear search when switching tabs
  };

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
            },
            '& .Mui-selected': {
              color: '#00c6ff',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#00c6ff',
            },
          }}
        >
          <Tab icon={<Person />} label="Direct" />
          <Tab icon={<Group />} label="Groups" />
        </Tabs>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder={activeTab === 0 ? "Search conversations..." : "Search groups..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'rgba(255,255,255,0.5)' }} />
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
      </Box>

      {/* Conversation/Group List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 0 ? (
          // Direct Messages
          <List sx={{ p: 0 }}>
            {filteredConversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(p => p.id !== '1'); // Assuming current user ID is '1'
              const isSelected = selectedConversation?.id === conversation.id;
              
              return (
                <ListItem
                  key={conversation.id}
                  button
                  onClick={() => onSelectConversation(conversation)}
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
                    <Badge
                      color="success"
                      variant="dot"
                      invisible={!otherParticipant?.isOnline}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                    >
                      <Avatar src={otherParticipant?.avatar} alt={otherParticipant?.name} />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" color="white" fontWeight="bold">
                        {otherParticipant?.name}
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
                          {conversation.lastMessage?.content}
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.5)">
                          {new Date(conversation.lastMessage?.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>
                    }
                  />
                  {conversation.unreadCount > 0 && (
                    <Badge
                      badgeContent={conversation.unreadCount}
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
        ) : (
          // Group Chats
          <Box>
            {/* Create Group Button */}
            <Box sx={{ p: 2 }}>
              <IconButton
                onClick={onCreateGroup}
                sx={{
                  width: '100%',
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
                <Typography variant="body2" fontWeight="bold">
                  Create Group Chat
                </Typography>
              </IconButton>
            </Box>
            
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            
            <List sx={{ p: 0 }}>
              {filteredCommunities.map((community) => (
                <ListItem
                  key={community.id}
                  button
                  onClick={() => onSelectConversation({ ...community, type: 'group' })}
                  sx={{
                    py: 2,
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={community.image}
                      alt={community.name}
                      sx={{
                        background: 'linear-gradient(45deg, #00c6ff, #0072ff)',
                      }}
                    >
                      <Group />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" color="white" fontWeight="bold">
                        {community.name}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="rgba(255,255,255,0.7)">
                          {community.members} members
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.5)">
                          {community.privacy === 'public' ? 'Public' : 'Private'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ChatSidebar;