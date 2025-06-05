"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Slider,
  Card,
  CardContent,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  VolumeDown,
  Repeat,
  RepeatOne,
  Shuffle,
  ShuffleOn,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  play,
  pause,
  setCurrentTrack,
  setCurrentTime,
  setDuration,
  setVolume,
  toggleRepeat,
  toggleShuffle,
  provideFeedback,
} from "@/lib/features/musicSlice";

// Mock audio player - in production, you'd integrate with Spotify Web Playback SDK
const useAudioPlayer = (track: { previewUrl?: string } | null) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (track?.previewUrl) {
      const audioElement = new Audio(track.previewUrl);
      setAudio(audioElement);

      const handleTimeUpdate = () => {
        dispatch(setCurrentTime(audioElement.currentTime));
      };

      const handleLoadedMetadata = () => {
        dispatch(setDuration(audioElement.duration));
      };

      const handleEnded = () => {
        dispatch(pause());
      };

      audioElement.addEventListener("timeupdate", handleTimeUpdate);
      audioElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      audioElement.addEventListener("ended", handleEnded);

      return () => {
        audioElement.removeEventListener("timeupdate", handleTimeUpdate);
        audioElement.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
        audioElement.removeEventListener("ended", handleEnded);
        audioElement.pause();
        audioElement.src = "";
      };
    }
  }, [track, dispatch]);

  return audio;
};

export default function MusicPlayer() {
  const dispatch = useAppDispatch();
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());

  const { currentPlaylist, playback } = useAppSelector((state) => state.music);

  const audio = useAudioPlayer(playback.currentTrack);

  const tracks = useMemo(
    () => currentPlaylist?.tracks || [],
    [currentPlaylist?.tracks]
  );
  const currentTrack = playback.currentTrack || tracks[currentTrackIndex];

  // Set initial track if playlist exists but no current track
  useEffect(() => {
    if (tracks.length > 0 && !playback.currentTrack) {
      dispatch(setCurrentTrack(tracks[0]));
    }
  }, [tracks, playback.currentTrack, dispatch]);

  // Handle play/pause
  useEffect(() => {
    if (audio) {
      if (playback.isPlaying) {
        audio.play().catch(console.error);
      } else {
        audio.pause();
      }
    }
  }, [audio, playback.isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (audio) {
      audio.volume = playback.volume;
    }
  }, [audio, playback.volume]);

  const handlePlayPause = () => {
    if (playback.isPlaying) {
      dispatch(pause());
    } else {
      dispatch(play());
    }
  };

  const handleNext = () => {
    if (tracks.length === 0) return;

    let nextIndex;
    if (playback.shuffle) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % tracks.length;
    }

    setCurrentTrackIndex(nextIndex);
    dispatch(setCurrentTrack(tracks[nextIndex]));
  };

  const handlePrevious = () => {
    if (tracks.length === 0) return;

    let prevIndex;
    if (playback.shuffle) {
      prevIndex = Math.floor(Math.random() * tracks.length);
    } else {
      prevIndex =
        currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    }

    setCurrentTrackIndex(prevIndex);
    dispatch(setCurrentTrack(tracks[prevIndex]));
  };

  const handleSeek = (event: Event, newValue: number | number[]) => {
    const time = newValue as number;
    if (audio) {
      audio.currentTime = time;
      dispatch(setCurrentTime(time));
    }
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    dispatch(setVolume(newValue as number));
  };

  const handleToggleLike = () => {
    if (!currentTrack) return;

    const isLiked = likedTracks.has(currentTrack.spotifyId);
    const newLikedTracks = new Set(likedTracks);

    if (isLiked) {
      newLikedTracks.delete(currentTrack.spotifyId);
      dispatch(
        provideFeedback({
          trackId: currentTrack.spotifyId,
          feedback: "dislike",
        })
      );
    } else {
      newLikedTracks.add(currentTrack.spotifyId);
      dispatch(
        provideFeedback({ trackId: currentTrack.spotifyId, feedback: "like" })
      );
    }

    setLikedTracks(newLikedTracks);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getRepeatIcon = () => {
    switch (playback.repeat) {
      case "track":
        return <RepeatOne />;
      case "playlist":
        return <Repeat color="primary" />;
      default:
        return <Repeat />;
    }
  };

  if (!currentTrack) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="text.secondary" textAlign="center">
            No track selected
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Generate a mood-based playlist to start listening
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Now Playing
        </Typography>

        {/* Track Info */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar
            src={currentTrack.imageUrl}
            sx={{ width: 80, height: 80, mr: 2 }}
            variant="rounded"
          >
            🎵
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" noWrap>
              {currentTrack.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {currentTrack.artist}
            </Typography>
            {currentTrack.album && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {currentTrack.album}
              </Typography>
            )}
          </Box>
          <IconButton onClick={handleToggleLike} color="primary">
            {likedTracks.has(currentTrack.spotifyId) ? (
              <Favorite />
            ) : (
              <FavoriteBorder />
            )}
          </IconButton>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Slider
            value={playback.currentTime}
            max={playback.duration || 100}
            onChange={handleSeek}
            aria-labelledby="track-progress"
            size="small"
          />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary">
              {formatTime(playback.currentTime)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(playback.duration)}
            </Typography>
          </Box>
        </Box>

        {/* Controls */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Tooltip title={`Shuffle: ${playback.shuffle ? "On" : "Off"}`}>
            <IconButton onClick={() => dispatch(toggleShuffle())}>
              {playback.shuffle ? <ShuffleOn color="primary" /> : <Shuffle />}
            </IconButton>
          </Tooltip>

          <IconButton onClick={handlePrevious} size="large">
            <SkipPrevious />
          </IconButton>

          <IconButton
            onClick={handlePlayPause}
            size="large"
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": { backgroundColor: "primary.dark" },
              mx: 1,
            }}
          >
            {playback.isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>

          <IconButton onClick={handleNext} size="large">
            <SkipNext />
          </IconButton>

          <Tooltip
            title={`Repeat: ${
              playback.repeat === "off"
                ? "Off"
                : playback.repeat === "track"
                ? "Track"
                : "Playlist"
            }`}
          >
            <IconButton onClick={() => dispatch(toggleRepeat())}>
              {getRepeatIcon()}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Volume Control */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <VolumeDown />
          <Slider
            value={playback.volume}
            min={0}
            max={1}
            step={0.1}
            onChange={handleVolumeChange}
            aria-labelledby="volume-slider"
            sx={{ flex: 1 }}
          />
          <VolumeUp />
        </Box>

        {/* Loading indicator for preview tracks */}
        {!currentTrack.previewUrl && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
              display="block"
            >
              🎵 Preview not available - Connect Spotify for full playback
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
