import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    github: '',
    linkedin: '',
    interests: '',
    blog: '',
    research: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted:', formData);
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
        minHeight: '100vh',
        py: 8,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={12}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            background: 'rgba(18, 18, 18, 0.6)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          }}
        >
          {/* Left Info Panel */}
          <Box
            sx={{
              flex: 1,
              p: 5,
              background: 'linear-gradient(135deg, #232526, #414345)',
              color: 'white',
            }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Create Your DevConnect Profile
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Join a thriving developer network. Showcase your projects, connect with tech minds, and explore collaborative opportunities.
            </Typography>
          </Box>

          {/* Right Form Panel */}
          <Box sx={{ flex: 1.5, p: 5 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Top Row */}
                <Grid item xs={12} md={6}>
                  <TextField
                    name="email"
                    label="Email"
                    fullWidth
                    required
                    value={formData.email}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      sx: {
                        color: 'white',
                        background: '#1e1e1e',
                        borderRadius: 2,
                      },
                    }}
                    InputLabelProps={{ sx: { color: '#bbb' } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="username"
                    label="Username"
                    fullWidth
                    required
                    value={formData.username}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      sx: {
                        color: 'white',
                        background: '#1e1e1e',
                        borderRadius: 2,
                      },
                    }}
                    InputLabelProps={{ sx: { color: '#bbb' } }}
                  />
                </Grid>

                {/* Row 2 */}
                <Grid item xs={12} md={6}>
                  <TextField
                    name="github"
                    label="GitHub Profile"
                    fullWidth
                    value={formData.github}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{ sx: { color: 'white', background: '#1e1e1e', borderRadius: 2 } }}
                    InputLabelProps={{ sx: { color: '#bbb' } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="linkedin"
                    label="LinkedIn Profile"
                    fullWidth
                    value={formData.linkedin}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{ sx: { color: 'white', background: '#1e1e1e', borderRadius: 2 } }}
                    InputLabelProps={{ sx: { color: '#bbb' } }}
                  />
                </Grid>

                {/* Row 3 */}
                <Grid item xs={12} md={6}>
                  <TextField
                    name="interests"
                    label="Interests (comma-separated)"
                    fullWidth
                    value={formData.interests}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{ sx: { color: 'white', background: '#1e1e1e', borderRadius: 2 } }}
                    InputLabelProps={{ sx: { color: '#bbb' } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="blog"
                    label="Blog / Portfolio URL"
                    fullWidth
                    value={formData.blog}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{ sx: { color: 'white', background: '#1e1e1e', borderRadius: 2 } }}
                    InputLabelProps={{ sx: { color: '#bbb' } }}
                  />
                </Grid>

                {/* Research Row */}
                <Grid item xs={12}>
                  <TextField
                    name="research"
                    label="Research Interests / Topics"
                    fullWidth
                    multiline
                    minRows={3}
                    value={formData.research}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{ sx: { color: 'white', background: '#1e1e1e', borderRadius: 2 } }}
                    InputLabelProps={{ sx: { color: '#bbb' } }}
                  />
                </Grid>

                {/* Submit */}
                <Grid item xs={12}>
  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 , ml: 5}}>
    <Button
      type="submit"
      variant="contained"
      sx={{
        background: 'linear-gradient(to right, #00c6ff, #0072ff)',
        borderRadius: 999,
        py: 1.2,
        px: 4,
        fontWeight: 'bold',
        fontSize: '1rem',
        boxShadow: '0 0 10px rgba(0,114,255,0.5)',
        '&:hover': {
          background: 'linear-gradient(to right, #0072ff, #00c6ff)',
        },
      }}
    >
      Submit
    </Button>
  </Box>
</Grid>
<Grid item xs={12}>
  <Typography
    variant="body2"
    align="center"
    sx={{ mt: 3, color: 'rgba(255,255,255,0.7)' }}
  >
    Already have an account?{' '}
    <Typography
      component="a"
      onClick={() => navigate('/login')}
      sx={{ color: '#00c6ff', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}
    >
      Login
    </Typography>
  </Typography>
</Grid>


              </Grid>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
