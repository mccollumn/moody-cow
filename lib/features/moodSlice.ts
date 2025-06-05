import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface MoodState {
  currentMood: string | null;
  confidence: number;
  method: "facial" | "text" | null;
  isDetecting: boolean;
  error: string | null;
  history: MoodDetection[];
  sessionId: string | null;
}

export interface MoodDetection {
  id: string;
  mood: string;
  confidence: number;
  method: "facial" | "text";
  timestamp: string;
  inputData?: string;
}

export interface DetectMoodPayload {
  method: "facial" | "text";
  inputData?: string; // For text analysis
  imageData?: string; // For facial analysis
  moodResult?: {
    mood: string;
    confidence: number;
    expressions?: Record<string, number>;
    score?: number;
    timestamp: string;
  };
}

// Async thunk for mood detection
export const detectMood = createAsyncThunk(
  "mood/detectMood",
  async (payload: DetectMoodPayload, { rejectWithValue }) => {
    try {
      // If we have a pre-computed mood result from local analysis, use it
      if (payload.moodResult) {
        return {
          mood: payload.moodResult.mood,
          confidence: payload.moodResult.confidence,
          method: payload.method,
          timestamp: payload.moodResult.timestamp,
          success: true,
        };
      }

      // Otherwise, fall back to API
      const response = await fetch("/api/mood/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to detect mood");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

// Async thunk for saving mood detection
export const saveMoodDetection = createAsyncThunk(
  "mood/saveMoodDetection",
  async (moodDetection: Omit<MoodDetection, "id">, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/mood/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(moodDetection),
      });

      if (!response.ok) {
        throw new Error("Failed to save mood detection");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

const initialState: MoodState = {
  currentMood: null,
  confidence: 0,
  method: null,
  isDetecting: false,
  error: null,
  history: [],
  sessionId: null,
};

const moodSlice = createSlice({
  name: "mood",
  initialState,
  reducers: {
    startMoodDetection: (state) => {
      state.isDetecting = true;
      state.error = null;
    },
    clearMoodError: (state) => {
      state.error = null;
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    clearCurrentMood: (state) => {
      state.currentMood = null;
      state.confidence = 0;
      state.method = null;
    },
    addToHistory: (state, action: PayloadAction<MoodDetection>) => {
      state.history.unshift(action.payload);
      // Keep only last 50 mood detections in memory
      if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(detectMood.pending, (state) => {
        state.isDetecting = true;
        state.error = null;
      })
      .addCase(detectMood.fulfilled, (state, action) => {
        state.isDetecting = false;
        state.currentMood = action.payload.mood;
        state.confidence = action.payload.confidence;
        state.method = action.payload.method;
        state.error = null;
      })
      .addCase(detectMood.rejected, (state, action) => {
        state.isDetecting = false;
        state.error = action.payload as string;
      })
      .addCase(saveMoodDetection.fulfilled, (state, action) => {
        // Add the saved mood detection to history
        state.history.unshift(action.payload);
      });
  },
});

export const {
  startMoodDetection,
  clearMoodError,
  setSessionId,
  clearCurrentMood,
  addToHistory,
} = moodSlice.actions;

export default moodSlice.reducer;
