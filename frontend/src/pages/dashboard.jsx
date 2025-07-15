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
const API_BASE_URL = import.meta.env.VITE_API_KEY
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

export default function Dashboard() {
  useAuthGuard();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [openPostModal, setOpenPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const fetchFeed = async () => {
    try {
      setLoading(true);
      if (!userId) return;
      const res = await fetch(`${API_BASE_URL}/feed/${userId}`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log("Feed data received:", data);
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

  const handleLike = async (postId) => {
    try {
      console.log(`Liking post ${postId} by user ${userId}`);
      
      const response = await fetch(`${API_BASE_URL}/feed/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to like post: ${response.status} - ${errorText}`);
        return;
      }
      
      const result = await response.json();
      console.log("Like response:", result);
      
      // Update the specific post based on server response
      if (result.success || result.liked !== undefined) {
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                liked_by_user: result.liked ?? !post.liked_by_user,
                likes: result.like_count ?? result.likes ?? (result.liked ? (post.likes || 0) + 1 : (post.likes || 0) - 1),
                like_count: result.like_count ?? result.likes ?? (result.liked ? (post.like_count || 0) + 1 : (post.like_count || 0) - 1)
              };
            }
            return post;
          })
        );
      } else {
        // Fallback: refresh feed if response format is unexpected
        await fetchFeed();
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async (postId) => {
    const comment = commentText[postId]?.trim();
    if (!comment) return;

    try {
      console.log(`Adding comment to post ${postId}: "${comment}" by user ${userId}`);
      
      const response = await fetch(`${API_BASE_URL}/feed/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, comment }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to add comment: ${response.status} - ${errorText}`);
        return;
      }

      const result = await response.json();
      console.log("Comment response:", result);

      // Clear the input
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
      
      // Update the specific post based on server response
      if (result.success || result.comment) {
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post.id === postId) {
              const newComment = result.comment || {
                id: Date.now(),
                text: comment,
                author: { name: user?.name || "You" },
                created_at: new Date().toISOString()
              };
              
              return {
                ...post,
                comments: [...(post.comments || []), newComment],
                comment_count: (post.comment_count || 0) + 1
              };
            }
            return post;
          })
        );
      } else {
        // Fallback: refresh feed if response format is unexpected
        await fetchFeed();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handlePostSubmit = async () => {
    try {
      const tagsArray = newPostTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      console.log("Submitting post to:", `${API_BASE_URL}/feed/create`);
      
      const response = await fetch(`${API_BASE_URL}/feed/create`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          content: newPostContent,
          tags: tagsArray,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`HTTP ${response.status}: ${errorData}`);
        throw new Error(`Failed to create post: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Post created successfully:", result);

      setNewPostContent("");
      setNewPostTags("");
      setOpenPostModal(false);
      fetchFeed();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#09435aff", minHeight: "100vh" }}>
      <NavBar />

      {/* Post Creation Modal */}
      <Modal open={openPostModal} onClose={() => setOpenPostModal(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ color: marshGreen, mb: 2 }}>
            Create a Post
          </Typography>
          <TextField
            id="post-content"
            name="post-content"
            autoComplete="off"
            multiline
            fullWidth
            placeholder="What's on your mind?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: marshGreen },
                "& textarea": { color: "#fff" },
              },
            }}
          />
          <TextField
            id="post-tags"
            name="post-tags"
            autoComplete="off"
            fullWidth
            placeholder="Tags (comma separated)"
            value={newPostTags}
            onChange={(e) => setNewPostTags(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: marshGreen },
                "& input": { color: "#fff" },
              },
            }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={handlePostSubmit}
            sx={{ backgroundColor: marshGreen, color: "#000" }}
          >
            Post
          </Button>
        </Box>
      </Modal>

      {/* Feed */}
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
          posts.map((post) => (
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
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: marshGreen }}>
                    {post.author?.name?.[0]?.toUpperCase() || "U"}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {post.author?.name || "Unknown"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#aaa" }}>
                      {new Date(post.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>

                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "1.15rem",
                    lineHeight: 1.6,
                    mb: 2,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {post.content}
                </Typography>

                {post.tags?.length > 0 && (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                    {post.tags.map((tag, idx) => (
                      <Chip
                        key={idx}
                        label={`#${tag}`}
                        size="medium"
                        sx={{ backgroundColor: marshGreen, color: "#000" }}
                      />
                    ))}
                  </Box>
                )}

                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <IconButton onClick={() => handleLike(post.id)} sx={{ color: marshGreen }}>
                    {post.liked_by_user ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                  <Typography variant="body2" sx={{ color: "#aaa" }}>
                    {post.likes || post.like_count || 0} Likes • {post.comments?.length || post.comment_count || 0} Comments
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <TextField
                    id={`comment-${post.id}`}
                    name={`comment-${post.id}`}
                    autoComplete="off"
                    fullWidth
                    size="small"
                    placeholder="Write a comment..."
                    value={commentText[post.id] || ""}
                    onChange={(e) =>
                      setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: marshGreen },
                        "& input": { color: "#fff" },
                      },
                    }}
                  />
                  <IconButton onClick={() => handleComment(post.id)} sx={{ color: marshGreen }}>
                    <SendIcon />
                  </IconButton>
                </Box>

                <Box sx={{ borderTop: "1px solid #333", pt: 1 }}>
                  {post.comments?.map((comment, idx) => (
                    <Box key={idx} sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ color: "#ccc" }}>
                        <strong style={{ color: marshGreen }}>
                          {comment.author?.name || "User"}:
                        </strong>{" "}
                        {comment.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography sx={{ color: "#888" }}>
            No posts found based on your profile tags.
          </Typography>
        )}
      </Box>

      {/* Floating "+ Post" Button */}
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