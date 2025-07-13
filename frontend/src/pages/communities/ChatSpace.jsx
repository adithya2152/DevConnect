// Updated ChatSpace component with proper user data handling
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  List, 
  ListItem, 
  ListItemAvatar,
  Avatar,
  ListItemText,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Popover,
  MenuItem
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import NavBar from '../../components/nav';
import axios from 'axios';
import useAuthGuard from "../../hooks/useAuthGuarf";


import toast from 'react-hot-toast';

export default function ChatSpace() {
  useAuthGuard();
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ws, setWs] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const messagesEndRef = useRef(null);
  const BASE = import.meta.env.VITE_API_KEY;
  const WS_URL = import.meta.env.VITE_API_KEY.replace('https://', 'wss://').replace('http://', 'ws://');
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = currentUser?.id;

  // Create a user map from members data
  const createUserMap = useCallback((membersData) => {
    const map = {};
    membersData.forEach(member => {
      // Handle both direct profile data and nested profile object
      const profile = member.profile || member;
      map[member.user_id] = {
        username: profile.username || `User-${member.user_id.slice(0, 4)}`,
        avatar_url: profile.avatar_url,
        role: member.role
      };
    });
    return map;
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  // Fetch initial data and setup WebSocket
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !currentUserId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch room info, members, and initial messages
        const [roomRes, membersRes, messagesRes] = await Promise.all([
          axios.get(`${BASE}/communities/${roomId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${BASE}/communities/${roomId}/members`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${BASE}/communities/${roomId}/chat`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setRoom(roomRes.data);
        setMembers(membersRes.data);
        
        // Create user map and enhance messages
        const userMap = createUserMap(membersRes.data);
        const enhancedMessages = messagesRes.data.messages.map(msg => ({
          ...msg,
          sender_name: userMap[msg.sender_id]?.username || `User-${msg.sender_id.slice(0, 4)}`,
          avatar_url: userMap[msg.sender_id]?.avatar_url
        }));
        
        setMessages(enhancedMessages);
        setIsLoading(false);

        // Setup WebSocket connection
        const websocket = new WebSocket(`${WS_URL}/ws/${roomId}?token=${token}`);

        websocket.onopen = () => {
          console.log('WebSocket connected');
          setWs(websocket);
        };

        websocket.onmessage = (event) => {
          const message = JSON.parse(event.data);
          // Get username from existing members or use fallback
          const senderName = membersRes.data.find(m => m.user_id === message.sender_id)?.profile?.username || 
                            `User-${message.sender_id.slice(0, 4)}`;
          
          setMessages(prev => [...prev, {
            ...message,
            sender_name: senderName,
            avatar_url: membersRes.data.find(m => m.user_id === message.sender_id)?.profile?.avatar_url
          }]);
        };

        websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        websocket.onclose = () => {
          console.log('WebSocket disconnected');
        };

        return () => {
          websocket.close();
        };
      } catch (err) {
        console.error("Failed to initialize chat:", err);
        toast.error("Failed to load chat data");
        navigate('/communities');
      }
    };

    fetchData();
  }, [roomId, navigate, currentUserId, createUserMap]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ws) return;

    try {
      // Send message via WebSocket
      ws.send(JSON.stringify({
        content: newMessage
      }));
      
      setNewMessage('');
    } catch (err) {
      console.error("Failed to send message", err);
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: '#0f172a'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <NavBar />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100vh - 64px)',
        bgcolor: '#0f172a',
        color: 'white'
      }}>
        {/* Room header with clickable group name */}
        <Box sx={{ 
          p: 2, 
          bgcolor: '#1e293b',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer'
        }} onClick={handleClick}>
          <IconButton onClick={() => navigate('/community')} sx={{ mr: 1 }}>
            <ArrowBackIcon sx={{ color: 'white' }} />
          </IconButton>
          <Avatar sx={{ bgcolor: '#4f46e5', mr: 2 }}>
            {room?.name?.charAt(0) || 'R'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">{room?.name || 'Room'}</Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              {members.length} members
            </Typography>
          </Box>
          <Chip 
            icon={<PeopleIcon />}
            label={room?.type === 'private' ? 'Private' : 'Public'} 
            size="small" 
            color={room?.type === 'private' ? 'secondary' : 'primary'}
          />
        </Box>

        {/* Group info popover */}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <Box sx={{ p: 2, width: 300, bgcolor: '#1e293b', color: 'white' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>{room?.name}</Typography>
            <Typography variant="body2" sx={{ mb: 2, color: '#94a3b8' }}>
              {room?.description || 'No description available'}
            </Typography>
            <Divider sx={{ bgcolor: '#334155', my: 1 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Members ({members.length})
            </Typography>
            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
              {members.map((member) => {
                const profile = member.profile || member;
                return (
                  <MenuItem key={member.user_id} sx={{ px: 1, py: 0.5 }}>
                    <ListItemAvatar>
                      <Avatar 
                        src={profile.avatar_url}
                        sx={{ width: 32, height: 32, mr: 1 }}
                      >
                        {(profile.username || profile.full_name)?.charAt(0) || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={profile.username || profile.full_name || `User-${member.user_id.slice(0, 4)}`} 
                      secondary={member.role}
                      secondaryTypographyProps={{ color: '#94a3b8' }}
                    />
                  </MenuItem>
                );
              })}
            </Box>
          </Box>
        </Popover>

        {/* Messages area */}
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          p: 2,
          bgcolor: '#0f172a'
        }}>
          <List>
            {messages.map((message, index) => (
              <ListItem 
                key={index} 
                sx={{
                  display: 'flex',
                  flexDirection: message.sender_id === currentUserId ? 
                    'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  px: 1,
                  py: 1.5
                }}
              >
                {message.sender_id !== currentUserId && (
                  <ListItemAvatar>
                    <Avatar 
                      src={message.avatar_url}
                      sx={{ 
                        bgcolor: '#4f46e5',
                        width: 32,
                        height: 32
                      }}
                    >
                      {message.sender_name?.charAt(0) || 'U'}
                    </Avatar>
                  </ListItemAvatar>
                )}
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.sender_id === currentUserId ? 
                    'flex-end' : 'flex-start',
                  maxWidth: '70%'
                }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#94a3b8',
                      mb: 0.5
                    }}
                  >
                    {message.sender_id === currentUserId ? 
                      'You' : message.sender_name}
                  </Typography>
                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor: message.sender_id === currentUserId ? 
                        '#4f46e5' : '#1e293b',
                      color: 'white',
                      borderRadius: message.sender_id === currentUserId ? 
                        '18px 4px 18px 18px' : '4px 18px 18px 18px'
                    }}
                  >
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                      {message.content}
                    </Typography>
                  </Paper>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#94a3b8',
                      mt: 0.5,
                      alignSelf: 'flex-end'
                    }}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Typography>
                </Box>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        {/* Message input */}
        <Box sx={{ 
          p: 2, 
          bgcolor: '#1e293b',
          borderTop: '1px solid #334155'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#334155' },
                  '&:hover fieldset': { borderColor: '#4f46e5' },
                  '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
                  color: 'white',
                },
                '& .MuiInputLabel-root': { color: '#94a3b8' },
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !ws}
              sx={{ ml: 1 }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </>
  );
}