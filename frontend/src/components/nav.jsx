import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  TextField,
  InputAdornment,
  debounce,
  ListItem,
  CircularProgress,
  styled, 
  Paper,
   ListItemText,
   List,
  ListItemAvatar
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import AccountCircle from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";
import { useAuthStatus } from "../hooks/useAuthStatus";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import ProfileModal from "./ProfileModal";

const SearchResults = styled(Paper)(() => ({
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  zIndex: 999,
  maxHeight: 300,
  overflowY: "auto",
  borderRadius: "0 0 10px 10px",
  backgroundColor: "#1f2937",
  color: "white",
}));



export default function NavBar() {

  const { isAuthenticated, loading } = useAuthStatus();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [Searchloading , setSearchLoading] = useState(false);
  const [profileModal, setProfileModal] = useState({ open: false, userId: null });

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8000/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      if (res.data.status !== "success") throw new Error("Logout failed");

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
      setLogoutLoading(true);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.response?.data?.detail || "Logout failed");
    }
  };
  const handleChange = async(e)=>
  {
    const val = e.target.value
    setSearchQuery(val);
    debouncedSearch(val);
  }

  const handleSelect =(item) =>
  {
    if (item.type === "dev") {
      setProfileModal({ open: true, userId: item.id });
      setSearchQuery(""); // Clear search
      setSearchResults([]);
    }
  }
  const debouncedSearch = debounce(async(query)=>
  {
    if(!query.trim())
    {
      setSearchResults([]);
      return;
    }
    try {
      
      setSearchLoading(true);
      const[devRes , projectRes ] = await Promise.all([
        axios.get(`http://localhost:8000/search/devs?q=${query}` , {headers : {Authorization : `Bearer ${localStorage.getItem("access_token")}`}}),
        axios.get(`http://localhost:8000/search/projects?q=${query}` , {headers : {Authorization : `Bearer ${localStorage.getItem("access_token")}`}})
      ]);
      const combined = [...devRes.data.map((item)=>({type : "dev" , ...item})) , ...projectRes.data.map((item)=>({type : "project" , ...item}))];
      // const combined = [...devRes.data.map((item)=>({type : "dev" , ...item}))];
      setSearchResults(combined);
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error.response?.data?.detail || "Search failed");

    }
    finally{
      setSearchLoading(false);
    }
  })

  const handleMessage = async (userId, userProfile) => {
    try {
      // Create or get existing room
      const response = await axios.post(
        'http://localhost:8000/chat/create-room',
        { other_user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
      
      if (response.data.room) {
        // Navigate to chat with the room
        navigate('/chat', { 
          state: { 
            selectedRoom: response.data.room,
            selectedUser: userProfile 
          } 
        });
      }
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to start conversation');
    }
  };

  if (loading) return null;

  return (
    <AppBar position="static" sx={{ backgroundColor: "#1F2937" }}>
      <Toaster position="top-right" reverseOrder={false} />
      <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ color: "#fff", textDecoration: "none", flexGrow: 1 }}
        >
          DevConnect
        </Typography>

        {isAuthenticated && (
  <Box sx={{ position: "relative", width: 300 }}>
    <TextField
      placeholder="Search devs or projects..."
      size="small"
      variant="outlined"
      value={searchQuery}
      onChange={handleChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: "#9CA3AF" }} />
          </InputAdornment>
        ),
        sx: {
          backgroundColor: "#374151",
          color: "white",
          borderRadius: 2,
          input: { color: "white" },
        },
      }}
      fullWidth
    />

    {searchQuery && (
      <SearchResults>
        {Searchloading ? (
          <ListItem>
            <CircularProgress size={20} /> &nbsp; Loading...
          </ListItem>
        ) : searchResults.length === 0 ? (
          <ListItem>
            <ListItemText primary="No results found" />
          </ListItem>
        ) : (
          <List>
            {searchResults.map((item, idx) => (
              <ListItem
                key={idx}
                onClick={() => handleSelect(item)}
                component="div"
                sx={{ cursor: "pointer" }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "#6366f1" }}>
                    {item.username?.charAt(0)?.toUpperCase() || item.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={item.full_name || item.name || item.username || item.title || item.detailed_description ||  "Unnamed Developer / Project"}
                  secondary={item.type}
                />

              </ListItem>
            ))}
          </List>
        )}
      </SearchResults>
    )}
  </Box>
)}


        {isAuthenticated ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button color="inherit" component={RouterLink} to="/dashboard">
              Feed
            </Button>
            <Button color="inherit" component={RouterLink} to="/chat">
              Chat
            </Button>
            <Button color="inherit" component={RouterLink} to="/projects">
              Projects
            </Button>
            <Button color="inherit" component={RouterLink} to="/community">
              Communities
            </Button>

            <IconButton
              onClick={handleMenuOpen}
              color="inherit"
              size="large"
              sx={{ ml: 2 }}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate("/profile");
                }}
              >
                Profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  handleLogout();
                }}
              >
                {logoutLoading? "Logging out..." : "Logout"}
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <>
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
            <Button color="inherit" component={RouterLink} to="/register">
              Register
            </Button>
          </>
        )}
      </Toolbar>
      
      <ProfileModal
        open={profileModal.open}
        onClose={() => setProfileModal({ open: false, userId: null })}
        userId={profileModal.userId}
        onMessage={handleMessage}
      />
    </AppBar>
  );
}
