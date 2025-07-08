import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Checkbox,
  CircularProgress
} from '@mui/material';
import { Group, Close } from '@mui/icons-material';
import { getConnections, createGroupRoom } from '../../api/chatApi';

/**
 * CreateGroupModal Component
 * Modal for creating new group chats with real data
 */
function CreateGroupModal({ open, onClose, onCreateGroup }) {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Load connections when modal opens
  useEffect(() => {
    if (open) {
      loadConnections();
    }
  }, [open]);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const response = await getConnections();
      if (response.success) {
        setConnections(response.data);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (member) => {
    setSelectedMembers(prev => {
      const isSelected = prev.find(m => m.id === member.id);
      if (isSelected) {
        return prev.filter(m => m.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || creating) return;

    try {
      setCreating(true);
      const memberIds = selectedMembers.map(m => m.id);
      const response = await createGroupRoom(groupName.trim(), memberIds);
      
      if (response.success) {
        // Call parent callback to handle group creation
        if (onCreateGroup) {
          onCreateGroup(response.data);
        }
        
        // Reset form and close modal
        handleClose();
      }
    } catch (error) {
      console.error('Error creating group:', error);
      // TODO: Show error message to user
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setGroupName('');
    setSelectedMembers([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{
            background: 'linear-gradient(45deg, #00c6ff, #0072ff)',
          }}
        >
          <Group />
        </Avatar>
        <Typography variant="h6" fontWeight="bold">
          Create Group Chat
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {/* Group Name */}
          <TextField
            fullWidth
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
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

          {/* Member Selection */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Add Members ({selectedMembers.length} selected)
            </Typography>
            
            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedMembers.map((member) => (
                  <Chip
                    key={member.id}
                    avatar={
                      <Avatar src={member.avatar}>
                        {(member.full_name || member.username || 'U')[0].toUpperCase()}
                      </Avatar>
                    }
                    label={member.full_name || member.username}
                    onDelete={() => handleMemberToggle(member)}
                    deleteIcon={<Close />}
                    sx={{
                      background: 'rgba(0, 198, 255, 0.2)',
                      color: 'white',
                      '& .MuiChip-deleteIcon': {
                        color: 'rgba(255,255,255,0.7)',
                      },
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Available Members List */}
            <Box
              sx={{
                maxHeight: 300,
                overflow: 'auto',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 2,
                background: '#2e2e2e',
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress sx={{ color: '#00c6ff' }} />
                </Box>
              ) : (
                <List>
                  {connections.map((connection) => {
                    const isSelected = selectedMembers.find(m => m.id === connection.id);
                    
                    return (
                      <ListItem
                        key={connection.id}
                        button
                        onClick={() => handleMemberToggle(connection)}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.05)',
                          },
                        }}
                      >
                        <Checkbox
                          checked={!!isSelected}
                          sx={{
                            color: 'rgba(255,255,255,0.7)',
                            '&.Mui-checked': {
                              color: '#00c6ff',
                            },
                          }}
                        />
                        <ListItemAvatar>
                          <Avatar src={connection.avatar} alt={connection.full_name || connection.username}>
                            {(connection.full_name || connection.username || 'U')[0].toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography color="white" fontWeight="bold">
                              {connection.full_name || connection.username}
                            </Typography>
                          }
                          secondary={
                            <Typography color="rgba(255,255,255,0.7)" variant="body2">
                              {connection.email} • {connection.is_online ? 'Online' : 'Offline'}
                            </Typography>
                          }
                        />
                      </ListItem>
                    );
                  })}
                  {connections.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography color="rgba(255,255,255,0.5)">
                        No connections found. Follow some users first to add them to groups.
                      </Typography>
                    </Box>
                  )}
                </List>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={handleClose}
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
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || creating}
          variant="contained"
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
          {creating ? <CircularProgress size={20} /> : 'Create Group'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateGroupModal;