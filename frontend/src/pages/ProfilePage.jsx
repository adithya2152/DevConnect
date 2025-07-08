import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Edit,
  GitHub,
  LinkedIn,
  Language,
  LocationOn,
  Email,
  PersonAdd,
  PersonRemove,
  Chat,
  Close,
  Save
} from '@mui/icons-material';
import { getUserProfile, getMyProfile, followUser, unfollowUser, updateMyProfile } from '../api/profileApi';
import { createPrivateRoom } from '../api/chatApi';

/**
 * ProfilePage Component
 * Displays user profiles with follow/unfollow functionality and editing
 */
function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const isOwnProfile = !userId; // If no userId in params, it's the current user's profile
  const currentUserId = '550e8400-e29b-41d4-a716-446655440000'; // Mock user ID

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      let response;
      
      if (isOwnProfile) {
        response = await getMyProfile();
      } else {
        response = await getUserProfile(userId);
      }
      
      if (response.success) {
        setProfile(response.data);
        setFollowing(response.data.is_following || false);
        setEditData({
          username: response.data.username || '',
          full_name: response.data.full_name || '',
          bio: response.data.bio || '',
          location: response.data.location || '',
          skills: response.data.skills || [],
          github_url: response.data.github_url || '',
          linkedin_url: response.data.linkedin_url || '',
          stackoverflow_url: response.data.stackoverflow_url || '',
          website_url: response.data.website_url || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      showSnackbar('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (following) {
        await unfollowUser(userId);
        setFollowing(false);
        setProfile(prev => ({
          ...prev,
          followers_count: prev.followers_count - 1,
          is_following: false
        }));
        showSnackbar('Unfollowed successfully', 'success');
      } else {
        await followUser(userId);
        setFollowing(true);
        setProfile(prev => ({
          ...prev,
          followers_count: prev.followers_count + 1,
          is_following: true
        }));
        showSnackbar('Following successfully', 'success');
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      showSnackbar('Failed to update follow status', 'error');
    }
  };

  const handleStartChat = async () => {
    try {
      const response = await createPrivateRoom(userId);
      if (response.success) {
        navigate(`/chat?room=${response.data.id}`);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      showSnackbar('Failed to start chat', 'error');
    }
  };

  const handleEditProfile = () => {
    setEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Filter out empty strings and convert skills string to array
      const updateData = {};
      Object.keys(editData).forEach(key => {
        if (editData[key] !== '' && editData[key] !== null) {
          if (key === 'skills') {
            // Handle skills as comma-separated string
            updateData[key] = typeof editData[key] === 'string' 
              ? editData[key].split(',').map(s => s.trim()).filter(s => s)
              : editData[key];
          } else {
            updateData[key] = editData[key];
          }
        }
      });

      const response = await updateMyProfile(updateData);
      if (response.success) {
        setProfile(response.data);
        setEditModalOpen(false);
        showSnackbar('Profile updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbar('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress sx={{ color: '#00c6ff' }} size={60} />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="h6" color="white">
          Profile not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        {/* Profile Header */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            color: 'white'
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '3rem',
                  background: 'linear-gradient(45deg, #00c6ff, #0072ff)'
                }}
              >
                {(profile.full_name || profile.username || 'U')[0].toUpperCase()}
              </Avatar>
            </Grid>
            
            <Grid item xs>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {profile.full_name || profile.username}
                </Typography>
                {profile.is_online && (
                  <Chip
                    label="Online"
                    size="small"
                    sx={{
                      background: '#4caf50',
                      color: 'white'
                    }}
                  />
                )}
              </Box>
              
              {profile.username && profile.full_name && (
                <Typography variant="h6" color="rgba(255,255,255,0.7)" mb={1}>
                  @{profile.username}
                </Typography>
              )}
              
              <Typography variant="body1" color="rgba(255,255,255,0.8)" mb={2}>
                {profile.bio || 'No bio available'}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {profile.followers_count || 0}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Followers
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {profile.following_count || 0}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Following
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                {isOwnProfile ? (
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={handleEditProfile}
                    sx={{
                      background: 'linear-gradient(90deg, #00c6ff, #0072ff)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #0072ff, #00c6ff)',
                      }
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      startIcon={following ? <PersonRemove /> : <PersonAdd />}
                      onClick={handleFollow}
                      sx={{
                        background: following 
                          ? 'rgba(255,255,255,0.1)' 
                          : 'linear-gradient(90deg, #00c6ff, #0072ff)',
                        '&:hover': {
                          background: following 
                            ? 'rgba(255,255,255,0.2)' 
                            : 'linear-gradient(90deg, #0072ff, #00c6ff)',
                        }
                      }}
                    >
                      {following ? 'Unfollow' : 'Follow'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Chat />}
                      onClick={handleStartChat}
                      sx={{
                        borderColor: '#00c6ff',
                        color: '#00c6ff',
                        '&:hover': {
                          borderColor: '#0072ff',
                          background: 'rgba(0, 198, 255, 0.1)'
                        }
                      }}
                    >
                      Message
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Profile Details */}
        <Grid container spacing={4}>
          {/* Left Column - Info */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
                color: 'white'
              }}
            >
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Information
              </Typography>
              
              <List sx={{ p: 0 }}>
                {profile.email && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ background: 'rgba(0, 198, 255, 0.2)' }}>
                        <Email sx={{ color: '#00c6ff' }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Email"
                      secondary={profile.email}
                      secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                    />
                  </ListItem>
                )}
                
                {profile.location && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ background: 'rgba(0, 198, 255, 0.2)' }}>
                        <LocationOn sx={{ color: '#00c6ff' }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Location"
                      secondary={profile.location}
                      secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                    />
                  </ListItem>
                )}
                
                {profile.github_url && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ background: 'rgba(0, 198, 255, 0.2)' }}>
                        <GitHub sx={{ color: '#00c6ff' }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="GitHub"
                      secondary={
                        <a 
                          href={profile.github_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#00c6ff', textDecoration: 'none' }}
                        >
                          {profile.github_url}
                        </a>
                      }
                    />
                  </ListItem>
                )}
                
                {profile.linkedin_url && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ background: 'rgba(0, 198, 255, 0.2)' }}>
                        <LinkedIn sx={{ color: '#00c6ff' }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="LinkedIn"
                      secondary={
                        <a 
                          href={profile.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#00c6ff', textDecoration: 'none' }}
                        >
                          {profile.linkedin_url}
                        </a>
                      }
                    />
                  </ListItem>
                )}
                
                {profile.website_url && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ background: 'rgba(0, 198, 255, 0.2)' }}>
                        <Language sx={{ color: '#00c6ff' }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Website"
                      secondary={
                        <a 
                          href={profile.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#00c6ff', textDecoration: 'none' }}
                        >
                          {profile.website_url}
                        </a>
                      }
                    />
                  </ListItem>
                )}
              </List>
              
              {profile.skills && profile.skills.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profile.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        size="small"
                        sx={{
                          background: 'rgba(0, 198, 255, 0.2)',
                          color: '#00c6ff',
                          border: '1px solid rgba(0, 198, 255, 0.3)'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right Column - Activity */}
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
                color: 'white'
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  '& .MuiTab-root': {
                    color: 'rgba(255,255,255,0.7)',
                  },
                  '& .Mui-selected': {
                    color: '#00c6ff',
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#00c6ff',
                  },
                }}
              >
                <Tab label="Activity" />
                <Tab label="Projects" />
                <Tab label="Connections" />
              </Tabs>
              
              <Box sx={{ p: 3 }}>
                {activeTab === 0 && (
                  <Typography color="rgba(255,255,255,0.7)">
                    Activity feed coming soon...
                  </Typography>
                )}
                {activeTab === 1 && (
                  <Typography color="rgba(255,255,255,0.7)">
                    Projects coming soon...
                  </Typography>
                )}
                {activeTab === 2 && (
                  <Typography color="rgba(255,255,255,0.7)">
                    Connections coming soon...
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Edit Profile Modal */}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: '#1e1e1e',
            color: 'white',
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">
            Edit Profile
          </Typography>
          <IconButton onClick={() => setEditModalOpen(false)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                value={editData.username}
                onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                variant="outlined"
                InputProps={{
                  sx: {
                    color: 'white',
                    background: '#2e2e2e',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                  },
                }}
                InputLabelProps={{ sx: { color: '#bbb' } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={editData.full_name}
                onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                variant="outlined"
                InputProps={{
                  sx: {
                    color: 'white',
                    background: '#2e2e2e',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                  },
                }}
                InputLabelProps={{ sx: { color: '#bbb' } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                variant="outlined"
                multiline
                rows={3}
                InputProps={{
                  sx: {
                    color: 'white',
                    background: '#2e2e2e',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                  },
                }}
                InputLabelProps={{ sx: { color: '#bbb' } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={editData.location}
                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                variant="outlined"
                InputProps={{
                  sx: {
                    color: 'white',
                    background: '#2e2e2e',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                  },
                }}
                InputLabelProps={{ sx: { color: '#bbb' } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Skills (comma-separated)"
                value={Array.isArray(editData.skills) ? editData.skills.join(', ') : editData.skills}
                onChange={(e) => setEditData({ ...editData, skills: e.target.value })}
                variant="outlined"
                InputProps={{
                  sx: {
                    color: 'white',
                    background: '#2e2e2e',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                  },
                }}
                InputLabelProps={{ sx: { color: '#bbb' } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="GitHub URL"
                value={editData.github_url}
                onChange={(e) => setEditData({ ...editData, github_url: e.target.value })}
                variant="outlined"
                InputProps={{
                  sx: {
                    color: 'white',
                    background: '#2e2e2e',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                  },
                }}
                InputLabelProps={{ sx: { color: '#bbb' } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="LinkedIn URL"
                value={editData.linkedin_url}
                onChange={(e) => setEditData({ ...editData, linkedin_url: e.target.value })}
                variant="outlined"
                InputProps={{
                  sx: {
                    color: 'white',
                    background: '#2e2e2e',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                  },
                }}
                InputLabelProps={{ sx: { color: '#bbb' } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website URL"
                value={editData.website_url}
                onChange={(e) => setEditData({ ...editData, website_url: e.target.value })}
                variant="outlined"
                InputProps={{
                  sx: {
                    color: 'white',
                    background: '#2e2e2e',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                  },
                }}
                InputLabelProps={{ sx: { color: '#bbb' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setEditModalOpen(false)}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                background: 'rgba(255,255,255,0.05)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            sx={{
              background: 'linear-gradient(90deg, #00c6ff, #0072ff)',
              '&:hover': {
                background: 'linear-gradient(90deg, #0072ff, #00c6ff)',
              },
              '&:disabled': {
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProfilePage;