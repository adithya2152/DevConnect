// src/pages/ChatPage.jsx
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
import { useState } from "react";
import NavBar from "../components/nav";

const messagesMock = [
  { id: 1, sender: "Alice", message: "Hey there!", time: "10:30 AM" },
  { id: 2, sender: "Me", message: "Hi! How are you?", time: "10:32 AM" },
  { id: 3, sender: "Alice", message: "Doing great. React stuff!", time: "10:33 AM" },
];

const usersMock = ["Alice", "Bob", "Charlie"];

export default function ChatPage() {
  const [messages, setMessages] = useState(messagesMock);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");

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

          <Box sx={{ overflowY: "auto", flex: 1 }}>
            <List disablePadding>
              {usersMock
                .filter((user) => user.toLowerCase().includes(search.toLowerCase()))
                .map((user, i) => (
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
                      <Avatar sx={{ bgcolor: "#6366f1" }}>{user[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={user} secondary="Last message..." />
                  </ListItem>
                ))}
            </List>
          </Box>
        </Box>

        {/* Chat window */}
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
          {/* Chat header */}
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
            <Avatar sx={{ bgcolor: "#6366f1", mr: 2 }}>A</Avatar>
            <Typography variant="h6" fontWeight="bold">
              Alice
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
      </Box>
    </>
  );
}
