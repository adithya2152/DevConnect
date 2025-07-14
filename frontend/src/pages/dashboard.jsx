import React, { useEffect, useState } from "react";
import NavBar from "../components/nav";
import useAuthGuard from "../hooks/useAuthGuarf";
// import ChatWidget from "../components/chat/Chatbot";
import InlineChatbox from "../components/chat/InlineChatbox";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from "@mui/material";

const marshGreen = "#0e6672ff";

export default function Dashboard() {
  useAuthGuard();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const res = await fetch(`${import.meta.env.VITE_API_KEY}/feed/${user.id}`);
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  return (
    <>
      <NavBar />
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="h4" sx={{ color: marshGreen, mb: 2 }}>
          Welcome to your dashboard!
        </Typography>

        {loading ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <CircularProgress />
            <Typography sx={{ color: "white" }}>Loading posts...</Typography>
          </Box>
        ) : Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post) => (
            <Card
              key={post.id}
              sx={{
                backgroundColor: "#111",
                color: "white",
                mb: 2,
                border: `1px solid ${marshGreen}`,
              }}
            >
              <CardContent>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mb: 1 }}>
                  {post.content}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {post.tags &&
                    post.tags.map((tag, idx) => (
                      <Chip
                        key={idx}
                        label={tag}
                        size="small"
                        sx={{ backgroundColor: marshGreen, color: "#000" }}
                      />
                    ))}
                </Box>
                <Typography variant="caption" sx={{ color: "#aaa", mt: 1, display: "block" }}>
                  Posted on: {new Date(post.created_at).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography sx={{ color: "#888" }}>No posts found based on your profile tags.</Typography>
        )}
      </Box>

      <InlineChatbox />
      {/* <ChatWidget /> */}
    </>
  );
}