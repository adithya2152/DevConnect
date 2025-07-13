import { useState, useEffect } from "react";
import { CircularProgress, Box } from "@mui/material";
import NavBar from "../components/nav";
import useAuthGuard from "../hooks/useAuthGuarf";
import ChatWidget from '../components/chat/Chatbot';
import InlineChatbox from '../components/chat/InlineChatbox';
import { Typography, Container } from '@mui/material';

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
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      color: '#ffffff',
      fontFamily: '"Inter", sans-serif',
    }}>
      <NavBar/>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h3" sx={{ 
          fontWeight: 700, 
          mb: 2,
          color: '#ffffff',
          textAlign: 'center'
        }}>
          Dashboard
        </Typography>
        <Typography variant="h5" sx={{ 
          color: '#9ca3af',
          textAlign: 'center',
          mb: 4
        }}>
          Welcome to your dashboard!
        </Typography>
        <InlineChatbox/>
        <ChatWidget />
        {/* Add more dashboard components here */}
      </Container>
    </Box>
  );
}