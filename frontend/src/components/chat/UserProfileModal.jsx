import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Close,
  PersonAdd,
  PersonRemove,
  Chat,
  GitHub,
  LinkedIn,
  Language,
  LocationOn,
  Email
} from '@mui/icons-material';
import { getUserProfile, followUser, unfollowUser } from '../../api/profileApi';
import { createPrivateRoom } from '../../api/chatApi';

/**
 * UserProfileModal Component
 * Modal for viewing user profiles from chat search
 */
function UserProfileModal({ open, onClose, userId, onStartChat }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      loadProfile();
    }
  }, [open, userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile(userId);
      if (response.success) {
        setProfile(response.data);
        setFollowing(response.data.is_following || false);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      setActionLoading(true);
      if (following) {
        await unfollowUser(userId);
        setFollowing(false);
        setProfile(prev => ({
          ...prev,
          followers_count: prev.followers_count - 1,
          is_following: false
        }));
      } else {
        await followUser(userId);
        setFollowing(true);
        setProfile(prev => ({
          ...prev,
          followers_count: prev.followers_count + 1,
          is_following: true
        }));
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartChat = async () => {
    try {
      setActionLoading(true);
      const response = await createPrivateRoom(userId);
      if (response.success) {
        onStartChat(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: '#1e1e1e',
          color: 'white',
          borderRadius: 3,
          maxHeight: '80vh'
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            zIndex: 1
          }}
        >
          <Close />
        </IconButton>

        <DialogContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress sx={{ color: '#00c6ff' }} />
            </Box>
          ) : profile ? (
            <Box>
              {/* Header */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
                  p: 4,
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    fontSize: '2.5rem',
                    margin: '0 auto',
                    mb: 2,
                    background: 'rgba(255,255,255,0.2)',
                    border: '3px solid white'
                  }}
                >
                  {(profile.full_name || profile.username || 'U')[0].toUpperCase()}
                </Avatar>
                
                <Typography variant="h5" fontWeight="bold" mb={1}>
                  {profile.full_name || profile.username}
                </Typography>
                
                {profile.username && profile.full_name && (
                  <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
                    @{profile.username}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                      {profile.followers_count || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Followers
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                      {profile.following_count || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Following
                    </Typography>
                  </Box>
                </Box>
                
                {profile.is_online && (
                  <Chip
                    label="Online"
                    size="small"
                    sx={{
                      background: 'rgba(76, 175, 80, 0.8)',
                      color: 'white'
                    }}
                  />
                )}
              </Box>

              {/* Content */}
              <Box sx={{ p: 3 }}>
                {/* Bio */}
                {profile.bio && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" color="rgba(255,255,255,0.8)">
                      {profile.bio}
                    </Typography>
                  </Box>
                )}

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" mb={1}>
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

                {/* Contact Info */}
                <List sx={{ p: 0 }}>
                  {profile.email && (
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ background: 'rgba(0, 198, 255, 0.2)', width: 32, height: 32 }}>
                          <Email sx={{ color: '#00c6ff', fontSize: '1rem' }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={profile.email}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  )}
                  
                  {profile.location && (
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ background: 'rgba(0, 198, 255, 0.2)', width: 32, height: 32 }}>
                          <LocationOn sx={{ color: '#00c6ff', fontSize: '1rem' }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={profile.location}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  )}
                  
                  {profile.github_url && (
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ background: 'rgba(0, 198, 255, 0.2)', width: 32, height: 32 }}>
                          <GitHub sx={{ color: '#00c6ff', fontSize: '1rem' }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <a 
                            href={profile.github_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#00c6ff', textDecoration: 'none' }}
                          >
                            GitHub Profile
                          </a>
                        }
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  )}
                  
                  {profile.linkedin_url && (
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ background: 'rgba(0, 198, 255, 0.2)', width: 32, height: 32 }}>
                          <LinkedIn sx={{ color: '#00c6ff', fontSize: '1rem' }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <a 
                            href={profile.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#00c6ff', textDecoration: 'none' }}
                          >
                            LinkedIn Profile
                          </a>
                        }
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  )}
                  
                  {profile.website_url && (
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ background: 'rgba(0, 198, 255, 0.2)', width: 32, height: 32 }}>
                          <Language sx={{ color: '#00c6ff', fontSize: '1rem' }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <a 
                            href={profile.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#00c6ff', textDecoration: 'none' }}
                          >
                            Website
                          </a>
                        }
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  )}
                </List>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={following ? <PersonRemove /> : <PersonAdd />}
                    onClick={handleFollow}
                    disabled={actionLoading}
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
                    {actionLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      following ? 'Unfollow' : 'Follow'
                    )}
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Chat />}
                    onClick={handleStartChat}
                    disabled={actionLoading}
                    sx={{
                      borderColor: '#00c6ff',
                      color: '#00c6ff',
                      '&:hover': {
                        borderColor: '#0072ff',
                        background: 'rgba(0, 198, 255, 0.1)'
                      }
                    }}
                  >
                    {actionLoading ? <CircularProgress size={20} /> : 'Message'}
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="rgba(255,255,255,0.7)">
                Profile not found
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Box>
    </Dialog>
  );
}

export default UserProfileModal;