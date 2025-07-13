import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Badge,
  Divider,
} from "@mui/material";
import {
  Share as ShareIcon,
  Add as AddIcon,
  Chat as ChatIcon,
  Groups as GroupsIcon,
  Explore as ExploreIcon,
  Create as CreateIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/nav";
import useAuthGuard from "../hooks/useAuthGuarf";

export default function Communities() {
  useAuthGuard();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [explore, setExplore] = useState([]);
  const [joined, setJoined] = useState([]);
  const [hosted, setHosted] = useState([]);
  const [dialog, setDialog] = useState({ open: false, community: null });
  const [create, setCreate] = useState({ name: "", description: "" });
  const userID = JSON.parse(localStorage.getItem("user")).id;
  const BASE = "http://localhost:8000";

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const [exploreRes, joinedRes, hostedRes] = await Promise.all([
        axios.get(`${BASE}/communities/explore`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        }),
        axios.get(`${BASE}/communities/joined`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        }),
        axios.get(`${BASE}/communities/hosted`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        }),
      ]);

      const transformCommunity = (community) => ({
        id: community.id,
        name: community.name,
        description: community.description,
        is_private: community.is_private,
        member_count: community.member_count,
        room_admin_id: community.room_admin_id,
        created_at: community.created_at,
        username: community.username || "Community",
      });

      setExplore(exploreRes.data.map(transformCommunity));
      setJoined(joinedRes.data.map(transformCommunity));
      setHosted(hostedRes.data.map(transformCommunity));
    } catch (err) {
      toast.error("Failed to load communities");
      console.error("Community fetch error:", err);
    }
  };

  const handleJoin = async (id) => {
    try {
      const response = await axios.post(
        `${BASE}/communities/join`,
        { community_id: id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(response.data.message || "Joined successfully!");
      setDialog({ open: false, community: null });
      fetchCommunities();
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || err.response?.data?.error || "Failed to join community";
      toast.error(errorMsg);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await axios.post(
        `${BASE}/communities/add`,
        create,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 201) {
        throw new Error(response.data.detail);
      }
      toast.success("Community created!");
      setCreate({ name: "", description: "" });
      fetchCommunities();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create community");
    }
  };

  const copyJoinLink = (id, isPrivate = false) => {
    const link = `${window.location.origin}/communities/join/${id}`;
    navigator.clipboard.writeText(link);
    toast.success(isPrivate ? "Private invite link copied!" : "Community link copied!");
  };

  const CommunityCard = ({ comm, isJoined }) => {
    const isHost = comm.room_admin_id === userID;
    const isMember = isJoined || isHost;

    return (
      <Card
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.08)",
          color: "#ffffff",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
          },
          border: isHost
            ? "1px solid #4e46e5"
            : isMember
            ? "1px solid #3b82f6"
            : "1px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#ffffff" }}>
                {comm.name}
              </Typography>
              <Box display="flex" alignItems="center" mt={0.5} mb={1.5}>
                {isHost ? (
                  <Chip
                    label="Owner"
                    size="small"
                    sx={{
                      mr: 1,
                      fontWeight: 600,
                      backgroundColor: "#4e46e5",
                      color: "#ffffff",
                    }}
                  />
                ) : isMember ? (
                  <Chip
                    label="Member"
                    size="small"
                    sx={{ 
                      mr: 1,
                      fontWeight: 600,
                      backgroundColor: "#5fb7f9",
                      color: "#ffffff",
                    }}
                  />
                ) : null}

                {comm.is_private && (
                  <Chip
                    label="Private"
                    size="small"
                    sx={{
                      backgroundColor: "#ef4444",
                      color: "#ffffff",
                    }}
                  />
                )}
              </Box>
            </Box>

            <Avatar
              sx={{
                bgcolor: isHost ? "#4e46e5" : isMember ? "#3b82f6" : "#6b7280",
                width: 40,
                height: 40,
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              {comm.username?.charAt(0).toUpperCase() || "C"}
            </Avatar>
          </Box>

          <Typography variant="body2" sx={{ mt: 1, mb: 2, color: "rgba(255, 255, 255, 0.7)" }}>
            {comm.description || "No description provided"}
          </Typography>

          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <GroupsIcon fontSize="small" sx={{ mr: 0.5, color: "rgba(255, 255, 255, 0.7)" }} />
              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                {comm.member_count || 0} members • Admin: {comm.username}
              </Typography>
            </Box>
          </Box>
        </CardContent>

        <CardActions
          sx={{
            justifyContent: "space-between",
            borderTop: "1px solid",
            borderColor: "rgba(255, 255, 255, 0.12)",
            pt: 1,
            pb: 1.5,
            px: 2,
          }}
        >
          <Box>
            {isHost ? (
              <Button
                size="small"
                variant="contained"
                sx={{
                  fontWeight: 600,
                  px: 2,
                  py: 0.5,
                  fontSize: "0.75rem",
                  backgroundColor: "#4e46e5",
                  "&:hover": {
                    backgroundColor: "#4338ca",
                  },
                }}
                onClick={() => navigate(`/communities/manage/${comm.id}`)}
              >
                Manage
              </Button>
            ) : isMember ? (
              <Button
                size="small"
                variant="contained"
                sx={{
                  fontWeight: 600,
                  px: 2,
                  py: 0.5,
                  fontSize: "0.75rem",
                  backgroundColor: "#3b82f6",
                  "&:hover": {
                    backgroundColor: "#2563eb",
                  },
                }}
                onClick={() => navigate(`/communities/chat/${comm.id}`)}
                startIcon={<ChatIcon fontSize="small" />}
              >
                Enter Chat
              </Button>
            ) : (
              <Button
                size="small"
                variant="contained"
                sx={{
                  fontWeight: 600,
                  px: 2,
                  py: 0.5,
                  fontSize: "0.75rem",
                  backgroundColor: "#10b981",
                  "&:hover": {
                    backgroundColor: "#059669",
                  },
                }}
                onClick={() => setDialog({ open: true, community: comm })}
              >
                Join Now
              </Button>
            )}
          </Box>

          <Tooltip title={isHost ? "Copy invite link" : "Copy community link"}>
            <IconButton
              onClick={() => copyJoinLink(comm.id, comm.is_private)}
              size="small"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  color: "#ffffff",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <ShareIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    );
  };

  const renderTabContent = () => {
    switch (tab) {
      case 0: // Explore
        return (
          <>
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search communities..."
              variant="outlined"
              fullWidth
              sx={{
                mb: 3,
                maxWidth: 500,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.23)",
                  },
                  "&:hover fieldset": {
                    borderColor: "#3b82f6",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3b82f6",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#ffffff",
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
              }}
              InputProps={{
                startAdornment: <ExploreIcon sx={{ color: "rgba(255, 255, 255, 0.7)", mr: 1 }} />,
              }}
            />

            {explore.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  border: "1px dashed rgba(255, 255, 255, 0.3)",
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                }}
              >
                <ExploreIcon
                  sx={{ fontSize: 48, color: "rgba(255, 255, 255, 0.5)", mb: 2 }}
                />
                <Typography variant="h6" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                  No communities to explore yet
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: "rgba(255, 255, 255, 0.5)" }}>
                  Be the first to create one!
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {explore
                  .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
                  .map((c) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={c.id}>
                      <CommunityCard comm={c} isJoined={joined.some((j) => j.id === c.id)} />
                    </Grid>
                  ))}
              </Grid>
            )}
          </>
        );

      case 1: // My Communities
        return (
          <>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 3,
                display: "flex",
                alignItems: "center",
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              <GroupsIcon sx={{ mr: 1, color: "#3b82f6" }} />
              {joined.length} communities you are part of
            </Typography>

            {joined.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  border: "1px dashed rgba(59, 130, 246, 0.5)",
                  borderRadius: 2,
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                }}
              >
                <GroupsIcon
                  sx={{ fontSize: 48, color: "rgba(59, 130, 246, 0.5)", mb: 2 }}
                />
                <Typography variant="h6" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                  You haven't joined any communities yet
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: "rgba(255, 255, 255, 0.5)" }}>
                  Explore communities below and join the conversation!
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    mt: 3,
                    color: "#3b82f6",
                    borderColor: "#3b82f6",
                    "&:hover": {
                      borderColor: "#3b82f6",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                    },
                  }}
                  onClick={() => setTab(0)}
                >
                  Explore Communities
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {joined.map((c) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={c.id}>
                    <CommunityCard comm={c} isJoined />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        );

      case 2: // Hosted by Me
        return (
          <>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 3,
                display: "flex",
                alignItems: "center",
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              <Badge badgeContent={hosted.length} color="primary" sx={{ mr: 1 }}>
                <GroupsIcon sx={{ color: "#4e46e5" }} />
              </Badge>
              Communities you host
            </Typography>

            {hosted.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  border: "1px dashed rgba(78, 70, 229, 0.5)",
                  borderRadius: 2,
                  backgroundColor: "rgba(78, 70, 229, 0.1)",
                }}
              >
                <CreateIcon
                  sx={{ fontSize: 48, color: "rgba(78, 70, 229, 0.5)", mb: 2 }}
                />
                <Typography variant="h6" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                  You're not hosting any communities yet
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: "rgba(255, 255, 255, 0.5)" }}>
                  Create your own community and start the conversation!
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    mt: 3,
                    color: "#4e46e5",
                    borderColor: "#4e46e5",
                    "&:hover": {
                      borderColor: "#4e46e5",
                      backgroundColor: "rgba(78, 70, 229, 0.1)",
                    },
                  }}
                  onClick={() => setTab(3)}
                >
                  Create Community
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {hosted.map((c) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={c.id}>
                    <CommunityCard comm={c} isJoined={joined.some((j) => j.id === c.id)} />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        );

      case 3: // Create New
        return (
          <Box
            sx={{
              maxWidth: 600,
              mx: "auto",
              mt: 2,
              p: 4,
              bgcolor: "rgba(255, 255, 255, 0.08)",
              borderRadius: 2,
              boxShadow: 3,
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Avatar
                sx={{
                  bgcolor: "#10b981",
                  width: 60,
                  height: 60,
                  mx: "auto",
                  mb: 2,
                }}
              >
                <AddIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: "#ffffff" }}>
                Create New Community
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Bring people together around shared interests
              </Typography>
            </Box>

            <Divider sx={{ my: 3, borderColor: "rgba(255, 255, 255, 0.12)" }} />

            <TextField
              fullWidth
              label="Community Name"
              value={create.name}
              onChange={(e) => setCreate({ ...create, name: e.target.value })}
              sx={{
                mb: 3,
                "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.23)" },
                  "&:hover fieldset": { borderColor: "#3b82f6" },
                  "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
                },
                input: { color: "#ffffff" },
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              fullWidth
              label="Description"
              placeholder="What's this community about?"
              value={create.description}
              multiline
              rows={4}
              onChange={(e) => setCreate({ ...create, description: e.target.value })}
              sx={{
                mb: 4,
                "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.23)" },
                  "&:hover fieldset": { borderColor: "#3b82f6" },
                  "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
                },
                textarea: { color: "#ffffff" },
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              disabled={!create.name.trim()}
              sx={{
                height: 48,
                fontSize: "1rem",
                fontWeight: 600,
                width: "100%",
                backgroundColor: "#10b981",
                "&:hover": {
                  backgroundColor: "#059669",
                },
              }}
            >
              Create Community
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <NavBar />
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          background: "linear-gradient(to bottom right, #0f2027, #203a43, #2c5364)",
          minHeight: "100vh",
          color: "#ffffff",
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: "#ffffff" }}>
              Communities
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Connect with like-minded people and share your interests
            </Typography>
          </Box>

          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            textColor="inherit"
            indicatorColor="primary"
            sx={{
              mb: 4,
              "& .MuiTabs-indicator": {
                height: 4,
                borderRadius: 2,
                backgroundColor: "#3b82f6",
              },
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="Explore"
              icon={<ExploreIcon />}
              iconPosition="start"
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            />
            <Tab
              label="My Communities"
              icon={<GroupsIcon />}
              iconPosition="start"
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            />
            <Tab
              label="Hosted by Me"
              icon={<Badge badgeContent={hosted.length} color="primary" />}
              iconPosition="start"
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            />
            <Tab
              label="Create New"
              icon={<CreateIcon />}
              iconPosition="start"
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            />
          </Tabs>

          {renderTabContent()}
        </Box>
      </Box>

      <Dialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, community: null })}
        PaperProps={{
          sx: {
            bgcolor: "#1e293b",
            borderRadius: 3,
            boxShadow: 24,
            minWidth: 400,
            border: "1px solid rgba(255, 255, 255, 0.12)",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: dialog.community?.is_private ? "#ef4444" : "#3b82f6",
            color: "white",
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
            py: 2,
            px: 3,
          }}
        >
          <Box display="flex" alignItems="center">
            <Avatar
              sx={{
                bgcolor: "white",
                width: 40,
                height: 40,
                mr: 2,
                color: dialog.community?.is_private ? "#ef4444" : "#3b82f6",
                fontWeight: 600,
              }}
            >
              {dialog.community?.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6">{dialog.community?.name}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {dialog.community?.is_private ? "Private Community" : "Public Community"}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ py: 3, px: 3 }}>
          <Typography variant="body1" paragraph sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
            {dialog.community?.description}
          </Typography>

          <Box display="flex" alignItems="center" mt={2}>
            <GroupsIcon fontSize="small" sx={{ mr: 1, color: "rgba(255, 255, 255, 0.7)" }} />
            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
              {dialog.community?.member_count || 0} members
            </Typography>
          </Box>

          {dialog.community?.is_private && (
            <Box mt={2} p={2} bgcolor="rgba(239, 68, 68, 0.1)" borderRadius={2}>
              <Typography variant="caption" sx={{ color: "#ef4444" }}>
                This is a private community - you'll need an invite to join
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: "rgba(255, 255, 255, 0.12)",
          }}
        >
          <Button
            onClick={() => setDialog({ open: false, community: null })}
            sx={{
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.7)",
              "&:hover": {
                color: "#ffffff",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => alert("REQ BASED JOIN COMMING SOON)")}
            autoFocus
            variant="contained"
            sx={{
              fontWeight: 600,
              backgroundColor: dialog.community?.is_private ? "#ef4444" : "#3b82f6",
              "&:hover": {
                backgroundColor: dialog.community?.is_private ? "#dc2626" : "#2563eb",
              },
            }}
          >
            Join Community
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}