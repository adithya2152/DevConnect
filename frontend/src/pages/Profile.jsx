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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const marshGreen = "#0e6672ff";

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
        const res = await fetch(`http://localhost:8000/api/profile/${user.id}`);
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
      const res = await fetch("http://localhost:8000/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, id: user.id, email: user.email }),
      });

      if (res.ok) {
        toast.success("Profile updated!");
        setEditing(false);
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (err) {
      console.error("Error saving:", err);
      toast.error("Error saving profile.");
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
  };

  const handleProjectDelete = (project) => {
    setProfile({ ...profile, projects: profile.projects.filter((p) => p !== project) });
  };

  if (loading) {
    return (
      <Box
        sx={{
          mt: 4,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "50vh",
          color: "#ccc",
          bgcolor: "#121212",
        }}
      >
        <CircularProgress size={60} sx={{ mb: 2, color: marshGreen }} />
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ mt: 4, textAlign: "center", color: "#ccc" }}>
        <Typography>No profile found.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: "auto",
        mt: 5,
        px: 2,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <Box
        sx={{
          backgroundColor: "#1b1b1b",
          border: `2px solid ${marshGreen}`,
          borderRadius: 3,
          p: 4,
          boxShadow: `0 0 10px ${marshGreen}33`,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
            <Avatar
              sx={{
                width: 88,
                height: 88,
                bgcolor: marshGreen,
                color: "#000",
                fontSize: 36,
                fontWeight: "bold",
                userSelect: "none",
                boxShadow: `0 0 8px ${marshGreen}`,
              }}
            >
              {profile.full_name?.[0]?.toUpperCase() || "U"}
            </Avatar>
            <Box>
              {editing ? (
                <>
                  <TextField
                    label="Full Name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    size="medium"
                    fullWidth
                    sx={{
                      mb: 1,
                      input: { color: "white", fontWeight: 600 },
                      label: { color: marshGreen },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: marshGreen },
                        "&:hover fieldset": { borderColor: "#33a69f" },
                        "&.Mui-focused fieldset": { borderColor: marshGreen },
                      },
                    }}
                  />
                  <TextField
                    label="Username"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    size="medium"
                    fullWidth
                    sx={{
                      input: { color: "white" },
                      label: { color: marshGreen },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: marshGreen },
                        "&:hover fieldset": { borderColor: "#33a69f" },
                        "&.Mui-focused fieldset": { borderColor: marshGreen },
                      },
                    }}
                  />
                </>
              ) : (
                <>
                  <Typography
                    variant="h4"
                    sx={{ color: "white", fontWeight: "bold", letterSpacing: 0.7 }}
                  >
                    {profile.full_name}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: "#8ec5c3" }}>
                    @{profile.username}
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          <IconButton
            onClick={() => (editing ? handleSave() : setEditing(true))}
            sx={{
              color: marshGreen,
              border: `1.5px solid ${marshGreen}`,
              "&:hover": { bgcolor: marshGreen, color: "#fff" },
              transition: "all 0.3s ease",
              p: 1.5,
              fontSize: 22,
            }}
            aria-label={editing ? "Save Profile" : "Edit Profile"}
          >
            {editing ? <SaveIcon fontSize="large" /> : <EditIcon fontSize="large" />}
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: marshGreen, mb: 3 }} />

        {/* Bio & Location */}
        {editing ? (
          <>
            <TextField
              label="Bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              fullWidth
              multiline
              rows={4}
              sx={{
                mb: 3,
                input: { color: "white" },
                label: { color: marshGreen },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: marshGreen },
                  "&:hover fieldset": { borderColor: "#33a69f" },
                  "&.Mui-focused fieldset": { borderColor: marshGreen },
                },
              }}
            />
            <TextField
              label="Location"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              fullWidth
              sx={{
                mb: 3,
                input: { color: "white" },
                label: { color: marshGreen },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: marshGreen },
                  "&:hover fieldset": { borderColor: "#33a69f" },
                  "&.Mui-focused fieldset": { borderColor: marshGreen },
                },
              }}
            />
          </>
        ) : (
          <>
            {profile.bio && (
              <Typography
                sx={{
                  color: "#ccc",
                  fontStyle: "italic",
                  fontSize: "1.05rem",
                  mb: 1,
                  userSelect: "text",
                }}
              >
                {profile.bio}
              </Typography>
            )}
            {profile.location && (
              <Typography
                sx={{
                  color: marshGreen,
                  fontWeight: "600",
                  fontSize: "1rem",
                  userSelect: "text",
                }}
              >
                📍 {profile.location}
              </Typography>
            )}
          </>
        )}

        {/* Skills */}
        <Box sx={{ my: 4 }}>
          <Typography
            variant="h6"
            sx={{
              color: marshGreen,
              mb: 1,
              fontWeight: "bold",
              letterSpacing: 0.8,
            }}
          >
            Skills
          </Typography>

          {editing && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mb: 2,
                alignItems: "center",
              }}
            >
              <TextField
                size="small"
                label="Add Skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSkillAdd()}
                sx={{
                  input: { color: "white" },
                  label: { color: marshGreen },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: marshGreen },
                    "&:hover fieldset": { borderColor: "#33a69f" },
                    "&.Mui-focused fieldset": { borderColor: marshGreen },
                  },
                }}
              />
              <IconButton
                onClick={handleSkillAdd}
                sx={{
                  color: marshGreen,
                  border: `1.5px solid ${marshGreen}`,
                  "&:hover": { bgcolor: marshGreen, color: "#fff" },
                  transition: "all 0.3s ease",
                }}
                aria-label="Add Skill"
              >
                <AddIcon />
              </IconButton>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              gap: 1.2,
              flexWrap: "wrap",
            }}
          >
            {profile.skills.map((skill, i) => (
              <Chip
                key={i}
                label={skill}
                onDelete={editing ? () => handleSkillDelete(skill) : undefined}
                sx={{
                  bgcolor: editing ? "#2b2b2b" : marshGreen,
                  color: editing ? "#fff" : "#000",
                  border: editing ? `1px solid ${marshGreen}` : "none",
                  fontWeight: "600",
                  userSelect: "none",
                  cursor: editing ? "pointer" : "default",
                  transition: "background-color 0.3s ease",
                  "&:hover": editing
                    ? {
                        bgcolor: "#444",
                        borderColor: "#55b4a0",
                      }
                    : {},
                }}
                deleteIcon={editing ? <DeleteIcon /> : undefined}
                variant="filled"
              />
            ))}
          </Box>
        </Box>

        {/* Projects */}
        <Box sx={{ my: 4 }}>
          <Typography
            variant="h6"
            sx={{
              color: marshGreen,
              mb: 1,
              fontWeight: "bold",
              letterSpacing: 0.8,
            }}
          >
            Projects
          </Typography>

          {editing && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mb: 2,
                alignItems: "center",
              }}
            >
              <TextField
                size="small"
                label="Add Project"
                value={projectInput}
                onChange={(e) => setProjectInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleProjectAdd()}
                sx={{
                  input: { color: "white" },
                  label: { color: marshGreen },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: marshGreen },
                    "&:hover fieldset": { borderColor: "#33a69f" },
                    "&.Mui-focused fieldset": { borderColor: marshGreen },
                  },
                }}
              />
              <IconButton
                onClick={handleProjectAdd}
                sx={{
                  color: marshGreen,
                  border: `1.5px solid ${marshGreen}`,
                  "&:hover": { bgcolor: marshGreen, color: "#fff" },
                  transition: "all 0.3s ease",
                }}
                aria-label="Add Project"
              >
                <AddIcon />
              </IconButton>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              gap: 1.2,
              flexWrap: "wrap",
            }}
          >
            {profile.projects.map((project, i) => (
              <Chip
                key={i}
                label={project}
                onDelete={editing ? () => handleProjectDelete(project) : undefined}
                sx={{
                  bgcolor: editing ? "#2b2b2b" : "#333",
                  color: "#fff",
                  border: `1px solid ${marshGreen}`,
                  fontWeight: "600",
                  userSelect: "none",
                  cursor: editing ? "pointer" : "default",
                  transition: "background-color 0.3s ease",
                  "&:hover": editing
                    ? {
                        bgcolor: "#444",
                        borderColor: "#55b4a0",
                      }
                    : {},
                }}
                deleteIcon={editing ? <DeleteIcon /> : undefined}
                variant="filled"
              />
            ))}
          </Box>
        </Box>

        {/* Social Links */}
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h6"
            sx={{
              color: marshGreen,
              mb: 2,
              fontWeight: "bold",
              letterSpacing: 0.8,
            }}
          >
            Links
          </Typography>
          {["github", "linkedin", "stackoverflow", "website"].map((key) => {
            const url = profile[`${key}_url`];
            return (
              url && (
                <Typography
                  key={key}
                  sx={{
                    color: "#eee",
                    mb: 1,
                    fontSize: "1rem",
                    userSelect: "text",
                  }}
                >
                  🔗{" "}
                  <strong
                    style={{
                      color: marshGreen,
                      textTransform: "capitalize",
                      userSelect: "text",
                    }}
                  >
                    {key}
                  </strong>
                  :{" "}
                  <Link href={url} target="_blank" rel="noopener" sx={{ color: marshGreen }}>
                    {url}
                  </Link>
                </Typography>
              )
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
