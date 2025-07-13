import NavBar from "../components/nav";
import useAuthGuard from "../hooks/useAuthGuarf";
import ChatWidget from '../components/chat/Chatbot';
import InlineChatbox from '../components/chat/InlineChatbox';
import { Box, Typography, Container } from '@mui/material';

export default function Dashboard() {
    useAuthGuard();
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