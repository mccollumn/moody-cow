import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface UserPreferences {
  preferredGenres: string[];
  preferredArtists: string[];
  energyLevel: number; // 0.0 to 1.0
  enableCamera: boolean;
  enableTextInput: boolean;
  shareData: boolean;
}

export interface UserState {
  profile: UserProfile | null;
  preferences: UserPreferences;
  isAuthenticated: boolean;
  isLoading: boolean;
  isUpdatingPreferences: boolean;
  error: string | null;

  // Camera and permissions
  cameraPermission: "granted" | "denied" | "prompt" | null;
  isCameraActive: boolean;

  // Onboarding
  hasCompletedOnboarding: boolean;
}

export interface UpdatePreferencesPayload {
  preferredGenres?: string[];
  preferredArtists?: string[];
  energyLevel?: number;
  enableCamera?: boolean;
  enableTextInput?: boolean;
  shareData?: boolean;
}

export interface UpdateProfilePayload {
  name?: string;
  avatar?: string;
}

// Async thunk for fetching user profile and preferences
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/user/profile");

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

// Async thunk for updating user preferences
export const updateUserPreferences = createAsyncThunk(
  "user/updatePreferences",
  async (preferences: UpdatePreferencesPayload, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (profile: UpdateProfilePayload, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

const defaultPreferences: UserPreferences = {
  preferredGenres: [],
  preferredArtists: [],
  energyLevel: 0.5,
  enableCamera: true,
  enableTextInput: true,
  shareData: false,
};

const initialState: UserState = {
  profile: null,
  preferences: defaultPreferences,
  isAuthenticated: false,
  isLoading: false,
  isUpdatingPreferences: false,
  error: null,
  cameraPermission: null,
  isCameraActive: false,
  hasCompletedOnboarding: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Authentication
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.profile = null;
      state.isAuthenticated = false;
      state.preferences = defaultPreferences;
      state.hasCompletedOnboarding = false;
      state.cameraPermission = null;
      state.isCameraActive = false;
    },

    // Preferences (local updates)
    setPreferredGenres: (state, action: PayloadAction<string[]>) => {
      state.preferences.preferredGenres = action.payload;
    },
    setPreferredArtists: (state, action: PayloadAction<string[]>) => {
      state.preferences.preferredArtists = action.payload;
    },
    setEnergyLevel: (state, action: PayloadAction<number>) => {
      state.preferences.energyLevel = Math.max(0, Math.min(1, action.payload));
    },
    toggleCameraEnabled: (state) => {
      state.preferences.enableCamera = !state.preferences.enableCamera;
    },
    toggleTextInputEnabled: (state) => {
      state.preferences.enableTextInput = !state.preferences.enableTextInput;
    },
    toggleShareData: (state) => {
      state.preferences.shareData = !state.preferences.shareData;
    },

    // Camera management
    setCameraPermission: (
      state,
      action: PayloadAction<"granted" | "denied" | "prompt">
    ) => {
      state.cameraPermission = action.payload;
    },
    setCameraActive: (state, action: PayloadAction<boolean>) => {
      state.isCameraActive = action.payload;
    },

    // Onboarding
    completeOnboarding: (state) => {
      state.hasCompletedOnboarding = true;
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.profile;
        state.preferences = {
          ...defaultPreferences,
          ...action.payload.preferences,
        };
        state.isAuthenticated = true;
        state.hasCompletedOnboarding =
          action.payload.hasCompletedOnboarding || false;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update preferences
      .addCase(updateUserPreferences.pending, (state) => {
        state.isUpdatingPreferences = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.isUpdatingPreferences = false;
        state.preferences = { ...state.preferences, ...action.payload };
        state.error = null;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.isUpdatingPreferences = false;
        state.error = action.payload as string;
      })

      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile = { ...state.profile, ...action.payload };
        }
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setAuthenticated,
  setProfile,
  logout,
  setPreferredGenres,
  setPreferredArtists,
  setEnergyLevel,
  toggleCameraEnabled,
  toggleTextInputEnabled,
  toggleShareData,
  setCameraPermission,
  setCameraActive,
  completeOnboarding,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;
