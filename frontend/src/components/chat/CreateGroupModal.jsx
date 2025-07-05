import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Group, Close } from '@mui/icons-material';
import { projects } from '../../data/dummy.js';

/**
 * CreateGroupModal Component
 * Modal for creating new group chats
 * Allows selecting participants and setting group details
 * Can be linked to existing projects for project-specific chats
 */
function CreateGroupModal({ open, onClose, onCreateGroup }) {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupType, setGroupType] = useState('general'); // 'general' or 'project'

  // Get all unique contributors from projects for member selection
  const allContributors = projects.reduce((acc, project) => {
    project.contributors.forEach(contributor => {
      if (!acc.find(c => c.id === contributor.id)) {
        acc.push(contributor);
      }
    });
    return acc;
  }, []);

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

  const handleCreateGroup = () => {
    if (!groupName.trim()) return;

    const newGroup = {
      id: Date.now().toString(),
      name: groupName.trim(),
      description: groupDescription.trim(),
      type: 'group',
      members: selectedMembers.length + 1, // +1 for current user
      participants: [
        { id: '1', name: 'Alex Chen' }, // Current user
        ...selectedMembers
      ],
      projectId: selectedProject || null,
      privacy: 'private',
      createdAt: new Date().toISOString(),
      image: 'https://images.pexels.com/photos/1181280/pexels-photo-1181280.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
    };

    // Call parent callback to handle group creation
    if (onCreateGroup) {
      onCreateGroup(newGroup);
    }

    // Reset form and close modal
    handleClose();
  };

  const handleClose = () => {
    setGroupName('');
    setGroupDescription('');
    setSelectedProject('');
    setSelectedMembers([]);
    setGroupType('general');
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
          {/* Group Type Selection */}
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#bbb' }}>Group Type</InputLabel>
            <Select
              value={groupType}
              onChange={(e) => setGroupType(e.target.value)}
              label="Group Type"
              sx={{
                color: 'white',
                background: '#2e2e2e',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              <MenuItem value="general">General Discussion</MenuItem>
              <MenuItem value="project">Project-Specific</MenuItem>
            </Select>
          </FormControl>

          {/* Project Selection (if project type) */}
          {groupType === 'project' && (
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#bbb' }}>Select Project</InputLabel>
              <Select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                label="Select Project"
                sx={{
                  color: 'white',
                  background: '#2e2e2e',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                }}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

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

          {/* Group Description */}
          <TextField
            fullWidth
            label="Description (Optional)"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
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

          {/* Member Selection */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Add Members
            </Typography>
            
            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedMembers.map((member) => (
                  <Chip
                    key={member.id}
                    avatar={<Avatar src={member.avatar} />}
                    label={member.name}
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
              <List>
                {allContributors
                  .filter(contributor => contributor.id !== '1') // Exclude current user
                  .map((contributor) => {
                    const isSelected = selectedMembers.find(m => m.id === contributor.id);
                    
                    return (
                      <ListItem
                        key={contributor.id}
                        button
                        onClick={() => handleMemberToggle(contributor)}
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
                          <Avatar src={contributor.avatar} alt={contributor.name} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography color="white" fontWeight="bold">
                              {contributor.name}
                            </Typography>
                          }
                          secondary={
                            <Typography color="rgba(255,255,255,0.7)" variant="body2">
                              {contributor.location} • {contributor.skills?.slice(0, 2).join(', ')}
                            </Typography>
                          }
                        />
                      </ListItem>
                    );
                  })}
              </List>
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
          disabled={!groupName.trim()}
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
          Create Group
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateGroupModal;