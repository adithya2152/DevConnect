import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  TextField,
  IconButton,
  Avatar,
  Badge,
  Tooltip,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MenuIcon from "@mui/icons-material/Menu";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../components/nav";

export default function CommunityChat() {
  const [communities, setCommunities] = useState([]);
  const [activeCommunity, setActiveCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const { communityId } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const ws = useRef(null);

  const BASE = "http://localhost:8000"; // FastAPI backend
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    // Fetch user's communities
    axios.get(`${BASE}/communities/joined`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setCommunities(res.data);
      
      // If URL has a communityId, set it as active
      if (communityId) {
        const found = res.data.find(c => c.id === parseInt(communityId));
        if (found) setActiveCommunity(found);
      }
    }).catch(err => {
      toast.error("Failed to load communities");
    });
  }, [communityId, token]);

  useEffect(() => {
    if (!activeCommunity) return;

    // Load previous messages
    axios.get(`${BASE}/communities/${activeCommunity.id}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setMessages(res.data);
    });

    // Initialize WebSocket connection
    const websocketUrl = `ws://localhost:8000/ws/${activeCommunity.id}?token=${token}`;
    ws.current = new WebSocket(websocketUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
      
      // Simple way to track online users (you might want to enhance this)
      setOnlineUsers(prev => prev + 1);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [activeCommunity, token]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeCommunity || !ws.current) return;

    const message = {
      content: newMessage,
      room_id: activeCommunity.id
    };

    ws.current.send(JSON.stringify(message));
    setNewMessage("");
  };

  const handleCommunitySelect = (community) => {
    setActiveCommunity(community);
    navigate(`/communities/chat/${community.id}`);
    if (isMobile) setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ width: 250, bgcolor: "#1f2937", height: "100vh", color: "white" }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        My Communities
      </Typography>
      <Divider sx={{ bgcolor: "#374151" }} />
      <List>
        {communities.map((community) => (
          <ListItem key={community.id} disablePadding>
            <ListItemButton
              selected={activeCommunity?.id === community.id}
              onClick={() => handleCommunitySelect(community)}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
                color="success"
                invisible={onlineUsers === 0}
              >
                <Avatar sx={{ bgcolor: "#4f46e5", mr: 2 }}>
                  {community.name.charAt(0)}
                </Avatar>
              </Badge>
              <ListItemText
                primary={community.name}
                secondary={`${community.memberCount} members`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <NavBar />
      <Box sx={{ display: "flex", backgroundColor: "#0f172a", minHeight: "100vh" }}>
        {/* Sidebar for desktop */}
        {!isMobile && drawer}
        
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 250 },
          }}
        >
          {drawer}
        </Drawer>

        {/* Main chat area */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {activeCommunity ? (
            <>
              {/* Chat header */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#1e293b",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {isMobile && (
                  <IconButton
                    color="inherit"
                    edge="start"
                    onClick={() => setMobileOpen(true)}
                    sx={{ mr: 2 }}
                  >
                    <MenuIcon />
                  </IconButton>
                )}
                <Typography variant="h6">{activeCommunity.name}</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title={`${onlineUsers} online`}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: onlineUsers > 0 ? "success.main" : "grey.500",
                        mr: 1,
                      }}
                    />
                    <Typography variant="body2">
                      {onlineUsers} online
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>

              {/* Messages area */}
              <Box
                sx={{
                  flexGrow: 1,
                  p: 2,
                  overflowY: "auto",
                  bgcolor: "#0f172a",
                }}
              >
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      mb: 2,
                      justifyContent:
                        message.sender_id === JSON.parse(localStorage.getItem("user")).id
                          ? "flex-end"
                          : "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: "70%",
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor:
                          message.sender_id === JSON.parse(localStorage.getItem("user")).id
                            ? "#4f46e5"
                            : "#1e293b",
                      }}
                    >
                      <Typography variant="body1">{message.content}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          textAlign: "right",
                          color: "#94a3b8",
                        }}
                      >
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Message input */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#1e293b",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TextField
                  fullWidth
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#334155" },
                      "&:hover fieldset": { borderColor: "#4f46e5" },
                      "&.Mui-focused fieldset": { borderColor: "#4f46e5" },
                    },
                    input: { color: "white" },
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  sx={{ ml: 1 }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <Typography variant="h6">
                {communities.length === 0
                  ? "You haven't joined any communities yet"
                  : "Select a community to start chatting"}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}