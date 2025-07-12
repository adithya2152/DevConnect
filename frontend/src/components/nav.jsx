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
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useAuthStatus } from "../hooks/useAuthStatus";
import toast , { Toaster } from "react-hot-toast";
import axios from "axios";


export default function NavBar() {
  const { isAuthenticated, loading } = useAuthStatus();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const[logoutLoading, setLogoutLoading] = useState(false);
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async() => {
    try {
      // e.preventDefault();
      const res = await axios.post("http://localhost:8000/logout", {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (res.data.status !== "success") {
        throw new Error("Logout failed");
      } 
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
      setLogoutLoading(true); 

    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.response?.data?.detail || "Logout failed");
    }
    navigate("/");
  };

  if (loading) return null;

  return (
    <AppBar position="static" sx={{ backgroundColor: "#1F2937" }}>
      <Toaster position="top-right" reverseOrder={false} />
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ flexGrow: 1, color: "#fff", textDecoration: "none" }}
        >
          DevConnect
        </Typography>

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
            <Button color="inherit" component={RouterLink} to="/communities">
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
                  navigate("/my_profile");
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
                Logout
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
    </AppBar>
  );
}
