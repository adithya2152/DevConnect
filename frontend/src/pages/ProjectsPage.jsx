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
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  CircularProgress,
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
  X,
  Settings,
} from 'lucide-react';
import NavBar from '../components/nav';
import axios from 'axios';
// import { supabase } from '../api/supabase';
import useAuthGuard from '../hooks/useAuthGuarf';
import { createProject, applyToProject, getProjectApplications, acceptProjectApplication, denyProjectApplication, createProjectRoom, addUserToProjectRoom } from '../api/chatApi';

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

// Project Applications Modal Component
const ProjectApplicationsModal = ({ open, onClose, projectId, projectTitle }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (open && projectId) {
      fetchApplications();
    }
  }, [open, projectId]);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getProjectApplications(projectId);
      setApplications(response.applications || []);
    } catch (err) {
      setError('Failed to fetch applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (memberId) => {
    setActionLoading(prev => ({ ...prev, [memberId]: true }));
    try {
      await acceptProjectApplication(memberId);
      // Add user to project room
      await addUserToProjectRoom(projectId);
      // Refresh applications
      await fetchApplications();
    } catch (err) {
      console.error('Error accepting application:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [memberId]: false }));
    }
  };

  const handleDeny = async (memberId) => {
    setActionLoading(prev => ({ ...prev, [memberId]: true }));
    try {
      await denyProjectApplication(memberId);
      // Refresh applications
      await fetchApplications();
    } catch (err) {
      console.error('Error denying application:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [memberId]: false }));
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }
      }}
    >
      {/* Header with gradient background */}
      <Box sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 3,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
          opacity: 0.6
        }} />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={24} color="#ffffff" />
            </Box>
            <Typography variant="h4" sx={{ 
              color: '#ffffff', 
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Project Applications
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 500
          }}>
            "{projectTitle}"
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ 
        p: 0,
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(16px)',
        minHeight: '400px'
      }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            py: 8,
            gap: 2
          }}>
            <CircularProgress size={60} sx={{ color: '#667eea' }} />
            <Typography variant="h6" color="#ffffff" sx={{ fontWeight: 600 }}>
              Loading Applications...
            </Typography>
            <Typography variant="body2" color="#9ca3af">
              Fetching pending applications for your project
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            py: 8,
            gap: 2
          }}>
            <Box sx={{
              background: 'rgba(239, 68, 68, 0.2)',
              borderRadius: '50%',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <X size={32} color="#ef4444" />
            </Box>
            <Typography variant="h6" color="#ef4444" sx={{ fontWeight: 600 }}>
              Error Loading Applications
            </Typography>
            <Typography variant="body2" color="#9ca3af" sx={{ textAlign: 'center' }}>
              {error}
            </Typography>
          </Box>
        ) : applications.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            py: 8,
            gap: 2
          }}>
            <Box sx={{
              background: 'rgba(107, 114, 128, 0.2)',
              borderRadius: '50%',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={48} color="#6b7280" />
            </Box>
            <Typography variant="h6" color="#ffffff" sx={{ fontWeight: 600 }}>
              No Pending Applications
            </Typography>
            <Typography variant="body2" color="#9ca3af" sx={{ textAlign: 'center', maxWidth: 300 }}>
              You don't have any pending applications for this project yet. 
              Share your project to attract contributors!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" color="#ffffff" sx={{ 
              mb: 3, 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Badge badgeContent={applications.length} color="primary" sx={{
                '& .MuiBadge-badge': {
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  color: '#ffffff',
                  fontWeight: 600
                }
              }}>
                <Users size={20} />
              </Badge>
              Pending Applications ({applications.length})
            </Typography>
            
            <Stack spacing={3}>
              {applications.map((application, index) => (
                <Paper
                  key={application.id}
                  sx={{
                    p: 3,
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: 'rgba(102, 126, 234, 0.5)',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, #667eea, #764ba2)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    {/* Avatar Section */}
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        src={application.profiles?.avatar}
                        sx={{ 
                          width: 64, 
                          height: 64,
                          border: '3px solid rgba(102, 126, 234, 0.3)',
                          boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)'
                        }}
                      >
                        {application.profiles?.full_name?.[0] || application.profiles?.username?.[0] || 'U'}
                      </Avatar>
                      <Box sx={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(0, 0, 0, 0.1)'
                      }}>
                        <Clock size={12} color="#ffffff" />
                      </Box>
                    </Box>

                    {/* Content Section */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="h6" color="#ffffff" sx={{ fontWeight: 600 }}>
                          {application.profiles?.full_name || application.profiles?.username || 'Unknown User'}
                        </Typography>
                        <Chip 
                          label="Pending" 
                          size="small"
                          sx={{
                            background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="#9ca3af" sx={{ mb: 2 }}>
                        {application.profiles?.email}
                      </Typography>
                      
                      {application.contribution_description && (
                        <Box sx={{
                          background: 'rgba(102, 126, 234, 0.1)',
                          border: '1px solid rgba(102, 126, 234, 0.2)',
                          borderRadius: '12px',
                          p: 2,
                          mb: 2
                        }}>
                          <Typography variant="body2" color="#ffffff" sx={{ fontWeight: 500, mb: 0.5 }}>
                            Contribution Description:
                          </Typography>
                          <Typography variant="body2" color="#9ca3af" sx={{ fontStyle: 'italic' }}>
                            "{application.contribution_description}"
                          </Typography>
                        </Box>
                      )}

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                          variant="contained"
                          size="medium"
                          onClick={() => handleAccept(application.id)}
                          disabled={actionLoading[application.id]}
                          startIcon={actionLoading[application.id] ? <CircularProgress size={16} /> : <CheckCircle size={16} />}
                          sx={{
                            background: 'linear-gradient(90deg, #10b981, #059669)',
                            borderRadius: '12px',
                            fontWeight: 600,
                            textTransform: 'none',
                            px: 3,
                            py: 1,
                            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(90deg, #059669, #10b981)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                            },
                            '&:disabled': {
                              background: 'rgba(16, 185, 129, 0.3)',
                              transform: 'none',
                            }
                          }}
                        >
                          {actionLoading[application.id] ? 'Accepting...' : 'Accept'}
                        </Button>
                        
                        <Button
                          variant="outlined"
                          size="medium"
                          onClick={() => handleDeny(application.id)}
                          disabled={actionLoading[application.id]}
                          startIcon={actionLoading[application.id] ? <CircularProgress size={16} /> : <X size={16} />}
                          sx={{
                            borderColor: '#ef4444',
                            color: '#ef4444',
                            borderRadius: '12px',
                            fontWeight: 600,
                            textTransform: 'none',
                            px: 3,
                            py: 1,
                            '&:hover': {
                              borderColor: '#dc2626',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              transform: 'translateY(-1px)',
                            },
                            '&:disabled': {
                              borderColor: 'rgba(239, 68, 68, 0.3)',
                              color: 'rgba(239, 68, 68, 0.3)',
                              transform: 'none',
                            }
                          }}
                        >
                          {actionLoading[application.id] ? 'Denying...' : 'Deny'}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3, 
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Button 
          onClick={onClose} 
          sx={{ 
            color: '#9ca3af',
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            py: 1,
            borderRadius: '12px',
            '&:hover': {
              backgroundColor: 'rgba(156, 163, 175, 0.1)',
              color: '#ffffff'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// No Community Dialog Component
const NoCommunityDialog = ({ open, onClose, projectTitle }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
        }
      }}
    >
      <Box sx={{
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        p: 3,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.3) 0%, transparent 50%)',
          opacity: 0.6
        }} />
        
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            p: 2,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}>
            <Users size={32} color="#ffffff" />
          </Box>
          <Typography variant="h5" sx={{ 
            color: '#ffffff', 
            fontWeight: 700,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Community Not Created Yet
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="#ffffff" sx={{ mb: 2, fontWeight: 600 }}>
          "{projectTitle}" Community
        </Typography>
        <Typography variant="body1" color="#9ca3af" sx={{ mb: 3 }}>
          The project owner hasn't created a community space yet. 
          You'll be able to join the community once they set it up!
        </Typography>
        <Box sx={{
          background: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '12px',
          p: 3,
          mb: 3
        }}>
          <Typography variant="body2" color="#fbbf24" sx={{ fontWeight: 600 }}>
            💡 Tip: You can contact the project owner to request them to create a community space for better collaboration!
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        justifyContent: 'center'
      }}>
        <Button 
          onClick={onClose}
          sx={{ 
            background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
            color: '#ffffff',
            fontWeight: 600,
            textTransform: 'none',
            px: 4,
            py: 1.5,
            borderRadius: '12px',
            '&:hover': {
              background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
              transform: 'translateY(-1px)',
            }
          }}
        >
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Helper function to get proper image URL
const getProjectImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl === '' || imageUrl === 'EMPTY') {
    // Return a default project image - same as backend default
    return 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=300&fit=crop';
  }
  return imageUrl;
};

function ProjectsPage() {
  useAuthGuard();
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

  // Create Project Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    detailed_description: '',
    status: 'active',
    project_type: '',
    domain: '',
    difficulty_level: 'intermediate',
    required_skills: [],
    tech_stack: [],
    programming_languages: [],
    estimated_duration: '',
    team_size_min: 1,
    team_size_max: 5,
    is_remote: true,
    timezone_preference: '',
    github_url: '',
    demo_url: '',
    figma_url: '',
    documentation_url: '',
    image_url: '',
    is_recruiting: true,
    is_public: true,
    collaboration_type: 'open',
    tags: [],
    deadline: '',
    started_at: '',
    completed_at: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Apply to Join State
  const [applyLoading, setApplyLoading] = useState({}); // projectId: bool
  const [applySuccess, setApplySuccess] = useState({}); // projectId: string
  const [applyError, setApplyError] = useState({}); // projectId: string
  const [appliedProjects, setAppliedProjects] = useState([]); // projectIds

  // Project Applications Modal State
  const [applicationsModalOpen, setApplicationsModalOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [currentProjectTitle, setCurrentProjectTitle] = useState('');

  // Community/Room State
  const [roomLoading, setRoomLoading] = useState({});
  const [acceptedProjects, setAcceptedProjects] = useState([]); // Track projects where user is accepted
  const [projectsWithRooms, setProjectsWithRooms] = useState([]); // Track projects that have rooms created

  // No Community Dialog State
  const [noCommunityDialogOpen, setNoCommunityDialogOpen] = useState(false);
  const [noCommunityProjectTitle, setNoCommunityProjectTitle] = useState('');

  // Get logged-in user
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch projects and their members from the backend API
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          setLoading(false);
          return;
        }
        const res = await axios.get('http://localhost:8000/api/app_projects_with_members', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = res.data.projects;
        // Map members to a flat array of profile info for each project
        const projectsWithMembers = (data || []).map(project => ({
          ...project,
          members: (project.app_project_members || [])
            .filter(m => m.status === 'active')
            .map(m => ({
            id: m.profiles?.id,
            name: m.profiles?.full_name || m.profiles?.username || 'Unknown',
            avatar: m.profiles?.avatar || '',
            email: m.profiles?.email || '',
            role: m.role,
            status: m.status,
            })),
          applications_count: project.applications_count,
        }));
        setProjects(projectsWithMembers);
      } catch (err) {
        setError('Failed to fetch projects');
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // After fetching projects, mark already applied projects
  useEffect(() => {
    if (projects.length > 0 && userId) {
      const applied = projects.filter(p => (p.app_project_members || []).some(m => m.user_id === userId)).map(p => p.id);
      setAppliedProjects(applied);
      
      // Check which projects have rooms (for projects owned by current user)
      const projectsWithRooms = projects
        .filter(p => p.created_by === userId && p.room_id)
        .map(p => p.id);
      setProjectsWithRooms(projectsWithRooms);
    }
  }, [projects, userId]);

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

  // Create Project Handlers
  const handleCreateOpen = () => {
    setCreateOpen(true);
    setCreateError('');
    setCreateSuccess('');
  };
  const handleCreateClose = () => {
    setCreateOpen(false);
    setCreateForm({
      title: '', description: '', detailed_description: '', status: 'active', project_type: '', domain: '', difficulty_level: 'intermediate', required_skills: [], tech_stack: [], programming_languages: [], estimated_duration: '', team_size_min: 1, team_size_max: 5, is_remote: true, timezone_preference: '', github_url: '', demo_url: '', figma_url: '', documentation_url: '', image_url: '', is_recruiting: true, is_public: true, collaboration_type: 'open', tags: [], deadline: '', started_at: '', completed_at: '',
    });
    setCreateError('');
    setCreateSuccess('');
  };
  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm(f => ({ ...f, [name]: value }));
  };
  const handleCreateArrayChange = (name, value) => {
    setCreateForm(f => ({ ...f, [name]: value.split(',').map(s => s.trim()).filter(Boolean) }));
  };
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess('');
    try {
      // Convert empty string date fields to null
      const payload = { ...createForm, created_by: userId };
      ['deadline', 'started_at', 'completed_at'].forEach(field => {
        if (payload[field] === '') payload[field] = null;
      });
      await createProject(payload);
      setCreateSuccess('Project created!');
      handleCreateClose();
      // Refresh projects
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }
      const res = await axios.get('http://localhost:8000/api/app_projects_with_members', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = res.data.projects;
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
      setCreateError('Failed to create project');
    } finally {
      setCreateLoading(false);
    }
  };

  // Apply to Join Handler
  const handleApply = async (projectId) => {
    setApplyLoading(a => ({ ...a, [projectId]: true }));
    setApplyError(a => ({ ...a, [projectId]: '' }));
    setApplySuccess(a => ({ ...a, [projectId]: '' }));
    try {
      await applyToProject({ project_id: projectId, user_id: userId });
      setApplySuccess(a => ({ ...a, [projectId]: 'Applied!' }));
      setAppliedProjects(ap => [...ap, projectId]);
    } catch (err) {
      setApplyError(a => ({ ...a, [projectId]: 'Failed to apply' }));
    } finally {
      setApplyLoading(a => ({ ...a, [projectId]: false }));
    }
  };

  // Open Applications Modal Handler
  const handleOpenApplicationsModal = (projectId, projectTitle) => {
    setCurrentProjectId(projectId);
    setCurrentProjectTitle(projectTitle);
    setApplicationsModalOpen(true);
  };

  const handleCloseApplicationsModal = () => {
    setApplicationsModalOpen(false);
    setCurrentProjectId(null);
    setCurrentProjectTitle('');
  };

  const handleCloseNoCommunityDialog = () => {
    setNoCommunityDialogOpen(false);
    setNoCommunityProjectTitle('');
  };

  // Community/Room Handlers
  const handleCreateCommunity = async (projectId) => {
    // If room already exists, just navigate to community
    if (projectsWithRooms.includes(projectId)) {
      window.location.href = '/community';
      return;
    }
    
    // Prevent multiple clicks during creation
    if (roomLoading[projectId]) {
      return;
    }
    
    setRoomLoading(prev => ({ ...prev, [projectId]: true }));
    try {
      const result = await createProjectRoom(projectId);
      console.log('Room creation result:', result);
      
      // Add to projects with rooms
      setProjectsWithRooms(prev => [...prev, projectId]);
      
      // Navigate to community page
      window.location.href = '/community';
    } catch (err) {
      console.error('Error creating community:', err);
      // Don't update state on error
    } finally {
      setRoomLoading(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handleJoinCommunity = async (projectId) => {
    // Check if project has a room
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.room_id) {
      // Show no community dialog
      setNoCommunityProjectTitle(project?.title || 'Unknown Project');
      setNoCommunityDialogOpen(true);
      return;
    }

    setRoomLoading(prev => ({ ...prev, [projectId]: true }));
    try {
      await addUserToProjectRoom(projectId);
      // Navigate to community page
      window.location.href = '/community';
    } catch (err) {
      console.error('Error joining community:', err);
    } finally {
      setRoomLoading(prev => ({ ...prev, [projectId]: false }));
    }
  };

  // Update accepted projects when applications are accepted
  useEffect(() => {
    if (projects.length > 0 && userId) {
      const accepted = projects.filter(p => 
        (p.app_project_members || []).some(m => 
          m.user_id === userId && m.status === 'active'
        )
      ).map(p => p.id);
      setAcceptedProjects(accepted);
    }
  }, [projects, userId]);

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
                  Projects Space
                </Typography>
                <Typography variant="body1" color="#9ca3af">
                  Discover, create, and join exciting developer projects
                </Typography>
              </Box>
              <GradientButton startIcon={<Plus size={20} />} onClick={handleCreateOpen}>
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
                          <MenuItem key={domain} value={domain} sx={{ color: '#fff' }}>
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
                          <MenuItem key={status} value={status} sx={{ color: '#fff' }}>
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
                          <MenuItem key={type} value={type} sx={{ color: '#fff' }}>
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
                          <MenuItem key={skill} value={skill} sx={{ color: '#fff' }}>
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
                        image={getProjectImageUrl(project.image_url)}
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
                          <>
                            {acceptedProjects.includes(project.id) ? (
                              <GradientButton 
                                fullWidth 
                                onClick={() => handleJoinCommunity(project.id)}
                                disabled={roomLoading[project.id]}
                                startIcon={<MessageSquare size={16} />}
                              >
                                {roomLoading[project.id] ? 'Joining...' : 'Join Community'}
                              </GradientButton>
                            ) : (
                          <GradientButton fullWidth onClick={() => handleApply(project.id)} disabled={applyLoading[project.id] || appliedProjects.includes(project.id)}>
                            {applyLoading[project.id] ? 'Applying...' : appliedProjects.includes(project.id) ? 'Applied!' : 'Apply to Join'}
                          </GradientButton>
                            )}
                          </>
                        )}
                        {selectedTab === 1 && (
                          <>
                            <GradientButton 
                              fullWidth 
                              startIcon={<MessageSquare size={16} />} 
                              onClick={() => handleOpenApplicationsModal(project.id, project.title)}
                            >
                              View Applications ({project.applications_count || 0})
                          </GradientButton>
                            <GradientButton 
                              fullWidth 
                              onClick={() => handleCreateCommunity(project.id)}
                              disabled={roomLoading[project.id]}
                              startIcon={<Users size={16} />}
                              sx={{
                                background: projectsWithRooms.includes(project.id) 
                                  ? 'linear-gradient(90deg, #10b981, #059669)' 
                                  : 'linear-gradient(90deg, #8b5cf6, #a855f7)',
                                '&:hover': {
                                  background: projectsWithRooms.includes(project.id)
                                    ? 'linear-gradient(90deg, #059669, #10b981)'
                                    : 'linear-gradient(90deg, #a855f7, #8b5cf6)',
                                },
                                '&:disabled': {
                                  background: 'rgba(139, 92, 246, 0.3)',
                                  color: 'rgba(255, 255, 255, 0.7)',
                                }
                              }}
                            >
                              {roomLoading[project.id] ? 'Creating...' : projectsWithRooms.includes(project.id) ? 'Go to Community' : 'Create Community'}
                            </GradientButton>
                          </>
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

          {/* Create Project Modal */}
          <Dialog open={createOpen} onClose={handleCreateClose} maxWidth="lg" fullWidth sx={{ alignItems: 'flex-start' }} PaperProps={{ sx: { background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(24px)', minWidth: { md: 700 }, width: 900, maxWidth: '90vw', position: 'relative' } }}>
            <IconButton onClick={handleCreateClose} sx={{ position: 'absolute', top: 12, right: 12, color: '#fff', zIndex: 10 }}>
              <X size={28} />
            </IconButton>
            <DialogTitle sx={{ color: '#fff', fontWeight: 700, fontSize: 28, letterSpacing: 1 }}>Create New Project</DialogTitle>
            <DialogContent sx={{ p: 4, overflowY: 'auto', maxHeight: '90vh' }}>
              <Box component="form" onSubmit={handleCreateSubmit} sx={{ width: '100%' }}>
                
                {/* Basic Information Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ 
                    color: '#ffffff', 
                    fontWeight: 600, 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Code size={20} />
                    Basic Information
                  </Typography>
                  
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                    <TextField
                        label="Project Title"
                      name="title"
                      value={createForm.title}
                      onChange={handleCreateChange}
                      fullWidth
                      required
                        placeholder="Enter your project title"
                        InputLabelProps={{ style: { color: '#9ca3af' } }}
                        InputProps={{ 
                          style: { color: '#ffffff' }, 
                          startAdornment: (
                        <InputAdornment position="start">
                          <Code size={20} color="#9ca3af" />
                        </InputAdornment>
                          ) 
                        }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&.Mui-focused': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#ffffff',
                            '&::placeholder': {
                              color: '#9ca3af',
                              opacity: 1,
                            },
                        },
                      }}
                    />
                  </Grid>
                    
                    <Grid item xs={12}>
                    <TextField
                        label="Short Description"
                      name="description"
                      value={createForm.description}
                      onChange={handleCreateChange}
                      fullWidth
                      required
                        placeholder="Brief description of your project"
                        InputLabelProps={{ style: { color: '#9ca3af' } }}
                        InputProps={{ 
                          style: { color: '#ffffff' }, 
                          startAdornment: (
                        <InputAdornment position="start">
                          <MessageSquare size={20} color="#9ca3af" />
                        </InputAdornment>
                          ) 
                        }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&.Mui-focused': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#ffffff',
                            '&::placeholder': {
                              color: '#9ca3af',
                              opacity: 1,
                            },
                        },
                      }}
                    />
                  </Grid>
                    
                    <Grid item xs={12}>
                    <TextField
                      label="Detailed Description"
                      name="detailed_description"
                      value={createForm.detailed_description}
                      onChange={handleCreateChange}
                      fullWidth
                      multiline
                        rows={4}
                        placeholder="Provide a detailed description of your project, goals, and requirements"
                        InputLabelProps={{ style: { color: '#9ca3af' } }}
                        InputProps={{ 
                          style: { color: '#ffffff' }, 
                          startAdornment: (
                        <InputAdornment position="start">
                          <Code size={20} color="#9ca3af" />
                        </InputAdornment>
                          ) 
                        }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&.Mui-focused': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#ffffff',
                            '&::placeholder': {
                              color: '#9ca3af',
                              opacity: 1,
                            },
                        },
                      }}
                    />
                  </Grid>
                  </Grid>
                </Box>

                {/* Project Details Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ 
                    color: '#ffffff', 
                    fontWeight: 600, 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Settings size={20} />
                    Project Details
                  </Typography>
                  
                  <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Estimated Duration"
                      name="estimated_duration"
                      value={createForm.estimated_duration}
                      onChange={handleCreateChange}
                      fullWidth
                      required
                        placeholder="e.g., 2-3 months, 6 weeks"
                        InputLabelProps={{ style: { color: '#9ca3af' } }}
                        InputProps={{ 
                          style: { color: '#ffffff' }, 
                          startAdornment: (
                        <InputAdornment position="start">
                          <Clock size={20} color="#9ca3af" />
                        </InputAdornment>
                          ) 
                        }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&.Mui-focused': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#ffffff',
                            '&::placeholder': {
                              color: '#9ca3af',
                              opacity: 1,
                            },
                        },
                      }}
                    />
                  </Grid>
                    
                  <Grid item xs={6} md={3}>
                    <TextField
                      label="Team Size (Min)"
                      name="team_size_min"
                      type="number"
                      value={createForm.team_size_min}
                      onChange={handleCreateChange}
                      fullWidth
                      required
                        InputLabelProps={{ style: { color: '#9ca3af' } }}
                        InputProps={{ 
                          style: { color: '#ffffff' }, 
                          startAdornment: (
                        <InputAdornment position="start">
                          <Users size={20} color="#9ca3af" />
                        </InputAdornment>
                          ) 
                        }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&.Mui-focused': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#ffffff',
                        },
                      }}
                    />
                  </Grid>
                    
                  <Grid item xs={6} md={3}>
                    <TextField
                      label="Team Size (Max)"
                      name="team_size_max"
                      type="number"
                      value={createForm.team_size_max}
                      onChange={handleCreateChange}
                      fullWidth
                      required
                        InputLabelProps={{ style: { color: '#9ca3af' } }}
                        InputProps={{ 
                          style: { color: '#ffffff' }, 
                          startAdornment: (
                        <InputAdornment position="start">
                          <Users size={20} color="#9ca3af" />
                        </InputAdornment>
                          ) 
                        }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&.Mui-focused': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#ffffff',
                        },
                      }}
                    />
                  </Grid>
                    
                  <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: '#9ca3af' }}>Status</InputLabel>
                      <StyledSelect
                        fullWidth
                        value={createForm.status}
                        onChange={e => setCreateForm(f => ({ ...f, status: String(e.target.value) }))}
                        label="Status"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                              },
                              '&.Mui-focused': {
                                borderColor: '#667eea',
                                boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                              },
                            },
                            '& .MuiSelect-select': { color: '#ffffff' }
                          }}
                          MenuProps={{ 
                            PaperProps: { 
                              sx: { 
                                background: 'rgba(30,30,30,0.95)', 
                                color: '#fff',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px'
                              } 
                            } 
                        }}
                      >
                        <MenuItem value="active" sx={{ color: '#fff' }}>Active</MenuItem>
                        <MenuItem value="completed" sx={{ color: '#fff' }}>Completed</MenuItem>
                        <MenuItem value="on_hold" sx={{ color: '#fff' }}>On Hold</MenuItem>
                        <MenuItem value="cancelled" sx={{ color: '#fff' }}>Cancelled</MenuItem>
                      </StyledSelect>
                    </FormControl>
                  </Grid>
                    
                  <Grid item xs={12} md={8}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: '#9ca3af' }}>Project Type</InputLabel>
                      <StyledSelect
                        fullWidth
                        value={createForm.project_type}
                        onChange={e => setCreateForm(f => ({ ...f, project_type: String(e.target.value) }))}
                        label="Project Type"
                          sx={{
                            width: '100%',
                            minWidth: '100%',
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              width: '100%',
                              minWidth: '100%',
                              '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                              },
                              '&.Mui-focused': {
                                borderColor: '#667eea',
                                boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                              },
                            },
                            '& .MuiSelect-select': { 
                              color: '#ffffff',
                              width: '100%',
                              minWidth: '100%',
                              display: 'flex',
                              alignItems: 'center',
                            },
                            '& .MuiInputBase-input': {
                              width: '100%',
                              minWidth: '100%',
                            }
                          }}
                          MenuProps={{ 
                            PaperProps: { 
                              sx: { 
                                background: 'rgba(30,30,30,0.95)', 
                                color: '#fff',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px'
                              } 
                            } 
                        }}
                      >
                        <MenuItem value="full_stack" sx={{ color: '#fff' }}>Full Stack</MenuItem>
                        <MenuItem value="frontend" sx={{ color: '#fff' }}>Frontend</MenuItem>
                        <MenuItem value="backend" sx={{ color: '#fff' }}>Backend</MenuItem>
                        <MenuItem value="mobile" sx={{ color: '#fff' }}>Mobile</MenuItem>
                        <MenuItem value="design" sx={{ color: '#fff' }}>Design</MenuItem>
                        <MenuItem value="devops" sx={{ color: '#fff' }}>DevOps</MenuItem>
                      </StyledSelect>
                    </FormControl>
                  </Grid>
                    
                  <Grid item xs={12} md={8}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: '#9ca3af' }}>Domain</InputLabel>
                      <StyledSelect
                        fullWidth
                        value={createForm.domain}
                        onChange={e => setCreateForm(f => ({ ...f, domain: String(e.target.value) }))}
                        label="Domain"
                          sx={{
                            width: '100%',
                            minWidth: '100%',
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              width: '100%',
                              minWidth: '100%',
                              '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                              },
                              '&.Mui-focused': {
                                borderColor: '#667eea',
                                boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            },
                          },
                          '& .MuiSelect-select': { 
                            color: '#ffffff',
                            width: '100%',
                            minWidth: '100%',
                            display: 'flex',
                            alignItems: 'center',
                          },
                          '& .MuiInputBase-input': {
                            width: '100%',
                            minWidth: '100%',
                          }
                        }}
                        MenuProps={{ 
                          PaperProps: { 
                            sx: { 
                              background: 'rgba(30,30,30,0.95)', 
                              color: '#fff',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px'
                            } 
                          } 
                        }}
                      >
                        <MenuItem value="web_development" sx={{ color: '#fff' }}>Web Development</MenuItem>
                        <MenuItem value="mobile_development" sx={{ color: '#fff' }}>Mobile Development</MenuItem>
                        <MenuItem value="backend_development" sx={{ color: '#fff' }}>Backend Development</MenuItem>
                        <MenuItem value="data_science" sx={{ color: '#fff' }}>Data Science</MenuItem>
                        <MenuItem value="machine_learning" sx={{ color: '#fff' }}>Machine Learning</MenuItem>
                        <MenuItem value="ai_ml" sx={{ color: '#fff' }}>AI/ML</MenuItem>
                        <MenuItem value="blockchain" sx={{ color: '#fff' }}>Blockchain</MenuItem>
                        <MenuItem value="security" sx={{ color: '#fff' }}>Security</MenuItem>
                        <MenuItem value="testing" sx={{ color: '#fff' }}>Testing</MenuItem>
                        <MenuItem value="devops" sx={{ color: '#fff' }}>DevOps</MenuItem>
                        <MenuItem value="design" sx={{ color: '#fff' }}>Design</MenuItem>
                        <MenuItem value="product" sx={{ color: '#fff' }}>Product</MenuItem>
                        <MenuItem value="research" sx={{ color: '#fff' }}>Research</MenuItem>
                        <MenuItem value="other" sx={{ color: '#fff' }}>Other</MenuItem>
                      </StyledSelect>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: '#9ca3af' }}>Difficulty Level</InputLabel>
                      <StyledSelect
                        fullWidth
                        value={createForm.difficulty_level}
                        onChange={e => setCreateForm(f => ({ ...f, difficulty_level: String(e.target.value) }))}
                        label="Difficulty Level"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&.Mui-focused': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            },
                          },
                          '& .MuiSelect-select': { color: '#ffffff' }
                        }}
                        MenuProps={{ 
                          PaperProps: { 
                            sx: { 
                              background: 'rgba(30,30,30,0.95)', 
                              color: '#fff',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px'
                            } 
                          } 
                        }}
                      >
                        <MenuItem value="beginner" sx={{ color: '#fff' }}>Beginner</MenuItem>
                        <MenuItem value="intermediate" sx={{ color: '#fff' }}>Intermediate</MenuItem>
                        <MenuItem value="advanced" sx={{ color: '#fff' }}>Advanced</MenuItem>
                        <MenuItem value="expert" sx={{ color: '#fff' }}>Expert</MenuItem>
                      </StyledSelect>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

                {/* Skills & Technologies Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ 
                    color: '#ffffff', 
                    fontWeight: 600, 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Code size={20} />
                    Skills & Technologies
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                    <TextField
                        label="Required Skills"
                      name="required_skills"
                      value={createForm.required_skills.join(', ')}
                      onChange={(e) => handleCreateArrayChange('required_skills', e.target.value)}
                      fullWidth
                        placeholder="React, Node.js, Python (comma-separated)"
                        InputLabelProps={{ style: { color: '#9ca3af' } }}
                        InputProps={{ 
                          style: { color: '#ffffff' }, 
                          startAdornment: (
                        <InputAdornment position="start">
                          <Users size={20} color="#9ca3af" />
                        </InputAdornment>
                          ) 
                        }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&.Mui-focused': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#ffffff',
                            '&::placeholder': {
                              color: '#9ca3af',
                              opacity: 1,
                            },
                        },
                      }}
                    />
                  </Grid>
                    
                    <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}
                      value={createForm.tech_stack}
                      onChange={(e, v) => setCreateForm(f => ({ ...f, tech_stack: v }))}
                        renderTags={(value, getTagProps) => value.map((option, index) => (
                          <Chip 
                            key={index} 
                            variant="outlined" 
                            label={option} 
                            {...getTagProps({ index, key: undefined })} 
                            sx={{ 
                              color: '#ffffff', 
                              borderColor: '#667eea', 
                              background: 'rgba(102, 126, 234, 0.2)',
                              '&:hover': {
                                background: 'rgba(102, 126, 234, 0.3)',
                              }
                            }} 
                          />
                        ))}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Tech Stack" 
                            InputLabelProps={{ style: { color: '#9ca3af' } }}
                            fullWidth 
                            placeholder="Enter technologies (press Enter to add)" 
                            InputProps={{ 
                              ...params.InputProps, 
                              style: { color: '#ffffff' } 
                            }} 
                            sx={{ 
                              width: '100%',
                              minWidth: '100%',
                              '& .MuiOutlinedInput-root': {
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                minHeight: '56px',
                                width: '100%',
                                '&:hover': {
                                  borderColor: 'rgba(255, 255, 255, 0.2)',
                                },
                                '&.Mui-focused': {
                                  borderColor: '#667eea',
                                  boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                                },
                              },
                              '& .MuiInputBase-input': {
                                color: '#ffffff',
                                padding: '16.5px 14px',
                                width: '100%',
                                '&::placeholder': {
                                  color: '#9ca3af',
                                  opacity: 1,
                                },
                              },
                              '& .MuiAutocomplete-input': {
                                padding: '0 !important',
                                width: '100% !important',
                                minWidth: '100% !important',
                              },
                              '& .MuiAutocomplete-inputRoot': {
                                width: '100%',
                                minWidth: '100%',
                              },
                            }} 
                          />
                        )}
                    />
                  </Grid>
                    
                    <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}
                      value={createForm.programming_languages}
                      onChange={(e, v) => setCreateForm(f => ({ ...f, programming_languages: v }))}
                        renderTags={(value, getTagProps) => value.map((option, index) => (
                          <Chip 
                            key={index} 
                            variant="outlined" 
                            label={option} 
                            {...getTagProps({ index, key: undefined })} 
                            sx={{ 
                              color: '#ffffff', 
                              borderColor: '#8b5cf6', 
                              background: 'rgba(139, 92, 246, 0.2)',
                              '&:hover': {
                                background: 'rgba(139, 92, 246, 0.3)',
                              }
                            }} 
                          />
                        ))}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Programming Languages" 
                            InputLabelProps={{ style: { color: '#9ca3af' } }}
                            fullWidth 
                            placeholder="Enter languages (press Enter to add)" 
                            InputProps={{ 
                              ...params.InputProps, 
                              style: { color: '#ffffff' } 
                            }} 
                            sx={{ 
                              width: '100%',
                              minWidth: '100%',
                              '& .MuiInputBase-input': {
                                color: '#ffffff',
                                padding: '16.5px 14px',
                                width: '100%',
                                '&::placeholder': {
                                  color: '#9ca3af',
                                  opacity: 1,
                                },
                              },
                              '& .MuiOutlinedInput-root': {
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                minHeight: '56px',
                                width: '100%',
                                '&:hover': {
                                  borderColor: 'rgba(255, 255, 255, 0.2)',
                                },
                                '&.Mui-focused': {
                                  borderColor: '#667eea',
                                  boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                                },
                              },
                              '& .MuiAutocomplete-input': {
                                padding: '0 !important',
                                width: '100% !important',
                                minWidth: '100% !important',
                              },
                              '& .MuiAutocomplete-inputRoot': {
                                width: '100%',
                                minWidth: '100%',
                              },
                            }} 
                          />
                        )}
                    />
                  </Grid>
                  </Grid>
                </Box>
                {/* Work Settings Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ 
                    color: '#ffffff', 
                    fontWeight: 600, 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <MapPin size={20} />
                    Work Settings
                  </Typography>
                  
                  <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: '#9ca3af' }}>Is Remote</InputLabel>
                      <StyledSelect
                        fullWidth
                        value={createForm.is_remote ? 'true' : 'false'}
                        onChange={e => setCreateForm(f => ({ ...f, is_remote: String(e.target.value) === 'true' }))}
                        label="Is Remote"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                              },
                              '&.Mui-focused': {
                                borderColor: '#667eea',
                                boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                              },
                            },
                            '& .MuiSelect-select': { color: '#ffffff' }
                          }}
                          MenuProps={{ 
                            PaperProps: { 
                              sx: { 
                                background: 'rgba(30,30,30,0.95)', 
                                color: '#fff',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px'
                              } 
                            } 
                        }}
                      >
                        <MenuItem value="true" sx={{ color: '#fff' }}>Yes</MenuItem>
                        <MenuItem value="false" sx={{ color: '#fff' }}>No</MenuItem>
                      </StyledSelect>
                    </FormControl>
                  </Grid>
                    
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Timezone Preference"
                      name="timezone_preference"
                      value={createForm.timezone_preference}
                      onChange={handleCreateChange}
                      fullWidth
                        placeholder="e.g., UTC+5:30, EST, PST"
                        InputLabelProps={{ style: { color: '#9ca3af' } }}
                        InputProps={{ 
                          style: { color: '#ffffff' }, 
                          startAdornment: (
                        <InputAdornment position="start">
                          <MapPin size={20} color="#9ca3af" />
                        </InputAdornment>
                          ) 
                        }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&.Mui-focused': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#ffffff',
                            '&::placeholder': {
                              color: '#9ca3af',
                              opacity: 1,
                            },
                        },
                      }}
                    />
                  </Grid>
                  </Grid>
                </Box>

                {/* Project Links Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ 
                    color: '#ffffff', 
                    fontWeight: 600, 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <GitBranch size={20} />
                    Project Links
                  </Typography>
                  
                  <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                        label="GitHub URL"
                      name="github_url"
                      value={createForm.github_url}
                      onChange={handleCreateChange}
                      fullWidth
                        placeholder="https://github.com/username/project"
                        InputLabelProps={{ style: { color: '#9ca3af' } }}
                        InputProps={{ 
                          style: { color: '#ffffff' }, 
                          startAdornment: (
                        <InputAdornment position="start">
                          <GitBranch size={20} color="#9ca3af" />
                        </InputAdornment>
                          ) 
                        }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&.Mui-focused': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#ffffff',
                            '&::placeholder': {
                              color: '#9ca3af',
                              opacity: 1,
                            },
                        },
                      }}
                    />
                  </Grid>
                    
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Demo URL"
                      name="demo_url"
                      value={createForm.demo_url}
                      onChange={handleCreateChange}
                      fullWidth
                        placeholder="https://demo.example.com"
                        InputLabelProps={{ style: { color: '#9ca3af' } }}
                        InputProps={{ 
                          style: { color: '#ffffff' }, 
                          startAdornment: (
                        <InputAdornment position="start">
                          <GitBranch size={20} color="#9ca3af" />
                        </InputAdornment>
                          ) 
                        }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&.Mui-focused': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#ffffff',
                            '&::placeholder': {
                              color: '#9ca3af',
                              opacity: 1,
                            },
                        },
                      }}
                    />
                  </Grid>
                    
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Figma URL"
                      name="figma_url"
                      value={createForm.figma_url}
                      onChange={handleCreateChange}
                      fullWidth
                        placeholder="https://figma.com/file/..."
                        InputLabelProps={{ style: { color: '#9ca3af' } }}
                        InputProps={{ 
                          style: { color: '#ffffff' }, 
                          startAdornment: (
                        <InputAdornment position="start">
                          <Code size={20} color="#9ca3af" />
                        </InputAdornment>
                          ) 
                        }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&.Mui-focused': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#ffffff',
                            '&::placeholder': {
                              color: '#9ca3af',
                              opacity: 1,
                            },
                        },
                      }}
                    />
                  </Grid>
                    
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Documentation URL"
                      name="documentation_url"
                      value={createForm.documentation_url}
                      onChange={handleCreateChange}
                      fullWidth
                        placeholder="https://docs.example.com"
                        InputLabelProps={{ style: { color: '#9ca3af' } }}
                        InputProps={{ 
                          style: { color: '#ffffff' }, 
                          startAdornment: (
                        <InputAdornment position="start">
                          <Code size={20} color="#9ca3af" />
                        </InputAdornment>
                          ) 
                        }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&.Mui-focused': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#ffffff',
                            '&::placeholder': {
                              color: '#9ca3af',
                              opacity: 1,
                            },
                        },
                      }}
                    />
                  </Grid>
                    
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Image URL"
                      name="image_url"
                      value={createForm.image_url}
                      onChange={handleCreateChange}
                      fullWidth
                        placeholder="https://example.com/image.jpg"
                        InputLabelProps={{ style: { color: '#9ca3af' } }}
                        InputProps={{ 
                          style: { color: '#ffffff' }, 
                          startAdornment: (
                        <InputAdornment position="start">
                          <Code size={20} color="#9ca3af" />
                        </InputAdornment>
                          ) 
                        }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&.Mui-focused': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#ffffff',
                            '&::placeholder': {
                              color: '#9ca3af',
                              opacity: 1,
                            },
                        },
                      }}
                    />
                  </Grid>
                  </Grid>
                </Box>

                {/* Project Settings Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ 
                    color: '#ffffff', 
                    fontWeight: 600, 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Code size={20} />
                    Project Settings
                  </Typography>
                  
                  <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: '#9ca3af' }}>Is Recruiting</InputLabel>
                      <StyledSelect
                        fullWidth
                        value={createForm.is_recruiting ? 'true' : 'false'}
                        onChange={e => setCreateForm(f => ({ ...f, is_recruiting: String(e.target.value) === 'true' }))}
                        label="Is Recruiting"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                              },
                              '&.Mui-focused': {
                                borderColor: '#667eea',
                                boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                              },
                            },
                            '& .MuiSelect-select': { color: '#ffffff' }
                          }}
                          MenuProps={{ 
                            PaperProps: { 
                              sx: { 
                                background: 'rgba(30,30,30,0.95)', 
                                color: '#fff',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px'
                              } 
                            } 
                        }}
                      >
                        <MenuItem value="true" sx={{ color: '#fff' }}>Yes</MenuItem>
                        <MenuItem value="false" sx={{ color: '#fff' }}>No</MenuItem>
                      </StyledSelect>
                    </FormControl>
                  </Grid>
                    
                  <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: '#9ca3af' }}>Is Public</InputLabel>
                      <StyledSelect
                        fullWidth
                        value={createForm.is_public ? 'true' : 'false'}
                        onChange={e => setCreateForm(f => ({ ...f, is_public: String(e.target.value) === 'true' }))}
                        label="Is Public"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                              },
                              '&.Mui-focused': {
                                borderColor: '#667eea',
                                boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                              },
                            },
                            '& .MuiSelect-select': { color: '#ffffff' }
                          }}
                          MenuProps={{ 
                            PaperProps: { 
                              sx: { 
                                background: 'rgba(30,30,30,0.95)', 
                                color: '#fff',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px'
                              } 
                            } 
                        }}
                      >
                        <MenuItem value="true" sx={{ color: '#fff' }}>Yes</MenuItem>
                        <MenuItem value="false" sx={{ color: '#fff' }}>No</MenuItem>
                      </StyledSelect>
                    </FormControl>
                  </Grid>
                    
                  <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: '#9ca3af' }}>Collaboration Type</InputLabel>
                      <StyledSelect
                        fullWidth
                        value={createForm.collaboration_type}
                        onChange={e => setCreateForm(f => ({ ...f, collaboration_type: String(e.target.value) }))}
                        label="Collaboration Type"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                              },
                              '&.Mui-focused': {
                                borderColor: '#667eea',
                                boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            },
                          },
                          '& .MuiSelect-select': { color: '#ffffff' }
                        }}
                        MenuProps={{ 
                          PaperProps: { 
                            sx: { 
                              background: 'rgba(30,30,30,0.95)', 
                              color: '#fff',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px'
                            } 
                          } 
                        }}
                      >
                        <MenuItem value="open" sx={{ color: '#fff' }}>Open</MenuItem>
                        <MenuItem value="closed" sx={{ color: '#fff' }}>Closed</MenuItem>
                        <MenuItem value="private" sx={{ color: '#fff' }}>Private</MenuItem>
                      </StyledSelect>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}
                      value={createForm.tags}
                      onChange={(e, v) => setCreateForm(f => ({ ...f, tags: v }))}
                      renderTags={(value, getTagProps) => value.map((option, index) => (
                        <Chip 
                          key={index} 
                          variant="outlined" 
                          label={option} 
                          {...getTagProps({ index, key: undefined })} 
                          sx={{ 
                            color: '#ffffff', 
                            borderColor: '#10b981', 
                            background: 'rgba(16, 185, 129, 0.2)',
                            '&:hover': {
                              background: 'rgba(16, 185, 129, 0.3)',
                            }
                          }} 
                        />
                      ))}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Tags" 
                          fullWidth 
                          placeholder="Enter tags (press Enter to add)" 
                          InputProps={{ 
                            ...params.InputProps, 
                            style: { color: '#ffffff' } 
                          }} 
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                              },
                              '&.Mui-focused': {
                                borderColor: '#667eea',
                                boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                              },
                            },
                            '& .MuiInputBase-input': {
                              color: '#ffffff',
                              '&::placeholder': {
                                color: '#9ca3af',
                                opacity: 1,
                              },
                            },
                          }} 
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>

                {/* Important Dates Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ 
                    color: '#ffffff', 
                    fontWeight: 600, 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Calendar size={20} />
                    Important Dates
                  </Typography>
                  
                  <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                        label="Deadline"
                      name="deadline"
                        type="date"
                      value={createForm.deadline}
                      onChange={handleCreateChange}
                      fullWidth
                        InputLabelProps={{ 
                          style: { color: '#9ca3af' },
                          shrink: true
                        }}
                        InputProps={{ 
                          style: { color: '#ffffff' }, 
                          startAdornment: (
                        <InputAdornment position="start">
                          <Calendar size={20} color="#9ca3af" />
                        </InputAdornment>
                          ) 
                        }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&.Mui-focused': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#ffffff',
                          },
                          '& input[type="date"]::-webkit-calendar-picker-indicator': {
                            filter: 'invert(1)',
                        },
                      }}
                    />
                  </Grid>
                    
                  <Grid item xs={12} md={4}>
                    <TextField
                        label="Started At"
                      name="started_at"
                        type="date"
                      value={createForm.started_at}
                      onChange={handleCreateChange}
                      fullWidth
                        InputLabelProps={{ 
                          style: { color: '#9ca3af' },
                          shrink: true
                        }}
                        InputProps={{ 
                          style: { color: '#ffffff' }, 
                          startAdornment: (
                        <InputAdornment position="start">
                          <Calendar size={20} color="#9ca3af" />
                        </InputAdornment>
                          ) 
                        }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&.Mui-focused': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#ffffff',
                          },
                          '& input[type="date"]::-webkit-calendar-picker-indicator': {
                            filter: 'invert(1)',
                        },
                      }}
                    />
                  </Grid>
                    
                  <Grid item xs={12} md={4}>
                    <TextField
                        label="Completed At"
                      name="completed_at"
                        type="date"
                      value={createForm.completed_at}
                      onChange={handleCreateChange}
                      fullWidth
                        InputLabelProps={{ 
                          style: { color: '#9ca3af' },
                          shrink: true
                        }}
                        InputProps={{ 
                          style: { color: '#ffffff' }, 
                          startAdornment: (
                        <InputAdornment position="start">
                          <Calendar size={20} color="#9ca3af" />
                        </InputAdornment>
                          ) 
                        }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            '&.Mui-focused': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#ffffff',
                          },
                          '& input[type="date"]::-webkit-calendar-picker-indicator': {
                            filter: 'invert(1)',
                        },
                      }}
                    />
                  </Grid>
                </Grid>
                </Box>
                
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  startIcon={<Plus size={20} />}
                  sx={{
                    background: 'linear-gradient(90deg, #667eea, #764ba2)',
                    borderRadius: '12px',
                    fontWeight: 600,
                    textTransform: 'none',
                    padding: '16px 32px',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    color: '#fff',
                    mt: 4,
                    fontSize: 18,
                    '&:hover': {
                      background: 'linear-gradient(90deg, #764ba2, #667eea)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                    },
                    '&:disabled': {
                      background: 'rgba(102, 126, 234, 0.3)',
                      transform: 'none',
                    }
                  }}
                  disabled={createLoading}
                >
                  {createLoading ? 'Creating Project...' : 'Create Project'}
                </Button>
                
                {createError && (
                  <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                    {createError}
                  </Typography>
                )}
                {createSuccess && (
                  <Typography color="success" variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                    {createSuccess}
                  </Typography>
                )}
              </Box>
            </DialogContent>
          </Dialog>
                

          {/* Project Applications Modal */}
          <ProjectApplicationsModal
            open={applicationsModalOpen}
            onClose={handleCloseApplicationsModal}
            projectId={currentProjectId}
            projectTitle={currentProjectTitle}
          />

          {/* No Community Dialog */}
          <NoCommunityDialog
            open={noCommunityDialogOpen}
            onClose={handleCloseNoCommunityDialog}
            projectTitle={noCommunityProjectTitle}
          />

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