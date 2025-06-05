import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface Track {
  spotifyId: string;
  name: string;
  artist: string;
  album?: string;
  duration?: number;
  previewUrl?: string;
  imageUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  mood?: string;
  genre?: string;
  energy?: number;
  tracks: Track[];
  isPublic: boolean;
  spotifyPlaylistId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  volume: number;
  repeat: "off" | "track" | "playlist";
  shuffle: boolean;
}

export interface MusicState {
  // Current playlist and playback
  currentPlaylist: Playlist | null;
  playback: PlaybackState;

  // User's saved playlists
  savedPlaylists: Playlist[];

  // Recommended playlist based on mood
  recommendedPlaylist: Playlist | null;

  // Loading states
  isLoadingRecommendations: boolean;
  isLoadingPlaylist: boolean;
  isSavingPlaylist: boolean;

  // Filters
  genreFilter: string[];
  artistFilter: string[];
  energyLevelFilter: number;

  // Error handling
  error: string | null;
}

export interface GeneratePlaylistPayload {
  mood: string;
  genre?: string[];
  artists?: string[];
  energyLevel?: number;
  limit?: number;
}

export interface SavePlaylistPayload {
  name: string;
  description?: string;
  tracks: Track[];
  mood?: string;
  isPublic?: boolean;
}

// Async thunk for generating mood-based playlist
export const generateMoodPlaylist = createAsyncThunk(
  "music/generateMoodPlaylist",
  async (payload: GeneratePlaylistPayload, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/music/generate-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to generate playlist");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

// Async thunk for saving playlist
export const savePlaylist = createAsyncThunk(
  "music/savePlaylist",
  async (payload: SavePlaylistPayload, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/music/save-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save playlist");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

// Async thunk for fetching user's playlists
export const fetchUserPlaylists = createAsyncThunk(
  "music/fetchUserPlaylists",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/music/playlists");

      if (!response.ok) {
        throw new Error("Failed to fetch playlists");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

const initialPlaybackState: PlaybackState = {
  isPlaying: false,
  currentTrack: null,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  repeat: "off",
  shuffle: false,
};

const initialState: MusicState = {
  currentPlaylist: null,
  playback: initialPlaybackState,
  savedPlaylists: [],
  recommendedPlaylist: null,
  isLoadingRecommendations: false,
  isLoadingPlaylist: false,
  isSavingPlaylist: false,
  genreFilter: [],
  artistFilter: [],
  energyLevelFilter: 0.5,
  error: null,
};

const musicSlice = createSlice({
  name: "music",
  initialState,
  reducers: {
    // Playback controls
    play: (state) => {
      state.playback.isPlaying = true;
    },
    pause: (state) => {
      state.playback.isPlaying = false;
    },
    setCurrentTrack: (state, action: PayloadAction<Track>) => {
      state.playback.currentTrack = action.payload;
      state.playback.currentTime = 0;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.playback.currentTime = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.playback.duration = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.playback.volume = Math.max(0, Math.min(1, action.payload));
    },
    toggleRepeat: (state) => {
      const modes: Array<"off" | "track" | "playlist"> = [
        "off",
        "track",
        "playlist",
      ];
      const currentIndex = modes.indexOf(state.playback.repeat);
      state.playback.repeat = modes[(currentIndex + 1) % modes.length];
    },
    toggleShuffle: (state) => {
      state.playback.shuffle = !state.playback.shuffle;
    },

    // Playlist management
    setCurrentPlaylist: (state, action: PayloadAction<Playlist>) => {
      state.currentPlaylist = action.payload;
    },
    clearCurrentPlaylist: (state) => {
      state.currentPlaylist = null;
      state.playback = initialPlaybackState;
    },

    // Filters
    setGenreFilter: (state, action: PayloadAction<string[]>) => {
      state.genreFilter = action.payload;
    },
    setArtistFilter: (state, action: PayloadAction<string[]>) => {
      state.artistFilter = action.payload;
    },
    setEnergyLevelFilter: (state, action: PayloadAction<number>) => {
      state.energyLevelFilter = action.payload;
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    },

    // Track feedback (for learning)
    provideFeedback: (
      state,
      action: PayloadAction<{ trackId: string; feedback: "like" | "dislike" }>
    ) => {
      // This will be handled by an async thunk in a real implementation
      // For now, we'll just log it
      console.log("Feedback provided:", action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate mood playlist
      .addCase(generateMoodPlaylist.pending, (state) => {
        state.isLoadingRecommendations = true;
        state.error = null;
      })
      .addCase(generateMoodPlaylist.fulfilled, (state, action) => {
        state.isLoadingRecommendations = false;
        state.recommendedPlaylist = action.payload;
        state.error = null;
      })
      .addCase(generateMoodPlaylist.rejected, (state, action) => {
        state.isLoadingRecommendations = false;
        state.error = action.payload as string;
      })

      // Save playlist
      .addCase(savePlaylist.pending, (state) => {
        state.isSavingPlaylist = true;
        state.error = null;
      })
      .addCase(savePlaylist.fulfilled, (state, action) => {
        state.isSavingPlaylist = false;
        state.savedPlaylists.push(action.payload);
        state.error = null;
      })
      .addCase(savePlaylist.rejected, (state, action) => {
        state.isSavingPlaylist = false;
        state.error = action.payload as string;
      })

      // Fetch user playlists
      .addCase(fetchUserPlaylists.pending, (state) => {
        state.isLoadingPlaylist = true;
        state.error = null;
      })
      .addCase(fetchUserPlaylists.fulfilled, (state, action) => {
        state.isLoadingPlaylist = false;
        state.savedPlaylists = action.payload;
        state.error = null;
      })
      .addCase(fetchUserPlaylists.rejected, (state, action) => {
        state.isLoadingPlaylist = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  play,
  pause,
  setCurrentTrack,
  setCurrentTime,
  setDuration,
  setVolume,
  toggleRepeat,
  toggleShuffle,
  setCurrentPlaylist,
  clearCurrentPlaylist,
  setGenreFilter,
  setArtistFilter,
  setEnergyLevelFilter,
  clearError,
  provideFeedback,
} = musicSlice.actions;

export default musicSlice.reducer;
