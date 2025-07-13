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
        const res = await fetch(${import.meta.env.VITE_API_KEY}/api/profile/${user.id});
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
      const res = await fetch(${import.meta.env.VITE_API_KEY}/api/profile/update, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, id: user.id, email: user.email }),
      });

      if (res.ok) {
        alert("Profile updated!");
        setEditing(false);
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillAdd = () => {
    if (skillInput && !profile.skills.includes(skillInput.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, skillInput.trim()] });
      setSkillInput("");
      toast.success("Skill added!");
    } else if (profile.skills.includes(trimmedSkill)) {
      toast.error("Skill already exists!");
    }
  };

  const handleProjectAdd = () => {
    if (projectInput && !profile.projects.includes(projectInput.trim())) {
      setProfile({ ...profile, projects: [...profile.projects, projectInput.trim()] });
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
      <Box sx={{ 
        mt: 4, 
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "50vh"
      }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography sx={{ color: "white" }}>Loading profile...</Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography sx={{ color: "white" }}>No profile found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 5 }}>
      <Box
        sx={{
          backgroundColor: "#111",
          border: 2px solid ${marshGreen},
          borderRadius: 4,
          p: 3,
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: marshGreen, color: "#000", fontSize: 32 }}>
              {profile.full_name?.[0] || "U"}
            </Avatar>
            <Box>
              {editing ? (
                <>
                  <TextField
                    label="Full Name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    size="small"
                    fullWidth
                    sx={{ mb: 1, input: { color: "white" }, label: { color: marshGreen } }}
                  />
                  <TextField
                    label="Username"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    size="small"
                    fullWidth
                    sx={{ input: { color: "white" }, label: { color: marshGreen } }}
                  />
                </>
              ) : (
                <>
                  <Typography variant="h5" color="white">{profile.full_name}</Typography>
                  <Typography variant="subtitle1" color="gray">@{profile.username}</Typography>
                </>
              )}
            </Box>
          </Box>

          <IconButton onClick={() => (editing ? handleSave() : setEditing(true))} sx={{ color: marshGreen }}>
            {editing ? <SaveIcon /> : <EditIcon />}
          </IconButton>
        </Box>

        <Divider sx={{ my: 2, borderColor: marshGreen }} />

        {/* Bio & Location */}
        {editing ? (
          <>
            <TextField
              label="Bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              fullWidth multiline rows={3}
              sx={{ mb: 2, input: { color: "white" }, label: { color: marshGreen } }}
            />
            <TextField
              label="Location"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              fullWidth
              sx={{ input: { color: "white" }, label: { color: marshGreen } }}
            />
          </>
        ) : (
          <>
            {profile.bio && <Typography sx={{ color: "#ccc", mb: 1 }}>{profile.bio}</Typography>}
            {profile.location && <Typography sx={{ color: "white" }}>📍 {profile.location}</Typography>}
          </>
        )}

        {/* Skills */}
        <Box sx={{ my: 3 }}>
          <Typography variant="subtitle1" sx={{ color: marshGreen, mb: 1 }}>Skills</Typography>
          {editing && (
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <TextField
                size="small"
                label="Add Skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSkillAdd()}
                sx={{ input: { color: "white" }, label: { color: marshGreen } }}
              />
              <IconButton onClick={handleSkillAdd} sx={{ color: marshGreen }}>
                <AddIcon />
              </IconButton>
            </Box>
          )}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {profile.skills.map((skill, i) => (
              <Chip
                key={i}
                label={skill}
                onDelete={editing ? () => handleSkillDelete(skill) : undefined}
                sx={{
                  bgcolor: editing ? "#222" : marshGreen,
                  color: editing ? "white" : "#000",
                  border: editing ? 1px solid ${marshGreen} : "none",
                }}
                deleteIcon={editing ? <DeleteIcon /> : undefined}
              />
            ))}
          </Box>
        </Box>

        {/* Projects */}
        <Box sx={{ my: 3 }}>
          <Typography variant="subtitle1" sx={{ color: marshGreen, mb: 1 }}>Projects</Typography>
          {editing && (
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <TextField
                size="small"
                label="Add Project"
                value={projectInput}
                onChange={(e) => setProjectInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleProjectAdd()}
                sx={{ input: { color: "white" }, label: { color: marshGreen } }}
              />
              <IconButton onClick={handleProjectAdd} sx={{ color: marshGreen }}>
                <AddIcon />
              </IconButton>
            </Box>
          )}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {profile.projects.map((project, i) => (
              <Chip
                key={i}
                label={project}
                onDelete={editing ? () => handleProjectDelete(project) : undefined}
                sx={{
                  bgcolor: editing ? "#222" : "#333",
                  color: "white",
                  border: 1px solid ${marshGreen},
                }}
                deleteIcon={editing ? <DeleteIcon /> : undefined}
              />
            ))}
          </Box>
        </Box>

        {/* Social Links */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ color: marshGreen }}>Links</Typography>
          {["github", "linkedin", "stackoverflow", "website"].map((key) => {
            const url = profile[${key}_url];
            return (
              url && (
                <Typography key={key} sx={{ color: "white", mt: 1 }}>
                  🔗 {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
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