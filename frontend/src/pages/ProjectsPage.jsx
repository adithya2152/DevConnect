import React, { useState } from 'react';
import { projects, currentUser } from '../data/dummy.js';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Paper,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Avatar,
  Stack
} from '@mui/material';

const allTags = Array.from(new Set(projects.flatMap(p => p.tags)));
const allStatuses = Array.from(new Set(projects.map(p => p.status)));

function ProjectsPage() {
  const [selectedTab, setSelectedTab] = useState('join'); // 'hosted' or 'join'
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');

  // Filter logic based on tab
  let filteredProjects = projects;
  if (selectedTab === 'hosted') {
    filteredProjects = projects.filter(project =>
      project.contributors.some(user => user.id === currentUser.id)
    );
  } else if (selectedTab === 'join') {
    filteredProjects = projects.filter(project =>
      project.status !== 'completed' &&
      !project.contributors.some(user => user.id === currentUser.id)
    );
  }

  // Apply tag, status, and search filters
  filteredProjects = filteredProjects.filter(project => {
    const tagMatch = selectedTag ? project.tags.includes(selectedTag) : true;
    const statusMatch = selectedStatus ? project.status === selectedStatus : true;
    const searchMatch = search
      ? project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.description.toLowerCase().includes(search.toLowerCase())
      : true;
    return tagMatch && statusMatch && searchMatch;
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
        color: 'white',
        fontFamily: 'Inter, sans-serif',
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h3" fontWeight={700}>
            Collaboration Space
          </Typography>
          <Button
            variant="contained"
            disabled
            sx={{
              background: 'linear-gradient(90deg, #646cff, #767fff)',
              borderRadius: 2,
              fontWeight: 600,
              opacity: 0.7,
              boxShadow: '0 4px 16px rgba(100, 108, 255, 0.25)',
              textTransform: 'none',
            }}
          >
            + Create Project (Coming Soon)
          </Button>
        </Box>
        <Stack direction="row" spacing={2} mb={4}>
          <Button
            variant={selectedTab === 'join' ? 'contained' : 'outlined'}
            onClick={() => setSelectedTab('join')}
            sx={{
              background: selectedTab === 'join' ? 'linear-gradient(90deg, #00c6ff, #0072ff)' : 'none',
              color: 'white',
              borderRadius: 999,
              px: 3,
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: selectedTab === 'join' ? '0 0 10px rgba(0,114,255,0.3)' : 'none',
              borderColor: '#00c6ff',
            }}
          >
            Join Projects
          </Button>
          <Button
            variant={selectedTab === 'hosted' ? 'contained' : 'outlined'}
            onClick={() => setSelectedTab('hosted')}
            sx={{
              background: selectedTab === 'hosted' ? 'linear-gradient(90deg, #00c6ff, #0072ff)' : 'none',
              color: 'white',
              borderRadius: 999,
              px: 3,
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: selectedTab === 'hosted' ? '0 0 10px rgba(0,114,255,0.3)' : 'none',
              borderColor: '#00c6ff',
            }}
          >
            Hosted by Me
          </Button>
        </Stack>
        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#bbb' }}>Domain/Skill</InputLabel>
              <Select
                value={selectedTag}
                onChange={e => setSelectedTag(e.target.value)}
                label="Domain/Skill"
                sx={{ color: 'white', background: '#1e1e1e', borderRadius: 2 }}
              >
                <MenuItem value="">All Domains/Skills</MenuItem>
                {allTags.map(tag => (
                  <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#bbb' }}>Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                label="Status"
                sx={{ color: 'white', background: '#1e1e1e', borderRadius: 2 }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {allStatuses.map(status => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          {filteredProjects.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center', color: '#bbb', background: 'rgba(255,255,255,0.04)' }}>
                No projects found for selected filters.
              </Paper>
            </Grid>
          ) : (
            filteredProjects.map(project => (
              <Grid item xs={12} md={6} lg={4} key={project.id}>
                <Paper
                  elevation={8}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    component="img"
                    src={project.image}
                    alt={project.name}
                    sx={{
                      width: '100%',
                      height: 180,
                      objectFit: 'cover',
                      borderRadius: 2,
                      mb: 2,
                      boxShadow: '0 2px 8px rgba(100, 108, 255, 0.08)',
                    }}
                  />
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={1}>
                    {project.description}
                  </Typography>
                  <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
                    {project.tags.map(tag => (
                      <Box
                        key={tag}
                        sx={{
                          background: '#646cff22',
                          color: '#a8b8ff',
                          borderRadius: 1,
                          px: 1.2,
                          py: 0.3,
                          fontSize: '0.85rem',
                        }}
                      >
                        {tag}
                      </Box>
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={2} mb={1} alignItems="center">
                    <Box
                      sx={{
                        background: project.status === 'active' ? '#00c853' : project.status === 'completed' ? '#888' : '#2e2e2e',
                        color: 'white',
                        borderRadius: 1,
                        px: 1.2,
                        py: 0.2,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        textTransform: 'capitalize',
                      }}
                    >
                      {project.status}
                    </Box>
                    <Typography variant="caption" color="#bbb">
                      Created: {project.createdAt}
                    </Typography>
                    <Typography variant="caption" color="#bbb">
                      Last Activity: {project.lastActivity}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} mb={2} alignItems="center">
                    {project.contributors.map(user => (
                      <Avatar
                        key={user.id}
                        src={user.avatar}
                        alt={user.name}
                        title={user.name}
                        sx={{ width: 32, height: 32, border: '2px solid #fff' }}
                      />
                    ))}
                  </Stack>
                  <Button
                    variant="contained"
                    disabled
                    fullWidth
                    sx={{
                      background: 'linear-gradient(90deg, #535bf2, #646cff)',
                      borderRadius: 2,
                      fontWeight: 600,
                      opacity: 0.7,
                      mt: 'auto',
                      textTransform: 'none',
                    }}
                  >
                    Join (Coming Soon)
                  </Button>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
        <Paper sx={{ mt: 6, p: 3, textAlign: 'center', background: 'rgba(255,255,255,0.02)', color: '#bdbdbd', borderRadius: 2 }}>
          <strong>Team Chatroom:</strong> Coming soon! Upon joining a project, a chatroom will be auto-generated for collaboration.
        </Paper>
      </Container>
    </Box>
  );
}

export default ProjectsPage; 