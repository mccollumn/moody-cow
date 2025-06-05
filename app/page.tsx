"use client";

import React from "react";
import { Container, Typography, Box, Grid, Paper } from "@mui/material";
import { useAppSelector } from "@/lib/hooks";
import MoodDetectionPanel from "./components/MoodDetectionPanel";
import MusicPlayer from "./components/MusicPlayer";
import PlaylistView from "./components/PlaylistView";
import UserDashboard from "./components/UserDashboard";
import Navigation from "./components/Navigation";

export default function HomePage() {
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const { currentMood } = useAppSelector((state) => state.mood);
  const { currentPlaylist } = useAppSelector((state) => state.music);

  return (
    <>
      <Navigation />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            🐄 Moody Cow
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
            Music that matches your mood
          </Typography>
          {currentMood && (
            <Typography variant="subtitle1" color="primary">
              Current mood: {currentMood}
            </Typography>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Left Column - Mood Detection */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={3} sx={{ p: 3, height: "fit-content" }}>
              <MoodDetectionPanel />
            </Paper>
          </Grid>

          {/* Middle Column - Music Player and Playlist */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={3}>
              {/* Music Player */}
              {currentPlaylist && (
                <Grid size={12}>
                  <Paper elevation={3} sx={{ p: 3 }}>
                    <MusicPlayer />
                  </Paper>
                </Grid>
              )}

              {/* Playlist View */}
              <Grid size={12}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <PlaylistView />
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Bottom - User Dashboard */}
          {isAuthenticated && (
            <Grid size={12}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <UserDashboard />
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
}
