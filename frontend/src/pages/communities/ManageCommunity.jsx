import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Avatar,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  GroupAdd as GroupAddIcon,
  Settings as SettingsIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  Share as ShareIcon,
  Email as EmailIcon,
  Block as BlockIcon,
  Groups as GroupsIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../../components/nav";
import useAuthGuard from "../../hooks/useAuthGuarf";

export default function ManageCommunity() {
  useAuthGuard();
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [inviteDialog, setInviteDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    name: "",
    description: "",
    is_private: false,
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const userID = JSON.parse(localStorage.getItem("user"))?.id;
  const BASE = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    fetchCommunityData();
  }, [id]);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      const [communityRes, membersRes, requestsRes] = await Promise.all([
        axios.get(`${BASE}/communities/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        }),
        axios.get(`${BASE}/communities/${id}/members`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        }),
        axios.get(`${BASE}/communities/${id}/requests`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        }),
      ]);

      setCommunity(communityRes.data);
      setMembers(membersRes.data || []);
      setPendingRequests(requestsRes.data || []);
      setSettings({
        name: communityRes.data.name,
        description: communityRes.data.description,
        is_private: communityRes.data.is_private,
      });
      setLoading(false);
    } catch (err) {
      setError("Failed to load community data");
      toast.error("Failed to load community data");
      console.error("Community fetch error:", err);
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const promoteToAdmin = async () => {
    try {
      await axios.put(
        `${BASE}/communities/${id}/members/${selectedMember.id}/role`,
        { role: "admin" },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        }
      );
      toast.success(`${selectedMember.username} promoted to admin`);
      fetchCommunityData();
      handleMenuClose();
    } catch (err) {
      toast.error("Failed to promote member");
      toast.error("Failed to promote member");
    }
  };

  const removeMember = async () => {
    try {
      await axios.delete(`${BASE}/communities/${id}/members/${selectedMember.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      toast.success(`${selectedMember.username} removed from community`);
      fetchCommunityData();
      handleMenuClose();
    } catch (err) {
      toast.error("Failed to remove member");
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      await axios.put(
        `${BASE}/communities/${id}/requests/${requestId}`,
        { action },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        }
      );
      toast.success(`Request ${action === "approve" ? "approved" : "rejected"}`);
      fetchCommunityData();
    } catch (err) {
      toast.error(`Failed to ${action} request`);
    }
  };

  const updateCommunitySettings = async () => {
    try {
      await axios.put(
        `${BASE}/communities/${id}`,
        settings,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        }
      );
      toast.success("Community settings updated");
      fetchCommunityData();
    } catch (err) {
      toast.error("Failed to update community");
    }
  };

  const deleteCommunity = async () => {
    try {
      await axios.delete(`${BASE}/communities/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      toast.success("Community deleted");
      navigate("/communities");
    } catch (err) {
      toast.error("Failed to delete community");
    }
  };

  const sendInvite = async () => {
    try {
      await axios.post(
        `${BASE}/communities/${id}/invite`,
        { email: inviteEmail },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        }
      );
      toast.success("Invitation sent");
      setInviteDialog(false);
      setInviteEmail("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to send invitation");
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/communities/join/${id}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard!");
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      );
    }

    if (!community) {
      return (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Community not found
        </Alert>
      );
    }

    switch (tab) {
      case 0: // Members
        return (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                variant="outlined"
                size="small"
                sx={{ width: 300 }}
              />
              <Button
                variant="contained"
                startIcon={<GroupAddIcon />}
                onClick={() => setInviteDialog(true)}
              >
                Invite Members
              </Button>
            </Box>

            <Paper sx={{ p: 2 }}>
              <List>
                {members
                  .filter((m) =>
                    m?.username?.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((member) => (
                    <ListItem key={member.id}>
                      <ListItemAvatar>
                        <Avatar src={member.avatar_url}>
                          {member.username?.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={member.username}
                        secondary={
                          <>
                            {member.role === "admin" && (
                              <Chip
                                label="Admin"
                                size="small"
                                icon={<AdminIcon fontSize="small" />}
                                sx={{ mr: 1 }}
                                color="primary"
                              />
                            )}
                            Joined: {new Date(member.joined_at).toLocaleDateString()}
                          </>
                        }
                      />
                      {community.room_admin_id === userID && member.id !== userID && (
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={(e) => handleMenuOpen(e, member)}
                          >
                            <MoreVertIcon />
                        </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  ))}
              </List>
            </Paper>
          </Box>
        );

      case 1: // Requests
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Pending Join Requests ({pendingRequests.length})
            </Typography>

            {pendingRequests.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography color="textSecondary">
                  No pending join requests
                </Typography>
              </Paper>
            ) : (
              <Paper sx={{ p: 2 }}>
                <List>
                  {pendingRequests.map((request) => (
                    <ListItem key={request.id}>
                      <ListItemAvatar>
                        <Avatar src={request.user?.avatar_url}>
                          {request.user?.username?.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={request.user?.username}
                        secondary={`Requested: ${new Date(request.created_at).toLocaleString()}`}
                      />
                      <ListItemSecondaryAction>
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          sx={{ mr: 1 }}
                          onClick={() => handleRequestAction(request.id, "approve")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<BlockIcon />}
                          onClick={() => handleRequestAction(request.id, "reject")}
                        >
                          Reject
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        );

      case 2: // Settings
        return (
          <Box sx={{ mt: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Community Information
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    Community ID: {community.id}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Created: {new Date(community.created_at).toLocaleDateString()}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Community Settings
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.is_private}
                      onChange={(e) =>
                        setSettings({ ...settings, is_private: e.target.checked })
                      }
                      color="primary"
                    />
                  }
                  label={
                    <>
                      {settings.is_private ? (
                        <>
                          <LockIcon fontSize="small" sx={{ mr: 1 }} />
                          Private Community
                        </>
                      ) : (
                        <>
                          <PublicIcon fontSize="small" sx={{ mr: 1 }} />
                          Public Community
                        </>
                      )}
                    </>
                  }
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Community Name"
                  value={settings.name}
                  onChange={(e) =>
                    setSettings({ ...settings, name: e.target.value })
                  }
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Description"
                  value={settings.description}
                  onChange={(e) =>
                    setSettings({ ...settings, description: e.target.value })
                  }
                  multiline
                  rows={4}
                  fullWidth
                />

                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    onClick={updateCommunitySettings}
                    disabled={
                      settings.name === community.name &&
                      settings.description === community.description &&
                      settings.is_private === community.is_private
                    }
                  >
                    Save Changes
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  Danger Zone
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  These actions are irreversible. Proceed with caution.
                </Typography>

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialog(true)}
                >
                  Delete Community
                </Button>
              </CardContent>
            </Card>
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
          bgcolor: "#0f172a",
          minHeight: "100vh",
          color: "white",
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          {community ? (
            <>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {community.name}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                    {community.description}
                  </Typography>
                </Box>
                <Box>
                  <Button
                    variant="contained"
                    startIcon={<ShareIcon />}
                    onClick={copyInviteLink}
                    sx={{ mr: 2 }}
                  >
                    Share
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={() => setTab(2)}
                  >
                    Settings
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Chip
                  label={`${community.member_count} members`}
                  icon={<GroupsIcon fontSize="small" />}
                  sx={{ mr: 2 }}
                />
                <Chip
                  label={community.is_private ? "Private" : "Public"}
                  icon={community.is_private ? <LockIcon fontSize="small" /> : <PublicIcon fontSize="small" />}
                  color={community.is_private ? "error" : "success"}
                />
              </Box>

              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                textColor="inherit"
                indicatorColor="primary"
                sx={{
                  mb: 3,
                  "& .MuiTabs-indicator": {
                    height: 4,
                    borderRadius: 2,
                  },
                }}
              >
                <Tab
                  label="Members"
                  icon={<PersonIcon />}
                  iconPosition="start"
                  sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                />
                <Tab
                  label={
                    <Badge badgeContent={pendingRequests.length} color="error">
                      Requests
                    </Badge>
                  }
                  icon={<EmailIcon />}
                  iconPosition="start"
                  sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                />
                <Tab
                  label="Settings"
                  icon={<SettingsIcon />}
                  iconPosition="start"
                  sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                />
              </Tabs>

              {renderTabContent()}
            </>
          ) : (
            !loading && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Community not found
              </Alert>
            )
          )}
        </Box>
      </Box>

      {/* Member Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={promoteToAdmin}>
          <AdminIcon fontSize="small" sx={{ mr: 1 }} />
          Promote to Admin
        </MenuItem>
        <MenuItem onClick={removeMember}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" />
          <Typography color="error">Remove Member</Typography>
        </MenuItem>
      </Menu>

      {/* Delete Community Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: "#1e293b",
            color: "white",
            minWidth: 400,
          },
        }}
      >
        <DialogTitle>Delete Community?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete the "{community?.name}" community?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={deleteCommunity}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog
        open={inviteDialog}
        onClose={() => setInviteDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: "#1e293b",
            color: "white",
            minWidth: 400,
          },
        }}
      >
        <DialogTitle>Invite Members</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Invite new members to join your community
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="textSecondary">
            Or share this invite link:
          </Typography>
          <Box
            sx={{
              p: 1,
              bgcolor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 1,
              mt: 1,
              wordBreak: "break-all",
            }}
          >
            {window.location.origin}/communities/join/{id}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialog(false)}>Cancel</Button>
          <Button
            onClick={sendInvite}
            variant="contained"
            disabled={!inviteEmail}
          >
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}