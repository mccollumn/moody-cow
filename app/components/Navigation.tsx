"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { AccountCircle, Logout, Person, Settings } from "@mui/icons-material";

export default function Navigation() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
    handleClose();
  };

  const handleProfile = () => {
    router.push("/profile");
    handleClose();
  };

  return (
    <AppBar
      position="static"
      sx={{ background: "linear-gradient(45deg, #9c27b0, #2196f3)" }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
            cursor: "pointer",
          }}
          onClick={() => router.push("/")}
        >
          🐄 Moody Cow
        </Typography>

        {status === "loading" ? (
          <Chip label="Loading..." variant="outlined" />
        ) : session ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              label={`Welcome, ${session.user?.name || session.user?.email}`}
              variant="outlined"
              sx={{ color: "white", borderColor: "white" }}
            />
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              {session.user?.image ? (
                <Avatar
                  src={session.user.image}
                  alt={session.user.name || ""}
                />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>
                <Person sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <Settings sx={{ mr: 1 }} />
                Settings
              </MenuItem>
              <MenuItem onClick={handleSignOut}>
                <Logout sx={{ mr: 1 }} />
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              color="inherit"
              variant="outlined"
              onClick={() => router.push("/signin")}
              sx={{
                borderColor: "white",
                "&:hover": { borderColor: "rgba(255,255,255,0.7)" },
              }}
            >
              Sign In
            </Button>
            <Button
              color="inherit"
              variant="contained"
              onClick={() => router.push("/signup")}
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
              }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
