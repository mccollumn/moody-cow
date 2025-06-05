"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Slider,
  Chip,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  Person,
  Settings,
  History,
  TrendingUp,
  Mood,
  Edit,
  Save,
  Cancel,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  updateUserProfile,
  updateUserPreferences,
} from "@/lib/features/userSlice";

const MUSIC_GENRES = [
  "Pop",
  "Rock",
  "Hip Hop",
  "Electronic",
  "Jazz",
  "Classical",
  "Country",
  "R&B",
  "Reggae",
  "Blues",
  "Folk",
  "Punk",
  "Metal",
  "Alternative",
  "Indie",
];

const MOOD_COLORS: Record<string, string> = {
  happy: "#FFD93D",
  sad: "#6BB6FF",
  angry: "#FF6B6B",
  surprise: "#FF9A8B",
  fear: "#B19CD9",
  disgust: "#95E1D3",
  neutral: "#C7C7C7",
  energetic: "#FF6B6B",
  calm: "#4ECDC4",
};

export default function UserDashboard() {
  const dispatch = useAppDispatch();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [preferencesDialogOpen, setPreferencesDialogOpen] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ name: "", avatar: "" });
  const [editedPreferences, setEditedPreferences] = useState({
    preferredGenres: [] as string[],
    preferredArtists: [] as string[],
    energyLevel: 0.5,
    enableCamera: true,
    enableTextInput: true,
    shareData: false,
  });

  const { profile, preferences, isUpdatingPreferences } = useAppSelector(
    (state) => state.user
  );

  const { history } = useAppSelector((state) => state.mood);

  React.useEffect(() => {
    if (profile) {
      setEditedProfile({
        name: profile.name || "",
        avatar: profile.avatar || "",
      });
    }
  }, [profile]);

  React.useEffect(() => {
    setEditedPreferences(preferences);
  }, [preferences]);

  const handleSaveProfile = () => {
    dispatch(updateUserProfile(editedProfile));
    setProfileDialogOpen(false);
  };

  const handleSavePreferences = () => {
    dispatch(updateUserPreferences(editedPreferences));
    setPreferencesDialogOpen(false);
  };

  const getMoodStats = () => {
    const moodCounts: Record<string, number> = {};
    history.forEach((detection) => {
      moodCounts[detection.mood] = (moodCounts[detection.mood] || 0) + 1;
    });

    const sortedMoods = Object.entries(moodCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return sortedMoods;
  };

  const getRecentMoods = () => {
    return history.slice(0, 10);
  };

  const moodStats = getMoodStats();
  const recentMoods = getRecentMoods();

  if (!profile) {
    return (
      <Card>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Person sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Please sign in to view your dashboard
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        User Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar
                src={profile.avatar}
                sx={{ width: 80, height: 80, mx: "auto", mb: 2 }}
              >
                {profile.name?.charAt(0) || "U"}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {profile.name || "User"}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profile.email}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setProfileDialogOpen(true)}
                sx={{ mt: 1 }}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Preferences Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">
                  <Settings sx={{ mr: 1, verticalAlign: "middle" }} />
                  Preferences
                </Typography>
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => setPreferencesDialogOpen(true)}
                >
                  Edit
                </Button>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Preferred Genres
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {preferences.preferredGenres.slice(0, 3).map((genre) => (
                    <Chip key={genre} label={genre} size="small" />
                  ))}
                  {preferences.preferredGenres.length > 3 && (
                    <Chip
                      label={`+${preferences.preferredGenres.length - 3} more`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Energy Level: {Math.round(preferences.energyLevel * 100)}%
                </Typography>
                <Slider
                  value={preferences.energyLevel}
                  disabled
                  size="small"
                  min={0}
                  max={1}
                />
              </Box>

              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.enableCamera}
                      disabled
                      size="small"
                    />
                  }
                  label="Camera Detection"
                  sx={{ display: "block", mb: 1 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.enableTextInput}
                      disabled
                      size="small"
                    />
                  }
                  label="Text Analysis"
                  sx={{ display: "block" }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Mood Statistics */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TrendingUp sx={{ mr: 1, verticalAlign: "middle" }} />
                Mood Statistics
              </Typography>

              {moodStats.length > 0 ? (
                <List dense>
                  {moodStats.map(([mood, count]) => (
                    <ListItem key={mood} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            backgroundColor:
                              MOOD_COLORS[mood] || MOOD_COLORS.neutral,
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={mood.charAt(0).toUpperCase() + mood.slice(1)}
                        secondary={`${count} times`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  No mood data yet. Start detecting your mood to see statistics.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Mood History */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <History sx={{ mr: 1, verticalAlign: "middle" }} />
                Recent Mood History
              </Typography>

              {recentMoods.length > 0 ? (
                <List>
                  {recentMoods.map((detection, index) => (
                    <React.Fragment key={detection.id}>
                      <ListItem>
                        <ListItemIcon>
                          <Mood sx={{ color: MOOD_COLORS[detection.mood] }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography variant="body1">
                                {detection.mood.charAt(0).toUpperCase() +
                                  detection.mood.slice(1)}
                              </Typography>
                              <Chip
                                label={`${Math.round(
                                  detection.confidence * 100
                                )}%`}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={detection.method}
                                size="small"
                                color="primary"
                              />
                            </Box>
                          }
                          secondary={new Date(
                            detection.timestamp
                          ).toLocaleString()}
                        />
                      </ListItem>
                      {index < recentMoods.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  No mood history yet. Start detecting your mood to build your
                  history.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Profile Edit Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={editedProfile.name}
            onChange={(e) =>
              setEditedProfile({ ...editedProfile, name: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Avatar URL"
            fullWidth
            variant="outlined"
            value={editedProfile.avatar}
            onChange={(e) =>
              setEditedProfile({ ...editedProfile, avatar: e.target.value })
            }
            placeholder="https://example.com/avatar.jpg"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setProfileDialogOpen(false)}
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            startIcon={<Save />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preferences Edit Dialog */}
      <Dialog
        open={preferencesDialogOpen}
        onClose={() => setPreferencesDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Preferences</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Music Preferences
            </Typography>
            <Autocomplete
              multiple
              options={MUSIC_GENRES}
              value={editedPreferences.preferredGenres}
              onChange={(_, value) =>
                setEditedPreferences({
                  ...editedPreferences,
                  preferredGenres: value,
                })
              }
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Preferred Genres"
                />
              )}
              sx={{ mb: 2 }}
            />

            <Typography variant="body2" gutterBottom>
              Energy Level: {Math.round(editedPreferences.energyLevel * 100)}%
            </Typography>
            <Slider
              value={editedPreferences.energyLevel}
              onChange={(_, value) =>
                setEditedPreferences({
                  ...editedPreferences,
                  energyLevel: value as number,
                })
              }
              min={0}
              max={1}
              step={0.1}
              marks={[
                { value: 0, label: "Calm" },
                { value: 0.5, label: "Medium" },
                { value: 1, label: "High Energy" },
              ]}
              sx={{ mb: 3 }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Detection Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={editedPreferences.enableCamera}
                  onChange={(e) =>
                    setEditedPreferences({
                      ...editedPreferences,
                      enableCamera: e.target.checked,
                    })
                  }
                />
              }
              label="Enable Camera Detection"
              sx={{ display: "block", mb: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editedPreferences.enableTextInput}
                  onChange={(e) =>
                    setEditedPreferences({
                      ...editedPreferences,
                      enableTextInput: e.target.checked,
                    })
                  }
                />
              }
              label="Enable Text Analysis"
              sx={{ display: "block", mb: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editedPreferences.shareData}
                  onChange={(e) =>
                    setEditedPreferences({
                      ...editedPreferences,
                      shareData: e.target.checked,
                    })
                  }
                />
              }
              label="Share Data for Improvements"
              sx={{ display: "block" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPreferencesDialogOpen(false)}
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePreferences}
            variant="contained"
            startIcon={<Save />}
            disabled={isUpdatingPreferences}
          >
            {isUpdatingPreferences ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
