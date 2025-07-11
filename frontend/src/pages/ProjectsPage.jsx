import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  AvatarGroup,
  IconButton,
  Tabs,
  Tab,
  Collapse,
  Stack,
  Paper,
  Badge,
  Tooltip,
  InputAdornment
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Search,
  Filter,
  Users,
  Calendar,
  MapPin,
  Star,
  Eye,
  MessageSquare,
  Plus,
  GitBranch,
  Code,
  Zap,
  Clock,
  CheckCircle,
  Pause,
  X
} from 'lucide-react';
import NavBar from '../components/nav';
import axios from 'axios';
import { supabase } from '../api/supabase';

// Custom styled components
const StyledContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  color: '#ffffff',
  fontFamily: '"Inter", sans-serif',
}));

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.2)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  maxWidth: 370,
  width: '100%',
  margin: '0 auto',
  '&:hover': {
    transform: 'scale(1.02)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #00c6ff, #0072ff)',
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  padding: '12px 24px',
  boxShadow: '0 4px 16px rgba(0,114,255,0.15)',
  color: '#fff',
  '&:hover': {
    background: 'linear-gradient(90deg, #0072ff, #00c6ff)',
    transform: 'scale(1.05)',
  },
}));

const FilterCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.2)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  padding: '24px',
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#ffffff',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.05)',
    },
    '&.Mui-focused': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#9ca3af',
  },
  '& .MuiOutlinedInput-input': {
    color: '#ffffff',
    '&::placeholder': {
      color: '#9ca3af',
      opacity: 1,
    },
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.2)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: '#ffffff',
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border: '1px solid #3b82f6',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  color: '#9ca3af',
  fontWeight: 500,
  textTransform: 'none',
  minHeight: 48,
  '&.Mui-selected': {
    color: '#ffffff',
    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
    borderRadius: '12px',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { bg: '#10b981', color: '#ffffff' };
      case 'completed': return { bg: '#3b82f6', color: '#ffffff' };
      case 'on_hold': return { bg: '#f59e0b', color: '#ffffff' };
      case 'cancelled': return { bg: '#ef4444', color: '#ffffff' };
      default: return { bg: '#6b7280', color: '#ffffff' };
    }
  };
  
  const colors = getStatusColor(status);
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 600,
    fontSize: '0.75rem',
  };
});

const DifficultyChip = styled(Chip)(({ theme, difficulty }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return { bg: '#dcfce7', color: '#166534' };
      case 'intermediate': return { bg: '#fef3c7', color: '#92400e' };
      case 'advanced': return { bg: '#fed7aa', color: '#c2410c' };
      case 'expert': return { bg: '#fecaca', color: '#dc2626' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };
  
  const colors = getDifficultyColor(difficulty);
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 500,
    fontSize: '0.75rem',
  };
});

function ProjectsPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get logged-in user
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try a simpler nested select for members
        const { data, error: supabaseError } = await supabase
          .from('app_projects')
          .select('*, app_project_members(*, profiles(*))');
        if (supabaseError) {
          console.error('Supabase error:', supabaseError);
          throw supabaseError;
        }
        // Map members to a flat array of profile info for each project
        const projectsWithMembers = (data || []).map(project => ({
          ...project,
          members: (project.app_project_members || []).map(m => ({
            id: m.profiles?.id,
            name: m.profiles?.full_name || m.profiles?.username || 'Unknown',
            avatar: m.profiles?.avatar || '',
            email: m.profiles?.email || '',
            role: m.role,
            status: m.status,
          }))
        }));
        setProjects(projectsWithMembers);
      } catch (err) {
        setError('Failed to fetch projects');
        // Log the error for debugging
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Extract unique values for filters from real data
  const allDomains = [...new Set(projects.map(p => p.domain).filter(Boolean))];
  const allStatuses = [...new Set(projects.map(p => p.status).filter(Boolean))];
  const allTypes = [...new Set(projects.map(p => p.project_type).filter(Boolean))];
  const allSkills = [...new Set(projects.flatMap(p => p.required_skills || []))];

  // Filter projects based on current tab and filters
  const filteredProjects = projects.filter(project => {
    // Tab filtering
    if (selectedTab === 1) { // My Projects
      if (project.created_by !== userId) return false;
    } else if (selectedTab === 0) { // Discover
      if (project.created_by === userId || project.is_recruiting === false) return false;
    }
    // Search filtering
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (project.title && project.title.toLowerCase().includes(searchLower)) ||
        (project.description && project.description.toLowerCase().includes(searchLower)) ||
        (project.required_skills && project.required_skills.some(skill => skill.toLowerCase().includes(searchLower))) ||
        (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchLower)));
      if (!matchesSearch) return false;
    }
    // Filter by domain, status, type, skill
    if (selectedDomain && project.domain !== selectedDomain) return false;
    if (selectedStatus && project.status !== selectedStatus) return false;
    if (selectedType && project.project_type !== selectedType) return false;
    if (selectedSkill && !(project.required_skills || []).includes(selectedSkill)) return false;
    return true;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Zap size={12} />;
      case 'completed': return <CheckCircle size={12} />;
      case 'on_hold': return <Pause size={12} />;
      case 'cancelled': return <X size={12} />;
      default: return <Clock size={12} />;
    }
  };

  return (
    <>
      <NavBar />
      <StyledContainer>
        {/* Header */}
        <Box sx={{ 
          background: 'rgba(0, 0, 0, 0.2)', 
          backdropFilter: 'blur(16px)', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
        }}>
          <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography 
                  variant="h3" 
                  fontWeight={700} 
                  sx={{ 
                    background: 'linear-gradient(90deg, #00c6ff, #0072ff)',
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    mb: 1
                  }}
                >
                  Collaboration Space
                </Typography>
                <Typography variant="body1" color="#9ca3af">
                  Discover, create, and join exciting developer projects
                </Typography>
              </Box>
              <GradientButton startIcon={<Plus size={20} />}>
                Create Project
              </GradientButton>
            </Box>
          </Container>
        </Box>

        <Container maxWidth={false} sx={{ py: 4, px: { xs: 1, sm: 2, md: 4 } }}>
          {/* Tabs */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
            <Paper sx={{ 
              background: 'rgba(0, 0, 0, 0.2)', 
              backdropFilter: 'blur(16px)', 
              borderRadius: '16px',
              p: 0.5,
              minWidth: 400,
              display: 'inline-block',
            }}>
              <Tabs 
                value={selectedTab} 
                onChange={(e, newValue) => setSelectedTab(newValue)}
                sx={{ 
                  '& .MuiTabs-indicator': { display: 'none' },
                  '& .MuiTabs-flexContainer': { gap: 1, justifyContent: 'center' }
                }}
                centered
              >
                <StyledTab 
                  icon={<Search size={20} />} 
                  iconPosition="start" 
                  label="Discover Projects" 
                  sx={{ flex: 1 }}
                />
                <StyledTab 
                  icon={<Users size={20} />} 
                  iconPosition="start" 
                  label="My Projects" 
                  sx={{ flex: 1 }}
                />
              </Tabs>
            </Paper>
          </Box>

          {/* Search and Filters */}
          <Box sx={{ mb: 4 }}>
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
              <SearchField
                fullWidth
                placeholder="Search projects by title, description, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} color="#9ca3af" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Button
                variant="outlined"
                onClick={() => setShowFilters(!showFilters)}
                startIcon={<Filter size={20} />}
                sx={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  minWidth: 120,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }
                }}
              >
                Filters
              </Button>
            </Stack>

            <Collapse in={showFilters}>
              <FilterCard sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6} lg={3}>
                    <FormControl fullWidth sx={{ minWidth: 180 }}>
                      <InputLabel sx={{ color: '#9ca3af' }} shrink>Domain</InputLabel>
                      <StyledSelect
                        fullWidth
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value)}
                        label="Domain"
                        displayEmpty
                      >
                        <MenuItem value="">All Domains</MenuItem>
                        {allDomains.map(domain => (
                          <MenuItem key={domain} value={domain}>
                            {domain.replace('_', ' ')}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6} lg={3}>
                    <FormControl fullWidth sx={{ minWidth: 180 }}>
                      <InputLabel sx={{ color: '#9ca3af' }} shrink>Status</InputLabel>
                      <StyledSelect
                        fullWidth
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        label="Status"
                        displayEmpty
                      >
                        <MenuItem value="">All Statuses</MenuItem>
                        {allStatuses.map(status => (
                          <MenuItem key={status} value={status}>
                            {status.replace('_', ' ')}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6} lg={3}>
                    <FormControl fullWidth sx={{ minWidth: 180 }}>
                      <InputLabel sx={{ color: '#9ca3af' }} shrink>Type</InputLabel>
                      <StyledSelect
                        fullWidth
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        label="Type"
                        displayEmpty
                      >
                        <MenuItem value="">All Types</MenuItem>
                        {allTypes.map(type => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6} lg={3}>
                    <FormControl fullWidth sx={{ minWidth: 180 }}>
                      <InputLabel sx={{ color: '#9ca3af' }} shrink>Required Skill</InputLabel>
                      <StyledSelect
                        fullWidth
                        value={selectedSkill}
                        onChange={(e) => setSelectedSkill(e.target.value)}
                        label="Required Skill"
                        displayEmpty
                      >
                        <MenuItem value="">All Skills</MenuItem>
                        {allSkills.map(skill => (
                          <MenuItem key={skill} value={skill}>
                            {skill}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </FormControl>
                  </Grid>
                </Grid>
              </FilterCard>
            </Collapse>
          </Box>

          {/* Projects Grid */}
          <Grid container spacing={3} justifyContent="center">
            {loading && <Grid item xs={12}><Typography variant="h5" color="#9ca3af" textAlign="center">Loading projects...</Typography></Grid>}
            {error && <Grid item xs={12}><Typography variant="h5" color="#ef4444" textAlign="center">{error}</Typography></Grid>}
            {filteredProjects.length === 0 && !loading && !error ? (
              <Grid item xs={12}>
                <FilterCard sx={{ textAlign: 'center', py: 8 }}>
                  <Search size={64} color="#9ca3af" style={{ margin: '0 auto 16px' }} />
                  <Typography variant="h5" color="#9ca3af" gutterBottom>
                    No projects found
                  </Typography>
                  <Typography variant="body1" color="#6b7280">
                    Try adjusting your filters or search terms
                  </Typography>
                </FilterCard>
              </Grid>
            ) : (
              filteredProjects.map((project) => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={project.id} display="flex">
                  <GlassCard>
                    {/* Project Image */}
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={project.image_url}
                        alt={project.title}
                        sx={{
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                      />
                      
                      {/* Status and Difficulty badges */}
                      <Box sx={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 1 }}>
                        <StatusChip 
                          status={project.status}
                          icon={getStatusIcon(project.status)}
                          label={project.status.replace('_', ' ')}
                          size="small"
                        />
                        <DifficultyChip 
                          difficulty={project.difficulty_level}
                          label={project.difficulty_level}
                          size="small"
                        />
                      </Box>

                      {/* View and Like counts */}
                      <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                        <Paper sx={{ 
                          background: 'rgba(0, 0, 0, 0.5)', 
                          backdropFilter: 'blur(8px)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 1,
                          py: 0.5,
                          borderRadius: 1
                        }}>
                          <Eye size={16} color="#9ca3af" />
                          <Typography variant="caption" color="#9ca3af">
                            {project.view_count}
                          </Typography>
                        </Paper>
                        <Paper sx={{ 
                          background: 'rgba(0, 0, 0, 0.5)', 
                          backdropFilter: 'blur(8px)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 1,
                          py: 0.5,
                          borderRadius: 1
                        }}>
                          <Star size={16} color="#fbbf24" />
                          <Typography variant="caption" color="#9ca3af">
                            {project.like_count}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>

                    <CardContent>
                      <Typography variant="h6" fontWeight={600} color="#ffffff" gutterBottom>
                        {project.title}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="#9ca3af" 
                        sx={{ 
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {project.description}
                      </Typography>

                      {/* Tags */}
                      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        {project.tags && project.tags.slice(0, 3).map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(59, 130, 246, 0.2)',
                              color: '#93c5fd',
                              fontSize: '0.75rem',
                            }}
                          />
                        ))}
                        {project.tags && project.tags.length > 3 && (
                          <Chip
                            label={`+${project.tags.length - 3}`}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(107, 114, 128, 0.2)',
                              color: '#9ca3af',
                              fontSize: '0.75rem',
                            }}
                          />
                        )}
                      </Stack>

                      {/* Skills */}
                      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        {project.required_skills && project.required_skills.slice(0, 4).map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(139, 92, 246, 0.2)',
                              color: '#c4b5fd',
                              fontSize: '0.75rem',
                            }}
                          />
                        ))}
                        {project.required_skills && project.required_skills.length > 4 && (
                          <Chip
                            label={`+${project.required_skills.length - 4}`}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(107, 114, 128, 0.2)',
                              color: '#9ca3af',
                              fontSize: '0.75rem',
                            }}
                          />
                        )}
                      </Stack>

                      {/* Project Details */}
                      <Stack direction="row" spacing={2} sx={{ mb: 2, color: '#9ca3af' }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Clock size={16} />
                          <Typography variant="caption">{project.estimated_duration}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Users size={16} />
                          <Typography variant="caption">{project.team_size_min}-{project.team_size_max}</Typography>
                        </Stack>
                        {project.is_remote && (
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <MapPin size={16} />
                            <Typography variant="caption">Remote</Typography>
                          </Stack>
                        )}
                      </Stack>

                      {/* Team Members */}
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <AvatarGroup max={4}>
                          {project.members && project.members.map((member) => (
                            <Tooltip key={member.id} title={member.email} placement="top">
                              <Avatar
                                alt={member.name}
                                src={member.avatar}
                                sx={{ width: 32, height: 32, border: '2px solid #374151' }}
                              >
                                {(!member.avatar && member.name) ? member.name[0] : ''}
                              </Avatar>
                            </Tooltip>
                          ))}
                        </AvatarGroup>
                        <Typography variant="caption" color="#9ca3af">
                          {project.members && project.members.length} member{project.members && project.members.length !== 1 ? 's' : ''}
                        </Typography>
                      </Stack>

                      {/* Action Buttons */}
                      <Stack direction="row" spacing={1}>
                        {selectedTab === 0 && (
                          <GradientButton fullWidth>
                            Apply to Join
                          </GradientButton>
                        )}
                        {selectedTab === 1 && (
                          <GradientButton fullWidth startIcon={<MessageSquare size={16} />}>
                            Open Chat
                          </GradientButton>
                        )}
                        <IconButton>
                          <Eye size={16} />
                        </IconButton>
                        {project.github_url && (
                          <IconButton>
                            <GitBranch size={16} />
                          </IconButton>
                        )}
                      </Stack>
                    </CardContent>
                  </GlassCard>
                </Grid>
              ))
            )}
          </Grid>

          {/* Coming Soon Notice */}
          <FilterCard sx={{ mt: 8, textAlign: 'center' }}>
            <MessageSquare size={48} color="#60a5fa" style={{ margin: '0 auto 16px' }} />
            <Typography variant="h5" color="#ffffff" gutterBottom>
              Team Collaboration Features
            </Typography>
            <Typography variant="body1" color="#9ca3af" sx={{ mb: 2 }}>
              Auto-generated team chatrooms, real-time collaboration tools, and project management features coming soon!
            </Typography>
            <Stack direction="row" spacing={4} justifyContent="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <MessageSquare size={16} />
                <Typography variant="caption">Team Chat</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Code size={16} />
                <Typography variant="caption">Code Collaboration</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Users size={16} />
                <Typography variant="caption">Project Management</Typography>
              </Stack>
            </Stack>
          </FilterCard>
        </Container>
      </StyledContainer>
    </>
  );
}

export default ProjectsPage;