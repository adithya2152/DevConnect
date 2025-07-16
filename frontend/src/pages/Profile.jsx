import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  TextField,
  IconButton,
  Button,
  CircularProgress,
  Divider,
  Link,
  Paper,
  Grid,
  Card,
  CardContent,
  Fade,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LanguageIcon from "@mui/icons-material/Language";
import CodeIcon from "@mui/icons-material/Code";
import CancelIcon from "@mui/icons-material/Cancel";

const neonGreen = "#00ff88";
const darkGreen = "#00cc6a";
const darkBg = "#0a0a0a";
const cardBg = "#1a1a1a";
const textSecondary = "#b0b0b0";

import toast from "react-hot-toast";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [projectInput, setProjectInput] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      try {
        const res = await fetch(`${import.meta.env.VITE_API_KEY}/api/profile/${user.id}`);
        const data = await res.json();
        setProfile({
          ...data,
          skills: data.skills || [],
          projects: data.projects || [],
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

    const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_KEY}/api/profile/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, id: user.id, email: user.email }),
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
        setEditing(false); // ✅ Exit editing mode after save
      } else {
        const errMsg = await res.text();
        toast.error(`Failed to update profile. ${errMsg}`);
      }
    } catch (err) {
      console.error("Error saving:", err);
      toast.error("Error updating profile");
    } finally {
      setLoading(false);
    }
  };


  const handleSkillAdd = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !profile.skills.includes(trimmedSkill)) {
      setProfile({ ...profile, skills: [...profile.skills, trimmedSkill] });
      setSkillInput("");
      toast.success("Skill added!");
    } else if (profile.skills.includes(trimmedSkill)) {
      toast.error("Skill already exists!");
    }
  };

  const handleProjectAdd = () => {
    const trimmedProject = projectInput.trim();
    if (trimmedProject && !profile.projects.includes(trimmedProject)) {
      setProfile({ ...profile, projects: [...profile.projects, trimmedProject] });
      setProjectInput("");
      toast.success("Project added!");
    } else if (profile.projects.includes(trimmedProject)) {
      toast.error("Project already exists!");
    }
  };

  const handleSkillDelete = (skill) => {
    setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });
    toast.success("Skill removed!");
  };

  const handleProjectDelete = (project) => {
    setProfile({ ...profile, projects: profile.projects.filter((p) => p !== project) });
    toast.success("Project removed!");
  };

  const getSocialIcon = (type) => {
    switch (type) {
      case "github":
        return <GitHubIcon />;
      case "linkedin":
        return <LinkedInIcon />;
      case "stackoverflow":
        return <CodeIcon />;
      case "website":
        return <LanguageIcon />;
      default:
        return <LanguageIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        mt: 4, 
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "50vh",
        backgroundColor: darkBg,
        minHeight: "100vh"
      }}>
        <CircularProgress 
          size={60} 
          sx={{ 
            mb: 2, 
            color: neonGreen,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }} 
        />
        <Typography sx={{ color: "white", fontSize: "1.2rem" }}>Loading profile...</Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ 
        mt: 4, 
        textAlign: "center", 
        backgroundColor: darkBg, 
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Typography sx={{ color: "white", fontSize: "1.2rem" }}>No profile found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: darkBg, 
      minHeight: "100vh", 
      py: 4,
      px: 2
    }}>
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Fade in timeout={800}>
          <Paper
            elevation={24}
            sx={{
              backgroundColor: cardBg,
              border: `2px solid ${neonGreen}`,
              borderRadius: 4,
              p: 4,
              boxShadow: `0 0 20px ${neonGreen}30`,
              position: "relative",
              overflow: "hidden",
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${neonGreen}, ${darkGreen}, ${neonGreen})`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite linear',
              },
              '@keyframes shimmer': {
                '0%': { backgroundPosition: '-200% 0' },
                '100%': { backgroundPosition: '200% 0' },
              },
            }}
          >
            {/* Header Section */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
              <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    bgcolor: neonGreen, 
                    color: "#000", 
                    fontSize: 40,
                    fontWeight: "bold",
                    boxShadow: `0 0 15px ${neonGreen}50`
                  }}
                >
                  {profile.full_name?.[0] || "U"}
                </Avatar>
                <Box>
                  {editing ? (
                    <>
                      <TextField
                        label="Full Name"
                        value={profile.full_name || ""}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        size="small"
                        fullWidth
                        sx={{ 
                          mb: 2,
                          '& .MuiInputLabel-root': { color: neonGreen },
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: neonGreen },
                            '&:hover fieldset': { borderColor: darkGreen },
                            '&.Mui-focused fieldset': { borderColor: neonGreen },
                          }
                        }}
                      />
                      <TextField
                        label="Username"
                        value={profile.username || ""}
                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                        size="small"
                        fullWidth
                        sx={{ 
                          '& .MuiInputLabel-root': { color: neonGreen },
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: neonGreen },
                            '&:hover fieldset': { borderColor: darkGreen },
                            '&.Mui-focused fieldset': { borderColor: neonGreen },
                          }
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          color: "white", 
                          fontWeight: "bold",
                          mb: 1,
                          textShadow: `0 0 10px ${neonGreen}30`
                        }}
                      >
                        {profile.full_name || "Unknown User"}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: neonGreen, 
                          fontWeight: "medium",
                          '&::before': { content: '"@"' }
                        }}
                      >
                        {profile.username || "username"}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>

              <Tooltip title={editing ? "Save Changes" : "Edit Profile"}>
                <IconButton 
                  onClick={() => (editing ? handleSave() : setEditing(true))} 
                  sx={{ 
                    color: neonGreen,
                    backgroundColor: `${neonGreen}10`,
                    border: `1px solid ${neonGreen}`,
                    '&:hover': {
                      backgroundColor: `${neonGreen}20`,
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {editing ? <SaveIcon /> : <EditIcon />}
                </IconButton>
              </Tooltip>
            </Box>

            <Divider sx={{ mb: 3, borderColor: `${neonGreen}40` }} />

            {/* Bio & Location Section */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                {editing ? (
                  <TextField
                    label="Bio"
                    value={profile.bio || ""}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    fullWidth 
                    multiline 
                    rows={4}
                    sx={{ 
                      mb: 2,
                      '& .MuiInputLabel-root': { color: neonGreen },
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: neonGreen },
                        '&:hover fieldset': { borderColor: darkGreen },
                        '&.Mui-focused fieldset': { borderColor: neonGreen },
                      }
                    }}
                  />
                ) : (
                  profile.bio && (
                    <Typography 
                      sx={{ 
                        color: textSecondary, 
                        mb: 2, 
                        fontSize: "1.1rem",
                        lineHeight: 1.6,
                        fontStyle: "italic"
                      }}
                    >
                      "{profile.bio}"
                    </Typography>
                  )
                )}
              </Grid>
              
              <Grid item xs={12} md={4}>
                {editing ? (
                  <TextField
                    label="Location"
                    value={profile.location || ""}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    fullWidth
                    sx={{ 
                      '& .MuiInputLabel-root': { color: neonGreen },
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: neonGreen },
                        '&:hover fieldset': { borderColor: darkGreen },
                        '&.Mui-focused fieldset': { borderColor: neonGreen },
                      }
                    }}
                  />
                ) : (
                  profile.location && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationOnIcon sx={{ color: neonGreen }} />
                      <Typography sx={{ color: "white", fontSize: "1.1rem" }}>
                        {profile.location}
                      </Typography>
                    </Box>
                  )
                )}
              </Grid>
            </Grid>

            {/* Skills Section */}
            <Card sx={{ 
              mt: 4, 
              backgroundColor: `${cardBg}80`, 
              border: `1px solid ${neonGreen}30`,
              borderRadius: 3
            }}>
              <CardContent>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: neonGreen, 
                    mb: 2, 
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: 1
                  }}
                >
                  💡 Skills & Expertise
                </Typography>
                
                {editing && (
                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <TextField
                      size="small"
                      label="Add New Skill"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSkillAdd()}
                      sx={{ 
                        flexGrow: 1,
                        '& .MuiInputLabel-root': { color: neonGreen },
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          '& fieldset': { borderColor: neonGreen },
                          '&:hover fieldset': { borderColor: darkGreen },
                          '&.Mui-focused fieldset': { borderColor: neonGreen },
                        }
                      }}
                    />
                    <Tooltip title="Add Skill">
                      <IconButton 
                        onClick={handleSkillAdd} 
                        sx={{ 
                          color: neonGreen,
                          backgroundColor: `${neonGreen}10`,
                          border: `1px solid ${neonGreen}`,
                          '&:hover': { backgroundColor: `${neonGreen}20` }
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
                
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {profile.skills.map((skill, i) => (
                    <Chip
                      key={i}
                      label={skill}
                      onDelete={editing ? () => handleSkillDelete(skill) : undefined}
                      sx={{
                        backgroundColor: editing ? `${cardBg}` : neonGreen,
                        color: editing ? "white" : "#000",
                        border: `1px solid ${neonGreen}`,
                        fontWeight: "bold",
                        '&:hover': {
                          backgroundColor: editing ? `${neonGreen}20` : darkGreen,
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                      deleteIcon={editing ? <DeleteIcon sx={{ color: '#ff4444' }} /> : undefined}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Projects Section */}
            <Card sx={{ 
              mt: 4, 
              backgroundColor: `${cardBg}80`, 
              border: `1px solid ${neonGreen}30`,
              borderRadius: 3
            }}>
              <CardContent>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: neonGreen, 
                    mb: 2, 
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: 1
                  }}
                >
                  🚀 Projects
                </Typography>
                
                {editing && (
                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <TextField
                      size="small"
                      label="Add New Project"
                      value={projectInput}
                      onChange={(e) => setProjectInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleProjectAdd()}
                      sx={{ 
                        flexGrow: 1,
                        '& .MuiInputLabel-root': { color: neonGreen },
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          '& fieldset': { borderColor: neonGreen },
                          '&:hover fieldset': { borderColor: darkGreen },
                          '&.Mui-focused fieldset': { borderColor: neonGreen },
                        }
                      }}
                    />
                    <Tooltip title="Add Project">
                      <IconButton 
                        onClick={handleProjectAdd} 
                        sx={{ 
                          color: neonGreen,
                          backgroundColor: `${neonGreen}10`,
                          border: `1px solid ${neonGreen}`,
                          '&:hover': { backgroundColor: `${neonGreen}20` }
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
                
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {profile.projects.map((project, i) => (
                    <Chip
                      key={i}
                      label={project}
                      onDelete={editing ? () => handleProjectDelete(project) : undefined}
                      sx={{
                        backgroundColor: `${cardBg}`,
                        color: "white",
                        border: `1px solid ${neonGreen}`,
                        fontWeight: "bold",
                        '&:hover': {
                          backgroundColor: `${neonGreen}20`,
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                      deleteIcon={editing ? <DeleteIcon sx={{ color: '#ff4444' }} /> : undefined}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Social Links Section */}
            <Card sx={{ 
              mt: 4, 
              backgroundColor: `${cardBg}80`, 
              border: `1px solid ${neonGreen}30`,
              borderRadius: 3
            }}>
              <CardContent>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: neonGreen, 
                    mb: 2, 
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: 1
                  }}
                >
                  🔗 Connect With Me
                </Typography>
                
                <Grid container spacing={2}>
                  {["github", "linkedin", "stackoverflow", "website"].map((key) => {
                    const url = profile[`${key}_url`];
                    const displayName = key === "stackoverflow" ? "Stack Overflow" : key;
                    
                    return (
                      <Grid item xs={12} sm={6} key={key}>
                        <Box sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 2,
                          p: 2,
                          backgroundColor: editing ? `${cardBg}` : `${neonGreen}10`,
                          borderRadius: 2,
                          border: `1px solid ${neonGreen}30`,
                          '&:hover': {
                            backgroundColor: editing ? `${neonGreen}10` : `${neonGreen}20`,
                            transform: editing ? 'none' : 'translateY(-2px)',
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}>
                          <Box sx={{ color: neonGreen, minWidth: 24 }}>
                            {getSocialIcon(key)}
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography sx={{ 
                              color: neonGreen, 
                              fontWeight: "bold",
                              textTransform: "capitalize",
                              mb: editing ? 1 : 0
                            }}>
                              {displayName}
                            </Typography>
                            
                            {editing ? (
                              <TextField
                                size="small"
                                placeholder={`Enter your ${displayName} URL`}
                                value={url || ""}
                                onChange={(e) => setProfile({ 
                                  ...profile, 
                                  [`${key}_url`]: e.target.value 
                                })}
                                fullWidth
                                sx={{ 
                                  '& .MuiInputLabel-root': { color: neonGreen },
                                  '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    fontSize: '0.875rem',
                                    '& fieldset': { borderColor: `${neonGreen}50` },
                                    '&:hover fieldset': { borderColor: neonGreen },
                                    '&.Mui-focused fieldset': { borderColor: neonGreen },
                                  },
                                  '& .MuiInputBase-input::placeholder': {
                                    color: textSecondary,
                                    opacity: 0.7
                                  }
                                }}
                              />
                            ) : (
                              url ? (
                                <Link 
                                  href={url} 
                                  target="_blank" 
                                  rel="noopener" 
                                  sx={{ 
                                    color: textSecondary,
                                    textDecoration: "none",
                                    '&:hover': { color: neonGreen },
                                    transition: 'color 0.2s ease-in-out',
                                    wordBreak: 'break-all'
                                  }}
                                >
                                  {url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                </Link>
                              ) : (
                                <Typography sx={{ 
                                  color: `${textSecondary}60`,
                                  fontStyle: 'italic',
                                  fontSize: '0.875rem'
                                }}>
                                  No {displayName} link added
                                </Typography>
                              )
                            )}
                          </Box>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Paper>
        </Fade>
      </Box>
    </Box>
  );
}