import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Paper,
  Stack,
  Badge,
  Divider,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Send,
  AttachFile,
  EmojiEmotions,
  MoreVert,
  VideoCall,
  Call,
  Info,
  Group
} from '@mui/icons-material';
import { currentUser } from '../../data/dummy.js';

/**
 * ChatWindow Component
 * Main chat interface for displaying messages and sending new ones
 * Supports both direct messages and group chats
 * Includes message history, typing indicators, and file attachments
 */
function ChatWindow({ conversation, onSendMessage }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const messagesEndRef = useRef(null);

  // Mock messages for demonstration
  useEffect(() => {
    if (conversation) {
      // Generate mock messages based on conversation type
      const mockMessages = generateMockMessages(conversation);
      setMessages(mockMessages);
    }
  }, [conversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() && conversation) {
      const newMessage = {
        id: Date.now().toString(),
        sender: currentUser,
        content: message.trim(),
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Call parent callback for API integration
      if (onSendMessage) {
        onSendMessage(conversation.id, newMessage);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (!conversation) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
        }}
      >
        <Typography variant="h6" color="rgba(255,255,255,0.5)">
          Select a conversation to start chatting
        </Typography>
      </Box>
    );
  }

  const isGroupChat = conversation.type === 'group';
  const chatPartner = isGroupChat 
    ? null 
    : conversation.participants?.find(p => p.id !== currentUser.id);

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          p: 2,
          background: 'rgba(18, 18, 18, 0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isGroupChat ? (
            <Avatar
              src={conversation.image}
              sx={{
                background: 'linear-gradient(45deg, #00c6ff, #0072ff)',
                width: 48,
                height: 48,
              }}
            >
              <Group />
            </Avatar>
          ) : (
            <Badge
              color="success"
              variant="dot"
              invisible={!chatPartner?.isOnline}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
            >
              <Avatar
                src={chatPartner?.avatar}
                alt={chatPartner?.name}
                sx={{ width: 48, height: 48 }}
              />
            </Badge>
          )}
          
          <Box>
            <Typography variant="h6" color="white" fontWeight="bold">
              {isGroupChat ? conversation.name : chatPartner?.name}
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.7)">
              {isGroupChat 
                ? `${conversation.members} members` 
                : chatPartner?.isOnline ? 'Online' : 'Offline'
              }
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!isGroupChat && (
            <>
              <IconButton sx={{ color: 'rgba(255,255,255,0.7)' }}>
                <Call />
              </IconButton>
              <IconButton sx={{ color: 'rgba(255,255,255,0.7)' }}>
                <VideoCall />
              </IconButton>
            </>
          )}
          <IconButton sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <Info />
          </IconButton>
          <IconButton
            onClick={handleMenuOpen}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <MoreVert />
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              background: '#1e1e1e',
              color: 'white',
            },
          }}
        >
          <MenuItem onClick={handleMenuClose}>View Profile</MenuItem>
          <MenuItem onClick={handleMenuClose}>Mute Notifications</MenuItem>
          <MenuItem onClick={handleMenuClose}>Clear Chat</MenuItem>
          {isGroupChat && <MenuItem onClick={handleMenuClose}>Leave Group</MenuItem>}
        </Menu>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.map((msg, index) => {
          const isOwnMessage = msg.sender.id === currentUser.id;
          const showAvatar = !isOwnMessage && (
            index === 0 || 
            messages[index - 1].sender.id !== msg.sender.id
          );

          return (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end',
                gap: 1,
              }}
            >
              {!isOwnMessage && (
                <Avatar
                  src={msg.sender.avatar}
                  alt={msg.sender.name}
                  sx={{
                    width: 32,
                    height: 32,
                    visibility: showAvatar ? 'visible' : 'hidden',
                  }}
                />
              )}
              
              <Box
                sx={{
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                }}
              >
                {!isOwnMessage && showAvatar && isGroupChat && (
                  <Typography
                    variant="caption"
                    color="rgba(255,255,255,0.7)"
                    sx={{ mb: 0.5, ml: 1 }}
                  >
                    {msg.sender.name}
                  </Typography>
                )}
                
                <Paper
                  sx={{
                    p: 1.5,
                    background: isOwnMessage
                      ? 'linear-gradient(90deg, #00c6ff, #0072ff)'
                      : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    borderRadius: 2,
                    borderTopLeftRadius: !isOwnMessage && showAvatar ? 0.5 : 2,
                    borderTopRightRadius: isOwnMessage && showAvatar ? 0.5 : 2,
                  }}
                >
                  <Typography variant="body2">{msg.content}</Typography>
                </Paper>
                
                <Typography
                  variant="caption"
                  color="rgba(255,255,255,0.5)"
                  sx={{ mt: 0.5, mx: 1 }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box
        sx={{
          p: 2,
          background: 'rgba(18, 18, 18, 0.95)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <IconButton sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <AttachFile />
          </IconButton>
          
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            variant="outlined"
            InputProps={{
              sx: {
                color: 'white',
                background: '#1e1e1e',
                borderRadius: 3,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.2)',
                },
              },
            }}
          />
          
          <IconButton sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <EmojiEmotions />
          </IconButton>
          
          <IconButton
            onClick={handleSendMessage}
            disabled={!message.trim()}
            sx={{
              background: message.trim() 
                ? 'linear-gradient(90deg, #00c6ff, #0072ff)' 
                : 'rgba(255,255,255,0.1)',
              color: 'white',
              '&:hover': {
                background: message.trim() 
                  ? 'linear-gradient(90deg, #0072ff, #00c6ff)' 
                  : 'rgba(255,255,255,0.2)',
              },
            }}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

// Helper function to generate mock messages for demonstration
function generateMockMessages(conversation) {
  const isGroupChat = conversation.type === 'group';
  const participants = isGroupChat ? [
    currentUser,
    { id: '2', name: 'Sarah Rodriguez', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
    { id: '3', name: 'Marcus Thompson', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' }
  ] : conversation.participants;

  return [
    {
      id: '1',
      sender: participants[1] || participants[0],
      content: isGroupChat 
        ? 'Hey everyone! How\'s the project coming along?' 
        : 'Hey! How\'s your AI project going?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'text'
    },
    {
      id: '2',
      sender: currentUser,
      content: isGroupChat 
        ? 'Making good progress on the ML models. The accuracy is improving!' 
        : 'It\'s going well! Just implemented the neural network architecture.',
      timestamp: new Date(Date.now() - 3000000).toISOString(),
      type: 'text'
    },
    {
      id: '3',
      sender: participants[2] || participants[1],
      content: isGroupChat 
        ? 'Great! I\'ve set up the CI/CD pipeline. Ready for deployment testing.' 
        : 'That sounds awesome! Would love to see the code.',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: 'text'
    }
  ];
}

export default ChatWindow;