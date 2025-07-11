import {
  Box,
  Avatar,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import { useState, useEffect } from "react";
import NavBar from "../components/nav";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import useAuthGuard from "../hooks/useAuthGuarf";

export default function ChatPage() {
  useAuthGuard();

  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedDev , setSelectedDev] = useState(null);


  useEffect(() => {
    const fetchConv = async () => {
      try {
        const res = await axios.get("http://localhost:8000/chat/conversations", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          validateStatus: () => true,
        });

        if (res.status === 200) {
          setConversations(res.data.conversations || []);
          setStatusMessage("");
        } else if (res.status === 204) {
          setConversations([]);
          setStatusMessage("No conversations yet. Start a new one!");
        } else {
          setStatusMessage("Unexpected error. Please try again later.");
          toast.error(`Unexpected status: ${res.status}`);
        }
      } catch (error) {
        console.error(error);
        setStatusMessage("Failed to fetch conversations.");
        toast.error("❌ Could not fetch conversations");
      }
    };

    fetchConv();
  }, []);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    setMessages([
      ...messages,
      { id: Date.now(), sender: "Me", message: newMessage, time: "Now" },
    ]);
    setNewMessage("");
  };

  return (
    <>
      <NavBar />

      <Box sx={{ display: "flex", height: "calc(100vh - 64px)", bgcolor: "#111827" }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: 320,
            bgcolor: "#1f2937",
            color: "white",
            p: 2,
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid #374151",
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Conversations
          </Typography>

          <TextField
            variant="outlined"
            size="small"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#9CA3AF" }} />
                </InputAdornment>
              ),
              sx: { bgcolor: "#374151", color: "white", borderRadius: 2 },
            }}
            sx={{ mb: 2 }}
          />

          {/* 🔔 Top Status Message */}
          {statusMessage && (
            <Typography
              variant="body2"
              sx={{
                color: "#9CA3AF",
                backgroundColor: "#1f2937",
                border: "1px dashed #4b5563",
                p: 1,
                mb: 2,
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              {statusMessage}
            </Typography>
          )}

          <Box sx={{ overflowY: "auto", flex: 1 }}>
            <List disablePadding>
              {conversations
                .filter((conv) =>
                  conv?.room_id?.toLowerCase().includes(search.toLowerCase()) ||
                  conv?.last_message?.content?.toLowerCase().includes(search.toLowerCase())
                )
                .map((conv, i) => (
                  <ListItem
                    key={i}
                    sx={{
                      mb: 1,
                      borderRadius: 2,
                      cursor: "pointer",
                      bgcolor: "#374151",
                      "&:hover": { bgcolor: "#4b5563" },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "#6366f1" }}>
                        {conv.last_message?.sender_id?.[0] || "U"}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`Room ${conv.room_id.slice(0, 6)}...`}
                      secondary={
                        conv.last_message?.content
                          ? conv.last_message.content
                          : "No messages yet"
                      }
                    />
                  </ListItem>
                ))}
            </List>
          </Box>
        </Box>

        {/* Chat Window */}
        {selectedDev?(
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(to bottom right, #0f2027, #203a43, #2c5364)",
            color: "white",
            overflowX: "hidden",
            position: "relative",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid #374151",
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(17, 24, 39, 0.5)",
            }}
          >
            <Avatar sx={{ bgcolor: "#6366f1", mr: 2 }}>{selectedDev?.name[0]}</Avatar>
            <Typography variant="h6" fontWeight="bold">
              {selectedDev?.name}
            </Typography>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  alignSelf: msg.sender === "Me" ? "flex-end" : "flex-start",
                  bgcolor: msg.sender === "Me" ? "#4ade80" : "#e5e7eb",
                  color: "black",
                  borderRadius: 3,
                  px: 2,
                  py: 1,
                  maxWidth: "65%",
                  boxShadow: 3,
                }}
              >
                <Typography variant="body2">{msg.message}</Typography>
                <Typography
                  variant="caption"
                  sx={{ display: "block", textAlign: "right", opacity: 0.6 }}
                >
                  {msg.time}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Input */}
          <Paper
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              px: 2,
              py: 1,
              borderRadius: 0,
              position: "sticky",
              bottom: 0,
              bgcolor: "#111827",
              borderTop: "1px solid #374151",
            }}
          >
            <TextField
              fullWidth
              placeholder="Type your message..."
              variant="outlined"
              size="small"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              sx={{
                bgcolor: "#1f2937",
                borderRadius: 2,
                input: { color: "white" },
                mr: 1,
              }}
            />
            <IconButton type="submit" sx={{ color: "#60a5fa" }}>
              <SendIcon />
            </IconButton>
          </Paper>
        </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" align="center" color="white">Welcome to DevConnect , the place to connect with developers through private chats</Typography>
            <Typography variant="h4" align="center" color="white">Select a dev to chat with</Typography>
          </Box>
        )}
      </Box>
      <Toaster />
    </>
  );
}
