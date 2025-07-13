import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import useAuthGuard from "../../hooks/useAuthGuarf";


export default function ManageCommunity() {
  useAuthGuard();
  const { id } = useParams();
  
  return (
    <Box sx={{ p: 4, bgcolor: '#0f172a', minHeight: '100vh', color: 'white' }}>
      <Typography variant="h4">Manage Community: {id}</Typography>
      {/* Management interface will go here */}
    </Box>
  );
}