import { useState, useEffect } from "react";
import { CircularProgress, Box } from "@mui/material";
import NavBar from "../components/nav";
import useAuthGuard from "../hooks/useAuthGuarf";
import ChatWidget from '../components/chat/Chatbot';
import InlineChatbox from '../components/chat/InlineChatbox';

export default function Dashboard() {
  useAuthGuard();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for dashboard initialization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <>
        <NavBar />
        <Box sx={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "calc(100vh - 64px)",
          background: "linear-gradient(to bottom right, #0f2027, #203a43, #2c5364)",
          color: "white"
        }}>
          <CircularProgress size={60} />
        </Box>
      </>
    );
  }

  return (
    <div>
      <NavBar/>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      <InlineChatbox/>
      <ChatWidget />
      {/* Add more dashboard components here */}
    </div>
  );
}