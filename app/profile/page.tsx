"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Chip,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Edit, MusicNote, Mood, History } from "@mui/icons-material";
import Navigation from "@/app/components/Navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  });

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const handleEditProfile = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      setEditOpen(false);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" mb={4}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mr: 3,
                background: "linear-gradient(45deg, #9c27b0, #2196f3)",
              }}
            >
              {session.user?.name?.[0] || session.user?.email?.[0] || "U"}
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom>
                {session.user?.name || "User"}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {session.user?.email}
              </Typography>
              <Chip
                label="Premium User"
                color="primary"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>
            <Box sx={{ ml: "auto" }}>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setEditOpen(true)}
              >
                Edit Profile
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
            <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <MusicNote color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Music Stats</Typography>
                  </Box>
                  <Typography variant="h3" color="primary">
                    247
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Songs discovered
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Mood color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Mood Analysis</Typography>
                  </Box>
                  <Typography variant="h3" color="primary">
                    89
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mood sessions
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <History color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Listening Time</Typography>
                  </Box>
                  <Typography variant="h3" color="primary">
                    127h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total listening
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              Recent Activity
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="body1" color="text.secondary">
                  No recent activity to display. Start discovering music to see
                  your activity here!
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Paper>

        {/* Edit Profile Dialog */}
        <Dialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={loading}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              disabled={loading}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleEditProfile}
              disabled={loading}
              variant="contained"
            >
              {loading ? <CircularProgress size={24} /> : "Save Changes"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
