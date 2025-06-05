"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  Videocam,
  VideocamOff,
  Psychology,
  Send,
  Refresh,
} from "@mui/icons-material";
import Webcam from "react-webcam";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  detectMood,
  clearMoodError,
  setSessionId,
} from "@/lib/features/moodSlice";
import { generateMoodPlaylist } from "@/lib/features/musicSlice";
import { setCameraActive, setCameraPermission } from "@/lib/features/userSlice";
import { textAnalysisService } from "@/lib/services/textAnalysisService";

const moodColors: Record<string, string> = {
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

export default function MoodDetectionPanel() {
  const dispatch = useAppDispatch();
  const webcamRef = useRef<Webcam>(null);
  const [textInput, setTextInput] = useState("");

  const { currentMood, confidence, method, isDetecting, error } =
    useAppSelector((state) => state.mood);

  const { preferences, cameraPermission, isCameraActive } = useAppSelector(
    (state) => state.user
  );

  const { isLoadingRecommendations, recommendedPlaylist } = useAppSelector(
    (state) => state.music
  );

  // Initialize session on mount
  React.useEffect(() => {
    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    dispatch(setSessionId(sessionId));
  }, [dispatch]);

  const requestCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      dispatch(setCameraPermission("granted"));
      dispatch(setCameraActive(true));
      // Stop the stream immediately as webcam component will handle it
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      dispatch(setCameraPermission("denied"));
      dispatch(setCameraActive(false));
    }
  }, [dispatch]);

  const toggleCamera = useCallback(() => {
    if (isCameraActive) {
      dispatch(setCameraActive(false));
    } else {
      requestCameraPermission();
    }
  }, [isCameraActive, requestCameraPermission, dispatch]);

  // Initialize models on mount
  useEffect(() => {
    const initializeServices = async () => {
      try {
        const { facialAnalysisService } = await import(
          "@/lib/services/facialAnalysisService"
        );
        await facialAnalysisService.loadModels();
        console.log("Facial analysis models loaded");
      } catch (error) {
        console.error("Failed to load facial analysis models:", error);
      }
    };

    initializeServices();
  }, []);

  const capturePhoto = useCallback(async () => {
    if (webcamRef.current) {
      try {
        dispatch(
          detectMood({
            method: "facial",
            imageData: "processing",
          })
        );

        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          // Convert base64 to image element for analysis
          const img = new Image();
          img.onload = async () => {
            try {
              const { facialAnalysisService } = await import(
                "@/lib/services/facialAnalysisService"
              );
              const result =
                await facialAnalysisService.analyzeFacialExpression(img);

              // Dispatch the real result
              dispatch(
                detectMood({
                  method: "facial",
                  imageData: imageSrc,
                  moodResult: {
                    mood: result.mood,
                    confidence: result.confidence,
                    expressions: result.expressions,
                    timestamp: new Date().toISOString(),
                  },
                })
              );
            } catch (error) {
              console.error("Facial analysis error:", error);
              // Fallback to mock detection
              dispatch(
                detectMood({
                  method: "facial",
                  imageData: imageSrc,
                })
              );
            }
          };
          img.src = imageSrc;
        }
      } catch (error) {
        console.error("Camera capture error:", error);
      }
    }
  }, [dispatch]);

  const analyzeText = useCallback(() => {
    if (textInput.trim()) {
      try {
        const result = textAnalysisService.analyzeEnhancedMood(
          textInput.trim()
        );

        dispatch(
          detectMood({
            method: "text",
            inputData: textInput.trim(),
            moodResult: {
              mood: result.mood,
              confidence: result.confidence,
              score: result.score,
              timestamp: new Date().toISOString(),
            },
          })
        );
      } catch (error) {
        console.error("Text analysis error:", error);
        // Fallback to basic API call
        dispatch(
          detectMood({
            method: "text",
            inputData: textInput.trim(),
          })
        );
      }
    }
  }, [textInput, dispatch]);

  const generatePlaylist = useCallback(() => {
    if (currentMood) {
      dispatch(
        generateMoodPlaylist({
          mood: currentMood,
          genre: preferences.preferredGenres,
          artists: preferences.preferredArtists,
          energyLevel: preferences.energyLevel,
          limit: 20,
        })
      );
    }
  }, [currentMood, preferences, dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearMoodError());
  }, [dispatch]);

  return (
    <Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <Psychology color="primary" />
        Mood Detection
      </Typography>

      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Camera Section */}
      {preferences.enableCamera && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Camera Analysis</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={isCameraActive}
                    onChange={toggleCamera}
                    icon={<VideocamOff />}
                    checkedIcon={<Videocam />}
                  />
                }
                label={isCameraActive ? "Camera On" : "Camera Off"}
              />
            </Box>

            {isCameraActive && cameraPermission === "granted" && (
              <Box sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    position: "relative",
                    display: "inline-block",
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "2px solid",
                    borderColor: "primary.main",
                  }}
                >
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    width={280}
                    height={210}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      width: 640,
                      height: 480,
                      facingMode: "user",
                    }}
                  />
                </Box>
                <Button
                  variant="contained"
                  onClick={capturePhoto}
                  disabled={isDetecting}
                  sx={{ mt: 2 }}
                  startIcon={
                    isDetecting ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Psychology />
                    )
                  }
                >
                  {isDetecting ? "Analyzing..." : "Analyze Mood"}
                </Button>
              </Box>
            )}

            {cameraPermission === "denied" && (
              <Alert severity="warning">
                Camera access denied. Please enable camera permissions to use
                facial mood detection.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Text Analysis Section */}
      {preferences.enableTextInput && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Text Analysis
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="How are you feeling today? Describe your mood..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="outlined"
              onClick={analyzeText}
              disabled={!textInput.trim() || isDetecting}
              startIcon={
                isDetecting ? <CircularProgress size={20} /> : <Send />
              }
            >
              {isDetecting ? "Analyzing..." : "Analyze Text"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Current Mood Display */}
      {currentMood && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Detected Mood
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={currentMood}
                sx={{
                  backgroundColor:
                    moodColors[currentMood] || moodColors.neutral,
                  color: "black",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  px: 2,
                  py: 1,
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Confidence: {Math.round(confidence * 100)}% • Method: {method}
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={confidence * 100}
              sx={{ mb: 2, height: 8, borderRadius: 4 }}
            />

            <Divider sx={{ my: 2 }} />

            {/* Generate Playlist Button */}
            <Button
              variant="contained"
              color="secondary"
              onClick={generatePlaylist}
              disabled={isLoadingRecommendations}
              fullWidth
              startIcon={
                isLoadingRecommendations ? (
                  <CircularProgress size={20} />
                ) : (
                  <Refresh />
                )
              }
            >
              {isLoadingRecommendations
                ? "Generating Playlist..."
                : "Generate Mood Playlist"}
            </Button>

            {recommendedPlaylist && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Playlist &ldquo;{recommendedPlaylist.name}&rdquo; generated
                successfully!
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            💡 <strong>Tips:</strong>
            <br />
            • Look directly at the camera for better facial analysis
            <br />
            • Describe your feelings in detail for text analysis
            <br />• Try different expressions to see how your mood changes
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
