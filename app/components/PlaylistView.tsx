"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tab,
  Tabs,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Save,
  Favorite,
  FavoriteBorder,
  QueueMusic,
  AutoAwesome,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  setCurrentTrack,
  setCurrentPlaylist,
  savePlaylist,
  fetchUserPlaylists,
  play,
  pause,
  type Track,
  type Playlist,
} from "@/lib/features/musicSlice";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`playlist-tabpanel-${index}`}
      aria-labelledby={`playlist-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function PlaylistView() {
  const dispatch = useAppDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());

  const {
    currentPlaylist,
    recommendedPlaylist,
    savedPlaylists,
    playback,
    isSavingPlaylist,
  } = useAppSelector((state) => state.music);

  const { currentMood } = useAppSelector((state) => state.mood);

  // Load user playlists on mount
  React.useEffect(() => {
    dispatch(fetchUserPlaylists());
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePlayTrack = (track: Track, playlist: Playlist) => {
    dispatch(setCurrentTrack(track));
    if (playlist && playlist !== currentPlaylist) {
      dispatch(setCurrentPlaylist(playlist));
    }
    dispatch(play());
  };

  const handlePauseTrack = () => {
    dispatch(pause());
  };

  const handleSavePlaylist = () => {
    if (recommendedPlaylist && playlistName.trim()) {
      dispatch(
        savePlaylist({
          name: playlistName.trim(),
          description: playlistDescription.trim() || undefined,
          tracks: recommendedPlaylist.tracks,
          mood: currentMood || undefined,
          isPublic: false,
        })
      );
      setSaveDialogOpen(false);
      setPlaylistName("");
      setPlaylistDescription("");
    }
  };

  const handleToggleLike = (trackId: string) => {
    const newLikedTracks = new Set(likedTracks);
    if (likedTracks.has(trackId)) {
      newLikedTracks.delete(trackId);
    } else {
      newLikedTracks.add(trackId);
    }
    setLikedTracks(newLikedTracks);
  };

  const renderTrackList = (playlist: Playlist, showHeader = true) => {
    if (!playlist || !playlist.tracks || playlist.tracks.length === 0) {
      return (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <QueueMusic sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tracks available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generate a mood-based playlist to get started
            </Typography>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        {showHeader && (
          <CardContent sx={{ pb: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="h6" gutterBottom>
                  {playlist.name}
                </Typography>
                {playlist.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {playlist.description}
                  </Typography>
                )}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {playlist.mood && (
                    <Chip
                      label={`Mood: ${playlist.mood}`}
                      size="small"
                      color="primary"
                      icon={<AutoAwesome />}
                    />
                  )}
                  {playlist.genre && (
                    <Chip
                      label={playlist.genre}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {playlist.energy !== undefined && (
                    <Chip
                      label={`Energy: ${Math.round(playlist.energy * 100)}%`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
              {playlist === recommendedPlaylist && (
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={() => setSaveDialogOpen(true)}
                  disabled={isSavingPlaylist}
                >
                  Save
                </Button>
              )}
            </Box>
          </CardContent>
        )}

        <List>
          {playlist.tracks.map((track: Track, index: number) => {
            const isCurrentTrack =
              playback.currentTrack?.spotifyId === track.spotifyId;
            const isPlaying = isCurrentTrack && playback.isPlaying;

            return (
              <Fade in key={track.spotifyId} timeout={300 + index * 50}>
                <ListItem
                  sx={{
                    borderLeft: isCurrentTrack ? "4px solid" : "none",
                    borderLeftColor: "primary.main",
                    backgroundColor: isCurrentTrack
                      ? "action.selected"
                      : "transparent",
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={track.imageUrl}
                      variant="rounded"
                      sx={{ width: 48, height: 48 }}
                    >
                      🎵
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Typography variant="body1" noWrap>
                        {track.name}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {track.artist}
                        </Typography>
                        {track.album && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            {track.album}
                          </Typography>
                        )}
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Tooltip
                        title={
                          likedTracks.has(track.spotifyId) ? "Unlike" : "Like"
                        }
                      >
                        <IconButton
                          onClick={() => handleToggleLike(track.spotifyId)}
                          size="small"
                        >
                          {likedTracks.has(track.spotifyId) ? (
                            <Favorite color="error" />
                          ) : (
                            <FavoriteBorder />
                          )}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={isPlaying ? "Pause" : "Play"}>
                        <IconButton
                          onClick={() =>
                            isPlaying
                              ? handlePauseTrack()
                              : handlePlayTrack(track, playlist)
                          }
                          sx={{ ml: 1 }}
                        >
                          {isPlaying ? <Pause /> : <PlayArrow />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              </Fade>
            );
          })}
        </List>
      </Card>
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Playlists
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Recommended" />
        <Tab label="Saved Playlists" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        {recommendedPlaylist ? (
          renderTrackList(recommendedPlaylist)
        ) : (
          <Card variant="outlined">
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <AutoAwesome
                sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No recommendations yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Detect your mood to get personalized music recommendations
              </Typography>
            </CardContent>
          </Card>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {savedPlaylists.length > 0 ? (
          <Grid container spacing={2}>
            {savedPlaylists.map((playlist) => (
              <Grid size={12} key={playlist.id}>
                {renderTrackList(playlist)}
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card variant="outlined">
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Save sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No saved playlists
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Save your mood-based playlists to access them anytime
              </Typography>
            </CardContent>
          </Card>
        )}
      </TabPanel>

      {/* Save Playlist Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Save Playlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Playlist Name"
            fullWidth
            variant="outlined"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder={`${
              currentMood
                ? currentMood.charAt(0).toUpperCase() + currentMood.slice(1)
                : "My"
            } Mood Playlist`}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={playlistDescription}
            onChange={(e) => setPlaylistDescription(e.target.value)}
            placeholder="Describe this playlist..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSavePlaylist}
            variant="contained"
            disabled={!playlistName.trim() || isSavingPlaylist}
          >
            {isSavingPlaylist ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
