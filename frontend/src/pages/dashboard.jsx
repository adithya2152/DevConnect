import React, { useEffect, useState } from "react";
import NavBar from "../components/nav";
import useAuthGuard from "../hooks/useAuthGuarf";
import InlineChatbox from "../components/chat/InlineChatbox";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  CircularProgress,
  Stack,
  Button,
  TextField,
  IconButton,
  Modal,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";

const marshGreen = "#0e6672ff";
const API_BASE_URL = "http://localhost:8000";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 600,
  bgcolor: "#111",
  border: `1px solid ${marshGreen}`,
  boxShadow: 24,
  p: 3,
  borderRadius: 2,
};

// (rest of the imports remain unchanged)

export default function Dashboard() {
  useAuthGuard();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [openPostModal, setOpenPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const fetchFeed = async () => {
    try {
      setLoading(true);
      if (!userId) return;
      const res = await fetch(`${API_BASE_URL}/feed/${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchFeed();
  }, [userId]);

  // handleLike, handleComment, handlePostSubmit remain unchanged...

  return (
    <Box sx={{ backgroundColor: "#09435aff", minHeight: "100vh" }}>
      <NavBar />

      <Modal open={openPostModal} onClose={() => setOpenPostModal(false)}>
        <Box sx={modalStyle}>
          {/* Modal content remains unchanged */}
        </Box>
      </Modal>

      <Box
        sx={{
          px: 2,
          py: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Typography variant="h4" sx={{ color: "#fff" }}>
            Your Feed
          </Typography>
          <IconButton
            onClick={fetchFeed}
            sx={{ color: marshGreen }}
            disabled={loading}
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <CircularProgress sx={{ color: marshGreen }} />
            <Typography sx={{ color: "#ccc", mt: 1 }}>Loading posts...</Typography>
          </Box>
        ) : posts.length > 0 ? (
          [...posts]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map((post) => (
              <Card
                key={post.id}
                sx={{
                  backgroundColor: "#111",
                  color: "white",
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${marshGreen}`,
                  width: "100%",
                  maxWidth: "700px",
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  {/* Post card UI remains unchanged */}
                </CardContent>
              </Card>
            ))
        ) : (
          <Typography sx={{ color: "#888" }}>
            No posts found based on your profile tags.
          </Typography>
        )}
      </Box>

      <IconButton
        onClick={() => setOpenPostModal(true)}
        sx={{
          position: "fixed",
          bottom: 30,
          left: 30,
          backgroundColor: marshGreen,
          color: "#000",
          "&:hover": { backgroundColor: "#0c5058" },
        }}
        size="large"
      >
        <AddIcon />
      </IconButton>

      <InlineChatbox />
    </Box>
  );
}
