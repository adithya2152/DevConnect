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

// Mock data (same as before)
const mockProjects = [
  {
    id: 1,
    title: "E-commerce Platform with AI Recommendations",
    description: "Building a modern e-commerce platform with AI-powered product recommendations and real-time analytics dashboard.",
    detailed_description: "A comprehensive e-commerce solution featuring machine learning algorithms for personalized recommendations, real-time inventory management, and advanced analytics. Looking for passionate developers to join our team.",
    status: "active",
    project_type: "web",
    domain: "fullstack",
    difficulty_level: "intermediate",
    required_skills: ["React", "Node.js", "Python", "PostgreSQL", "Machine Learning"],
    tech_stack: ["React", "Node.js", "Express", "PostgreSQL", "TensorFlow", "AWS"],
    programming_languages: ["JavaScript", "Python", "SQL"],
    estimated_duration: "4 months",
    team_size_min: 3,
    team_size_max: 6,
    is_remote: true,
    timezone_preference: "UTC-5 to UTC+3",
    github_url: "https://github.com/example/ecommerce-ai",
    demo_url: "https://demo.ecommerce-ai.com",
    image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop",
    is_recruiting: true,
    tags: ["E-commerce", "AI", "Full Stack", "Startup"],
    view_count: 247,
    like_count: 23,
    application_count: 8,
    created_at: "2024-12-15",
    deadline: "2025-02-28",
    members: [
      { id: 1, name: "Alex Chen", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face", role: "owner" },
      { id: 2, name: "Maria Rodriguez", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face", role: "member" },
      { id: 3, name: "David Kim", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face", role: "member" }
    ]
  },
  {
    id: 2,
    title: "Mobile Fitness Tracker with Social Features",
    description: "React Native app for fitness tracking with social challenges and community features.",
    detailed_description: "A comprehensive fitness tracking application with social networking capabilities, workout challenges, and progress sharing features.",
    status: "active",
    project_type: "mobile",
    domain: "mobile",
    difficulty_level: "intermediate",
    required_skills: ["React Native", "Firebase", "UI/UX Design", "REST APIs"],
    tech_stack: ["React Native", "Firebase", "Redux", "Expo"],
    programming_languages: ["JavaScript", "TypeScript"],
    estimated_duration: "3 months",
    team_size_min: 2,
    team_size_max: 4,
    is_remote: true,
    timezone_preference: "UTC-8 to UTC+2",
    github_url: "https://github.com/example/fitness-tracker",
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
    is_recruiting: true,
    tags: ["Mobile", "Fitness", "Social", "React Native"],
    view_count: 189,
    like_count: 34,
    application_count: 12,
    created_at: "2024-12-10",
    deadline: "2025-03-15",
    members: [
      { id: 4, name: "Sarah Johnson", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face", role: "owner" },
      { id: 5, name: "Mike Wilson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face", role: "member" }
    ]
  },
  {
    id: 3,
    title: "Blockchain Voting System",
    description: "Secure and transparent voting system using blockchain technology for democratic processes.",
    detailed_description: "A decentralized voting platform ensuring transparency, security, and immutability of votes using blockchain technology.",
    status: "active",
    project_type: "web",
    domain: "blockchain",
    difficulty_level: "advanced",
    required_skills: ["Solidity", "Web3.js", "React", "Smart Contracts", "Cryptography"],
    tech_stack: ["Ethereum", "Solidity", "React", "Web3.js", "IPFS"],
    programming_languages: ["Solidity", "JavaScript"],
    estimated_duration: "6 months",
    team_size_min: 4,
    team_size_max: 8,
    is_remote: true,
    timezone_preference: "UTC-12 to UTC+12",
    github_url: "https://github.com/example/blockchain-voting",
    image_url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=250&fit=crop",
    is_recruiting: true,
    tags: ["Blockchain", "Smart Contracts", "Democracy", "Security"],
    view_count: 312,
    like_count: 45,
    application_count: 15,
    created_at: "2024-12-05",
    deadline: "2025-06-01",
    members: [
      { id: 6, name: "Emily Davis", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face", role: "owner" },
      { id: 7, name: "James Brown", avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=40&h=40&fit=crop&crop=face", role: "member" },
      { id: 8, name: "Lisa Wang", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face", role: "member" }
    ]
  },
  {
    id: 4,
    title: "AI-Powered Code Review Tool",
    description: "Machine learning tool that provides intelligent code review suggestions and detects potential bugs.",
    detailed_description: "An AI-powered tool that analyzes code quality, suggests improvements, and detects potential security vulnerabilities and bugs.",
    status: "completed",
    project_type: "api",
    domain: "ai_ml",
    difficulty_level: "advanced",
    required_skills: ["Python", "Machine Learning", "NLP", "Docker", "FastAPI"],
    tech_stack: ["Python", "TensorFlow", "FastAPI", "Docker", "PostgreSQL"],
    programming_languages: ["Python"],
    estimated_duration: "5 months",
    team_size_min: 3,
    team_size_max: 5,
    is_remote: true,
    timezone_preference: "UTC-5 to UTC+5",
    github_url: "https://github.com/example/ai-code-review",
    demo_url: "https://ai-code-review.com",
    image_url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop",
    is_recruiting: false,
    tags: ["AI", "Code Review", "Machine Learning", "Developer Tools"],
    view_count: 428,
    like_count: 67,
    application_count: 22,
    created_at: "2024-08-01",
    deadline: "2024-12-31",
    members: [
      { id: 9, name: "Robert Taylor", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face", role: "owner" },
      { id: 10, name: "Anna Martinez", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face", role: "member" },
      { id: 11, name: "Chris Lee", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face", role: "member" }
    ]
  },
  {
    id: 5,
    title: "Open Source Portfolio Builder",
    description: "A web app for developers to create and showcase their portfolios with GitHub integration.",
    detailed_description: "This project helps developers easily build and customize their own portfolio websites, with live GitHub stats, project showcases, and blogging features. Looking for frontend and backend contributors.",
    status: "active",
    project_type: "web",
    domain: "frontend",
    difficulty_level: "beginner",
    required_skills: ["React", "CSS", "Node.js", "Express"],
    tech_stack: ["React", "Node.js", "Express", "MongoDB"],
    programming_languages: ["JavaScript", "CSS"],
    estimated_duration: "2 months",
    team_size_min: 2,
    team_size_max: 5,
    is_remote: true,
    timezone_preference: "UTC-3 to UTC+5",
    github_url: "https://github.com/example/portfolio-builder",
    demo_url: "https://portfolio-builder-demo.com",
    image_url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop",
    is_recruiting: true,
    tags: ["Portfolio", "Open Source", "Web App", "Developer Tools"],
    view_count: 102,
    like_count: 12,
    application_count: 4,
    created_at: "2024-12-20",
    deadline: "2025-03-01",
    members: [
      { id: 12, name: "Priya Singh", avatar: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=40&h=40&fit=crop&crop=face", role: "owner" },
      { id: 13, name: "John Doe", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=40&h=40&fit=crop&crop=face", role: "member" }
    ]
  },
];

// Add a mock currentUser definition to avoid reference errors
const currentUser = { id: 1, name: "Alex Chen" };

// Extract unique values for filters
const allDomains = [...new Set(mockProjects.map(p => p.domain))];
const allStatuses = [...new Set(mockProjects.map(p => p.status))];
const allTypes = [...new Set(mockProjects.map(p => p.project_type))];
const allSkills = [...new Set(mockProjects.flatMap(p => p.required_skills))];

function ProjectsPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [projects, setProjects] = useState(mockProjects);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Zap size={12} />;
      case 'completed': return <CheckCircle size={12} />;
      case 'on_hold': return <Pause size={12} />;
      case 'cancelled': return <X size={12} />;
      default: return <Clock size={12} />;
    }
  };

  // Filter projects based on current tab and filters
  const filteredProjects = projects.filter(project => {
    // Tab filtering
    if (selectedTab === 1) { // My Projects
      const isOwner = project.members.some(member => member.id === currentUser.id && member.role === 'owner');
      const isMember = project.members.some(member => member.id === currentUser.id);
      if (!isOwner && !isMember) return false;
    } else if (selectedTab === 0) { // Discover
      const isMember = project.members.some(member => member.id === currentUser.id);
      if (isMember || !project.is_recruiting) return false;
    }

    // Search filtering
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.required_skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Filter by domain, status, type, skill
    if (selectedDomain && project.domain !== selectedDomain) return false;
    if (selectedStatus && project.status !== selectedStatus) return false;
    if (selectedType && project.project_type !== selectedType) return false;
    if (selectedSkill && !project.required_skills.includes(selectedSkill)) return false;

    return true;
  });

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
            {filteredProjects.length === 0 ? (
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
                        {project.tags.slice(0, 3).map((tag, index) => (
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
                        {project.tags.length > 3 && (
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
                        {project.required_skills.slice(0, 4).map((skill, index) => (
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
                        {project.required_skills.length > 4 && (
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
                          {project.members.map((member) => (
                            <Avatar
                              key={member.id}
                              alt={member.name}
                              src={member.avatar}
                              sx={{ width: 32, height: 32, border: '2px solid #374151' }}
                            />
                          ))}
                        </AvatarGroup>
                        <Typography variant="caption" color="#9ca3af">
                          {project.members.length} member{project.members.length !== 1 ? 's' : ''}
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