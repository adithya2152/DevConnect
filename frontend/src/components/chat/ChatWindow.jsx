import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Paper,
  Badge,
  Menu,
  MenuItem,
  CircularProgress
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
import { getRoomMessages, sendMessage, createWebSocketConnection } from '../../api/chatApi';

/**
 * ChatWindow Component
 * Main chat interface with real-time messaging
 */
function ChatWindow({ conversation }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const currentUserId = '550e8400-e29b-41d4-a716-446655440000'; // Mock user ID

  // Load messages when conversation changes
  useEffect(() => {
    if (conversation) {
      loadMessages();
      setupWebSocket();
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [conversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!conversation) return;
    
    try {
      setLoading(true);
      const response = await getRoomMessages(conversation.id);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    if (!conversation) return;
    
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    wsRef.current = createWebSocketConnection(conversation.id, (data) => {
      switch (data.type) {
        case 'new_message':
          setMessages(prev => [...prev, data.data]);
          break;
        case 'typing_indicator':
          if (data.is_typing) {
            setTypingUsers(prev => new Set([...prev, data.user_id]));
          } else {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(data.user_id);
              return newSet;
            });
          }
          break;
        case 'user_online':
        case 'user_offline':
          // Handle user online/offline status
          console.log(`User ${data.user_id} is ${data.type.split('_')[1]}`);
          break;
        default:
          console.log('Unknown WebSocket message:', data);
      }
    });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !conversation || sending) return;

    const messageContent = message.trim();
    setMessage('');
    setSending(true);

    try {
      const response = await sendMessage(conversation.id, messageContent);
      if (response.success) {
        // Message will be added via WebSocket
        console.log('Message sent successfully');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
      setMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (isTyping) => {
    if (wsRef.current) {
      wsRef.current.send({
        type: isTyping ? 'typing_start' : 'typing_stop'
      });
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
  const getDisplayName = () => {
    if (isGroupChat) {
      return conversation.name;
    } else {
      const otherMember = conversation.members?.find(m => m.id !== currentUserId);
      return otherMember?.full_name || otherMember?.username || 'Unknown User';
    }
  };

  const getDisplayAvatar = () => {
    if (isGroupChat) {
      return null;
    } else {
      const otherMember = conversation.members?.find(m => m.id !== currentUserId);
      return otherMember?.avatar || null;
    }
  };

  const isOnline = () => {
    if (isGroupChat) {
      return conversation.members?.some(m => m.is_online) || false;
    } else {
      const otherMember = conversation.members?.find(m => m.id !== currentUserId);
      return otherMember?.is_online || false;
    }
  };

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
              invisible={!isOnline()}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
            >
              <Avatar
                src={getDisplayAvatar()}
                alt={getDisplayName()}
                sx={{ width: 48, height: 48 }}
              >
                {getDisplayName()[0]?.toUpperCase()}
              </Avatar>
            </Badge>
          )}
          
          <Box>
            <Typography variant="h6" color="white" fontWeight="bold">
              {getDisplayName()}
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.7)">
              {isGroupChat 
                ? `${conversation.members?.length || 0} members` 
                : isOnline() ? 'Online' : 'Offline'
              }
              {typingUsers.size > 0 && (
                <span> • {typingUsers.size === 1 ? 'Someone is' : `${typingUsers.size} people are`} typing...</span>
              )}
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
          <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress sx={{ color: '#00c6ff' }} />
          </Box>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.sender_id === currentUserId;
            const showAvatar = !isOwnMessage && (
              index === 0 || 
              messages[index - 1].sender_id !== msg.sender_id
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
                    src={msg.sender?.avatar}
                    alt={msg.sender?.full_name || msg.sender?.username}
                    sx={{
                      width: 32,
                      height: 32,
                      visibility: showAvatar ? 'visible' : 'hidden',
                    }}
                  >
                    {(msg.sender?.full_name || msg.sender?.username || 'U')[0]?.toUpperCase()}
                  </Avatar>
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
                      {msg.sender?.full_name || msg.sender?.username}
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
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
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
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping(e.target.value.length > 0);
            }}
            onKeyPress={handleKeyPress}
            onBlur={() => handleTyping(false)}
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
            disabled={!message.trim() || sending}
            sx={{
              background: message.trim() && !sending
                ? 'linear-gradient(90deg, #00c6ff, #0072ff)' 
                : 'rgba(255,255,255,0.1)',
              color: 'white',
              '&:hover': {
                background: message.trim() && !sending
                  ? 'linear-gradient(90deg, #0072ff, #00c6ff)' 
                  : 'rgba(255,255,255,0.2)',
              },
            }}
          >
            {sending ? <CircularProgress size={20} /> : <Send />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default ChatWindow;